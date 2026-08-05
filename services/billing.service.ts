import { stripe, PLANS } from "@/lib/stripe";
import Stripe from "stripe";
import { SubscriptionService } from "@/services/subscription.service";
import { InvoiceService } from "@/services/invoice.service";
import { SubscriptionRepository } from "@/repositories/subscription.repository";
import { InvoiceRepository } from "@/repositories/invoice.repository";
import { TenantRepository } from "@/repositories/tenant.repository";
import { logger } from "@/lib/logger/logger";
import type { IBillingService } from "@/interfaces/IBillingService";

export class BillingService implements IBillingService {
  private subscriptionService: SubscriptionService;
  private invoiceService: InvoiceService;
  private subscriptionRepo: SubscriptionRepository;
  private invoiceRepo: InvoiceRepository;
  private tenantRepo: TenantRepository;

  constructor(
    subscriptionService?: SubscriptionService,
    invoiceService?: InvoiceService,
    subscriptionRepo?: SubscriptionRepository,
    invoiceRepo?: InvoiceRepository,
    tenantRepo?: TenantRepository
  ) {
    this.subscriptionService = subscriptionService ?? new SubscriptionService();
    this.invoiceService = invoiceService ?? new InvoiceService();
    this.subscriptionRepo = subscriptionRepo ?? new SubscriptionRepository();
    this.invoiceRepo = invoiceRepo ?? new InvoiceRepository();
    this.tenantRepo = tenantRepo ?? new TenantRepository();
  }

  async createCheckoutSession(customerId: string, planId: string, tenantId: string): Promise<{ url?: string }> {
    const plan = Object.values(PLANS).find(p => p.id === planId);
    if (!plan) {
      throw new Error("Invalid plan");
    }

    if (plan.price === 0) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/subscriptions/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, tenantId }),
      });
      return { url: "/settings/billing?success=true" };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/billing?canceled=true`,
      metadata: { tenantId, planId: plan.id },
      client_reference_id: tenantId,
    });

    return { url: session.url ?? undefined };
  }

  async processWebhook(payload: string, signature: string): Promise<{ received: boolean }> {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId as string;
        const planId = session.metadata?.planId as string;

        if (tenantId && planId) {
          await this.subscriptionService.activateSubscription(tenantId, planId);
          await this.subscriptionService.updateSubscription(tenantId, {
            stripeCustomerId: session.customer as string | null,
            stripeSubscriptionId: session.subscription as string | null,
          });
          logger.info(`Tenant ${tenantId} upgraded to ${planId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const tenantId = invoice.metadata?.tenantId as string;

        if (tenantId) {
          await this.invoiceService.createFromStripe({
            tenantId,
            stripeInvoiceId: invoice.id,
            amountPaid: invoice.amount_paid / 100,
            currency: invoice.currency,
            periodStart: new Date(invoice.period_start * 1000),
            periodEnd: new Date(invoice.period_end * 1000),
          });

          await this.subscriptionService.updateSubscription(tenantId, { status: "active" });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId as string;

        if (tenantId) {
          await this.subscriptionService.cancelSubscription(tenantId);
          logger.info(`Tenant ${tenantId} subscription canceled. Downgraded to free.`);
        }
        break;
      }

      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  async getSubscription(tenantId: string): Promise<any> {
    return this.subscriptionRepo.findByTenant(tenantId);
  }

  async activateSubscription(tenantId: string, planId: string): Promise<any> {
    return this.subscriptionService.activateSubscription(tenantId, planId);
  }

  async cancelSubscription(tenantId: string): Promise<void> {
    return this.subscriptionService.cancelSubscription(tenantId);
  }

  async generateInvoice(tenantId: string, period: string): Promise<any> {
    const subscription = await this.subscriptionRepo.findByTenant(tenantId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    const id = await this.invoiceRepo.create({
      tenantId,
      amount: 0,
      currency: "usd",
      status: "draft",
      dueDate: new Date(period),
    }, tenantId);
    return { id };
  }
}

export const billingService = new BillingService();
