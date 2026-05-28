import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // کُکیز سے منتخب شدہ زبان پڑھیں، اگر نہ ملے تو ڈیفالٹ 'en' (انگریزی) رکھیں
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
