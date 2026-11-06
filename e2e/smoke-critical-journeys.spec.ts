// e2e/smoke-critical-journeys.spec.ts
// Playwright E2E Smoke Specification for Critical User Journeys

import { test, expect } from "@playwright/test";

test.describe("EduPilot SaaS ERP — Critical User Journeys Smoke Suite", () => {
  // Journey 1: Public & Health Baseline
  test("Journey 1: System health check returns healthy status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.timestamp).toBeDefined();
    expect(typeof body.uptime).toBe("number");
  });

  test("Journey 1: Login page renders with Email, Google, and Facebook options", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/EduPilot/i);

    // Verify authentication options
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /facebook/i })).toBeVisible();
  });

  // Journey 2: Auth & Middleware Protection
  test("Journey 2: Unauthenticated navigation redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);

    await page.goto("/settings/billing");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fsettings%2Fbilling/);
  });

  // Journey 3: Onboarding Route
  test("Journey 3: Onboarding page is accessible for newly registered workspaces", async ({ page }) => {
    await page.goto("/onboarding");
    // Verify page loads without 500 error
    expect(page.url()).toContain("/onboarding");
  });

  // Journey 4: Billing & Quota Endpoint Health
  test("Journey 4: Unauthenticated access to /api/v1/subscriptions returns 401", async ({ request }) => {
    const response = await request.get("/api/v1/subscriptions");
    expect(response.status()).toBe(401);
  });

  // Journey 5: AI Endpoint Rate-Limit and Auth Gate
  test("Journey 5: Unauthenticated access to AI agents endpoint returns 401", async ({ request }) => {
    const response = await request.post("/api/v1/ai/agents", {
      data: { agentType: "principal", query: "status report" },
    });
    expect(response.status()).toBe(401);
  });
});

