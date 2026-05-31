export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free",
    students: 50,
    staff: 10,
    ai: false,
    analytics: false,
    whiteLabel: false,
  },

  basic: {
    id: "basic",
    name: "Basic",
    students: 200,
    staff: 50,
    ai: true,
    analytics: false,
    whiteLabel: false,
  },

  pro: {
    id: "pro",
    name: "Professional",
    students: 1000,
    staff: 200,
    ai: true,
    analytics: true,
    whiteLabel: false,
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    students: 9999,
    staff: 9999,
    ai: true,
    analytics: true,
    whiteLabel: true,
  },
} as const;
