export const createApiResponse = (statusCode: number, messageOrData: any, data?: any, meta?: any) => {
  let finalMessage = "Success";
  let finalData = data;

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

// ✅ یہ فنکشن اب ایکسپورٹ ہو رہا ہے
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
