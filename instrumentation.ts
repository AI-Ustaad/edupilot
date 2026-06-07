import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://657a31eac19d59a38ca535a70ea8ee0b@o4511506155831296.ingest.de.sentry.io/4511506183028816",
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: false, // 🛡️ CRITICAL: Disable PII for GDPR compliance
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
