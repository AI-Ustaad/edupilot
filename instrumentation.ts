import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://657a31eac19d59a38ca535a70ea8ee0b@o4511506155831296.ingest.de.sentry.io/4511506183028816",
  tracesSampleRate: 1.0,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: false, // 🛡️ GDPR Compliance
  // ✅ Removed replayIntegration and captureRouterTransitionStart to fix import errors
});

// ✅ Safe fallback if the export doesn't exist
export const onRouterTransitionStart = (Sentry as any).captureRouterTransitionStart || (() => {});
