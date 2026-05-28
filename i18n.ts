import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  // اگر لوکل درست نہ ہو تو ڈیفالٹ انگریزی
  if (!locale || !["en", "ur"].includes(locale)) {
    locale = "en";
  }
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
