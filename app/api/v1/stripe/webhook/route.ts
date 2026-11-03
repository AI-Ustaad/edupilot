export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { PLANS, getPlanByPriceId } from "@/lib/config/subscription-plans";
import { logger } from "@/lib/logger/logger";
import { SubscriptionService } from "@/services/subscription.service";
import { InvoiceService } from "@/services/invoice.service";
import Stripe from "stripe";

const subscriptionService = new SubscriptionService();
const invoiceService = new InvoiceService();

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  // 1. Cryptographic Signature & Header Check
  if (!signature) {
    logger.warn("Stripe webhook missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder"
    );
  } catch (error: any) {
    logger.error("Webhook signature verification failed:", { metadata: { error: error.message } });
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error.message}` },
      { status: 400 }
    );
  }

  // 2. Idempotency & Replay Protection
  const eventRef = adminDb.collection("webhook_events").doc(event.id);
  const existingEvent = await eventRef.get();
  if (existingEvent.exists) {
    logger.info(`Stripe webhook event ${event.id} already processed. Deduplicating.`);
    return NextResponse.json({ received: true, deduplicated: true }, { status: 200 });
  }

  // 3. Event Processing Lifecycle
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = (session.metadata?.tenantId || session.client_reference_id) as string;
        const planTier = (session.metadata?.planTier || session.metadata?.planId) as string;

        if (tenantId && planTier) {
          const planConfig = PLANS[planTier] || PLANS.free;
          await subscriptionService.activateSubscription(tenantId, planConfig.id, undefined, {
            stripeCustomerId: (session.customer as string) || undefined,
            stripeSubscriptionId: (session.subscription as string) || undefined,
            status: "active",
            maxStudents: planConfig.maxStudents,
            maxStaff: planConfig.maxStaff,
            cancelAtPeriodEnd: false,
          });

          await subscriptionService.updateSubscription(tenantId, {
            stripeCustomerId: (session.customer as string) || undefined,
            stripeSubscriptionId: (session.subscription as string) || undefined,
            status: "active",
            planId: planConfig.id,
            maxStudents: planConfig.maxStudents,
            maxStaff: planConfig.maxStaff,
            cancelAtPeriodEnd: false,
          });

          logger.info(`Tenant ${tenantId} activated plan ${planConfig.id} via session ${session.id}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        let tenantId = subscription.metadata?.tenantId as string;

        if (!tenantId) {
          const existingSub = await subscriptionService.findByStripeSubscriptionId(subscription.id);
          if (existingSub) {
            tenantId = existingSub.tenantId;
          } else if (subscription.customer) {
            const existingByCust = await subscriptionService.findByStripeCustomerId(
              subscription.customer as string
            );
            if (existingByCust) tenantId = existingByCust.tenantId;
          }
        }

        if (tenantId) {
          let planTier = subscription.metadata?.planTier || subscription.metadata?.planId;
          if (!planTier && subscription.items?.data?.[0]?.price?.id) {
            const priceId = subscription.items.data[0].price.id;
            const matchedPlan = getPlanByPriceId(priceId);
            if (matchedPlan) planTier = matchedPlan.id;
          }

          const planConfig = planTier ? (PLANS[planTier] || PLANS.free) : undefined;

          let status: "active" | "canceled" | "trialing" | "past_due" = "active";
          if (subscription.status === "past_due" || subscription.status === "unpaid") {
            status = "past_due";
          } else if (subscription.status === "canceled" || subscription.status === "incomplete_expired") {
            status = "canceled";
          } else if (subscription.status === "trialing") {
            status = "trialing";
          } else if (subscription.status === "active") {
            status = "active";
          }

          const updatePayload: Record<string, any> = {
            status,
            stripeSubscriptionId: subscription.id,
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            currentPeriodStart: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000)
              : new Date(),
          };

          if (subscription.customer) {
            updatePayload.stripeCustomerId = subscription.customer as string;
          }

          if (planConfig) {
            updatePayload.planId = planConfig.id;
            updatePayload.maxStudents = planConfig.maxStudents;
            updatePayload.maxStaff = planConfig.maxStaff;
          }

          await subscriptionService.updateSubscription(tenantId, updatePayload);
          logger.info(`Tenant ${tenantId} subscription updated: status=${status}, cancelAtPeriodEnd=${subscription.cancel_at_period_end}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        let tenantId = subscription.metadata?.tenantId as string;

        if (!tenantId) {
          const existingSub = await subscriptionService.findByStripeSubscriptionId(subscription.id);
          if (existingSub) {
            tenantId = existingSub.tenantId;
          } else if (subscription.customer) {
            const existingByCust = await subscriptionService.findByStripeCustomerId(
              subscription.customer as string
            );
            if (existingByCust) tenantId = existingByCust.tenantId;
          }
        }

        if (tenantId) {
          // Gracefully transition tenant back to the free tier (50 students / 10 staff limit)
          // ZERO ORPHANED STATES: No student or staff records are deleted or corrupted.
          await subscriptionService.cancelSubscription(tenantId);
          logger.info(`Tenant ${tenantId} subscription deleted in Stripe. Gracefully reverted to Free tier.`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        let tenantId = (invoice.metadata?.tenantId || (invoice as any).subscription_details?.metadata?.tenantId) as string;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : (invoice.subscription as any)?.id;

        if (!tenantId && subId) {
          const existingSub = await subscriptionService.findByStripeSubscriptionId(subId);
          if (existingSub) tenantId = existingSub.tenantId;
        }

        if (!tenantId && invoice.customer) {
          const existingByCust = await subscriptionService.findByStripeCustomerId(invoice.customer as string);
          if (existingByCust) tenantId = existingByCust.tenantId;
        }

        if (tenantId) {
          await subscriptionService.updateSubscription(tenantId, {
            status: "past_due",
          });
          logger.warn(`Tenant ${tenantId} payment failed for invoice ${invoice.id}. Set to past_due.`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        let tenantId = (invoice.metadata?.tenantId || (invoice as any).subscription_details?.metadata?.tenantId) as string;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : (invoice.subscription as any)?.id;

        if (!tenantId && subId) {
          const existingSub = await subscriptionService.findByStripeSubscriptionId(subId);
          if (existingSub) tenantId = existingSub.tenantId;
        }

        if (!tenantId && invoice.customer) {
          const existingByCust = await subscriptionService.findByStripeCustomerId(invoice.customer as string);
          if (existingByCust) tenantId = existingByCust.tenantId;
        }

        if (tenantId) {
          await invoiceService.createFromStripe({
            tenantId,
            stripeInvoiceId: invoice.id,
            amountPaid: invoice.amount_paid / 100,
            currency: invoice.currency,
            periodStart: new Date(invoice.period_start * 1000),
            periodEnd: new Date(invoice.period_end * 1000),
          });
          await subscriptionService.updateSubscription(tenantId, { status: "active" });
          logger.info(`Tenant ${tenantId} payment succeeded for invoice ${invoice.id}.`);
        }
        break;
      }

      default:
        logger.info(`Unhandled Stripe webhook event type: ${event.type}`);
    }

    // 4. Mark Event Processed for Replay Protection
    await eventRef.set({
      eventId: event.id,
      type: event.type,
      processedAt: new Date().toISOString(),
      livemode: event.livemode,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    logger.error("Stripe Webhook Processing Error:", { metadata: { error: error.message } });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
