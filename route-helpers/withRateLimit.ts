// عارضی – اگر آپ کے پاس ریٹ لیمٹنگ نہیں ہے تو اسے نظر انداز کریں
export function withRateLimit(handler: Function) {
  return async (req: Request, context: any) => {
    // TODO: implement rate limiting
    return handler(req, context);
  };
}
