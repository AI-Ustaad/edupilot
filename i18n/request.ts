import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// تمام نئی زبانوں کو یہاں شامل کر دیا گیا ہے
const locales = ["en", "ur", "ar", "hi", "es", "fr", "zh"];

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  // یہ چیک کرتا ہے کہ اگر غلط زبان آئے تو انگریزی دکھائے
  const validLocale = locales.includes(locale) ? locale : "en";

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
