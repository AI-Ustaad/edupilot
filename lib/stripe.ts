import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const PLANS = {
  free: { 
    id: "free", 
    name: "Free", 
    price: 0, 
    limits: { students: 50, staff: 10 } 
  },
  basic: { 
    id: "basic", 
    name: "Basic", 
    price: 29, 
    priceId: process.env.STRIPE_BASIC_PRICE_ID || "price_basic_placeholder", 
    limits: { students: 200, staff: 50 } 
  },
  pro: { 
    id: "pro", 
    name: "Pro", 
    price: 99, 
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_placeholder", 
    limits: { students: 1000, staff: 200 } 
  },
  enterprise: { 
    id: "enterprise", 
    name: "Enterprise", 
    price: 299, 
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_placeholder", 
    limits: { students: 9999, staff: 9999 } 
  },
};
