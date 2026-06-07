// instrumentation-client.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://657a31eac19d59a38ca535a70ea8ee0b@o4511506155831296.ingest.de.sentry.io/4511506183028816",
  tracesSampleRate: 1.0,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // 🛡️ GDPR Compliance: Disable PII collection
  sendDefaultPii: false, 
  // 🛡️ Mask all inputs and text in replays to protect student data
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
});

// 🛡️ Safe fallback for deprecated API
export const onRouterTransitionStart = (Sentry as any).captureRouterTransitionStart || (() => {});
