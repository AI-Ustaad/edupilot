import { adminDb } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    logger.error("Webhook Error:", { metadata: { error: error.message } });
    return createErrorResponse(400, `Webhook Error: ${error.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId as string;
        const planId = session.metadata?.planId as string;

        if (tenantId && planId) {
          // Update Subscription in Firestore
          await adminDb.collection("subscriptions").doc(tenantId).set({
            tenantId,
            planId,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            updatedAt: new Date(),
          }, { merge: true });
          
          logger.info(`Tenant ${tenantId} upgraded to ${planId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const tenantId = invoice.metadata?.tenantId as string;
        
        if (tenantId) {
          // Save Invoice Record for Audit/Accounting
          await adminDb.collection("invoices").add({
            tenantId,
            stripeInvoiceId: invoice.id,
            amountPaid: invoice.amount_paid / 100,
            currency: invoice.currency,
            periodStart: new Date(invoice.period_start * 1000),
            periodEnd: new Date(invoice.period_end * 1000),
            createdAt: new Date(),
          });
          
          // Ensure status is active
          await adminDb.collection("subscriptions").doc(tenantId).set({
            status: "active"
          }, { merge: true });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId as string;

        if (tenantId) {
          // Downgrade to Free Plan on Cancellation
          await adminDb.collection("subscriptions").doc(tenantId).set({
            planId: "free",
            status: "canceled",
            updatedAt: new Date(),
          }, { merge: true });
          
          logger.info(`Tenant ${tenantId} subscription canceled. Downgraded to free.`);
        }
        break;
      }

      default:
        // Unhandled event type
        logger.info(`Unhandled event type ${event.type}`);
    }

    return createSuccessResponse({ received: true });
  } catch (error: any) {
    logger.error("Stripe Webhook Processing Error:", { metadata: { error: error.message } });
    return createErrorResponse(500, "Internal Server Error");
  }
}
