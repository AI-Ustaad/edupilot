// یہ فنکشن اس بات کا خیال رکھتا ہے کہ اگر دوسرا آرگیومنٹ سٹرنگ نہیں ہے تو اسے 'data' مان لیا جائے
export const createApiResponse = (statusCode: number, messageOrData: any, data?: any, meta?: any) => {
  let finalMessage = "Success";
  let finalData = data;

  // اگر data undefined ہے اور messageOrData سٹرنگ نہیں ہے، تو اسے ڈیٹا مان لیں
  if (finalData === undefined && typeof messageOrData !== 'string') {
    finalData = messageOrData;
  } else {
    finalMessage = messageOrData;
  }

  return new Response(
    JSON.stringify({ 
      success: statusCode >= 200 && statusCode < 300, 
      message: finalMessage, 
      data: finalData, 
      meta 
    }), 
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

// نیا فنکشن جو ایرر ہینڈلنگ کے لیے درکار تھا
export const createErrorResponse = (statusCode: number, message: string, errors?: any[]) => {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message, 
      errors 
    }), 
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
