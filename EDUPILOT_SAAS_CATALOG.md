# EduPilot SaaS Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of SaaS components

---

## Subscription Plans

| Plan | ID | Price | Max Students | Max Staff | Evidence |
|------|----|-------|--------------|-----------|----------|
| Free | free | 0 PKR | 50 | 10 | lib/config/subscription-plans.ts |
| Starter | starter | 2000 PKR | 200 | 50 | lib/config/subscription-plans.ts |
| Professional | professional | 3000 PKR | 1000 | 200 | lib/config/subscription-plans.ts |
| Enterprise | enterprise | 5000 PKR | 999999 | 999999 | lib/config/subscription-plans.ts |

## Stripe Integration

| Component | File | Status |
|-----------|------|--------|
| Stripe Client | lib/stripe.ts | ✅ Active |
| Create Checkout | app/api/v1/stripe/create-checkout/route.ts | ✅ Active |
| Webhook Handler | app/api/v1/stripe/webhook/route.ts | ✅ Active |
| Subscription Sync | services/subscription.service.ts | ✅ Active |

## Feature Flags

| Component | File | Status |
|-----------|------|--------|
| Feature Flags Config | lib/config/featureFlags.ts | ✅ Active |
| Feature Flag Service | services/featureFlag.service.ts | ✅ Active |
| Usage Limits | lib/config/subscription-plans.ts | ✅ Active |

## Tenant Management

| Component | File | Status |
|-----------|------|--------|
| Tenant Middleware | route-helpers/withTenant.ts | ✅ Active |
| Tenant Context | types/tenant.ts | ✅ Active |
| Tenant Repository | repositories/tenant.repository.ts | ✅ Active |
| Tenant Creation | app/api/v1/users/register-school/route.ts | ✅ Active |

## Billing Components

| Component | File | Status |
|-----------|------|--------|
| Subscription Service | services/subscription.service.ts | ✅ Active |
| Subscription Repository | repositories/subscription.repository.ts | ✅ Active |
| Invoice Service | MISSING | ❌ NOT FOUND |
| Payment History | MISSING | ❌ NOT FOUND |
| Proration Logic | MISSING | ❌ NOT FOUND |

## Notifications

| Component | File | Status |
|-----------|------|--------|
| Email (Resend) | lib/email.ts | ✅ Active |
| SMS (Twilio) | lib/notifications.ts | ✅ Active |
| In-App (Pusher) | lib/pusher/client.ts | ✅ Active |
| Push (Firebase) | lib/firebase/client.ts | ✅ Active |
| Notification Service | services/NotificationService.ts | ✅ Active |
| Notification Queue | MISSING | ❌ NOT FOUND |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
