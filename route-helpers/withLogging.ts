export function withLogging(handler: Function) {
  return async (req: Request, context: any) => {
    console.log(`API Call: ${req.method} ${req.url}`);
    return handler(req, context);
  };
}
