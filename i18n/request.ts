import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// تمام زبانیں جو ہم نے سپورٹ کرنی ہیں
const locales = ["en", "ur", "ar", "hi", "es", "fr", "zh"];

export default getRequestConfig(async () => {
  // کُکیز سے زبان حاصل کریں
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  // چیک کریں کہ آیا منتخب زبان ہماری لسٹ میں ہے یا نہیں
  const validLocale = locales.includes(locale) ? locale : "en";

  return {
    locale: validLocale,
    // زبان کے مطابق JSON فائل لوڈ کریں
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
