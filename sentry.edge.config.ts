// sentry.edge.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://657a31eac19d59a38ca535a70ea8ee0b@o4511506155831296.ingest.de.sentry.io/4511506183028816",
  tracesSampleRate: 1,
  enableLogs: true,
  // 🛡️ Changed from true to false
  sendDefaultPii: false, 
});
