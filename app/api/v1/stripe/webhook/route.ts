import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { SubscriptionService } from "@/services/subscription.service";
import { InvoiceService } from "@/services/invoice.service";
import Stripe from "stripe";

const subscriptionService = new SubscriptionService();
const invoiceService = new InvoiceService();

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId as string;
        const planId = session.metadata?.planId as string;

        if (tenantId && planId) {
          await subscriptionService.activateSubscription(tenantId, planId);
          await subscriptionService.updateSubscription(tenantId, {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          });
          logger.info(`Tenant ${tenantId} upgraded to ${planId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const tenantId = (invoice.metadata?.tenantId || (invoice as any).subscription_details?.metadata?.tenantId) as string;

        if (!tenantId) {
          throw new Error(`Stripe invoice ${invoice.id} is missing tenant metadata`);
        }

        await invoiceService.createFromStripe({
          tenantId,
          stripeInvoiceId: invoice.id,
          amountPaid: invoice.amount_paid / 100,
          currency: invoice.currency,
          periodStart: new Date(invoice.period_start * 1000),
          periodEnd: new Date(invoice.period_end * 1000),
        });

        await subscriptionService.updateSubscription(tenantId, { status: "active" });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId as string;

        if (!tenantId) {
          throw new Error(`Stripe subscription ${subscription.id} is missing tenant metadata`);
        }
        await subscriptionService.cancelSubscription(tenantId);
        logger.info(`Tenant ${tenantId} subscription canceled. Downgraded to free.`);
        break;
      }

      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    return createSuccessResponse({ received: true });
  } catch (error: any) {
    logger.error("Stripe Webhook Processing Error:", { metadata: { error: error.message } });
    return createErrorResponse(500, "Internal Server Error");
  }
}
