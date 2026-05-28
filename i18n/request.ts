// i18n/request.ts کا درست طریقہ
export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const validLocale = locales.includes(locale) ? locale : "en";

  return {
    locale: validLocale,
    // یقینی بنائیں کہ یہ پاتھ آپ کے پروجیکٹ سٹرکچر سے میل کھاتا ہے
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
