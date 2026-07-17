import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Re-export plans from the single source of truth
export { PLANS, getStripePriceId } from "@/lib/config/subscription-plans";
