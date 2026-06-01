import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature")!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Type assertion: checkout session event's data.object is a Stripe.Checkout.Session
  const session = event.data.object as Stripe.Checkout.Session;
  const tenantId = session.metadata?.tenantId;
  const planId = session.metadata?.planId;

  if (!tenantId || !planId) {
    console.error("Missing metadata in webhook");
    return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await adminDb.collection("subscriptions").doc(tenantId).set({
      planId,
      status: "active",
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    }, { merge: true });
  } else if (event.type === "customer.subscription.deleted") {
    await adminDb.collection("subscriptions").doc(tenantId).update({ status: "canceled" });
  }

  return NextResponse.json({ received: true });
}
