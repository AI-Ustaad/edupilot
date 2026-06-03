import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ur", "ar", "hi", "es", "fr", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
