// Stub creative analysis logger for Latest branch compatibility
// These are placeholder functions that allow the AI analysis functionality to work
// without breaking the build when the full logging system isn't available

export const createCreativeAnalysisSession = (creativeId: string | number): string => {
  // Generate a simple session ID
  return `session_${creativeId}_${Date.now()}`;
};

export const logCreativeAnalysis = (
  sessionId: string, 
  level: 'info' | 'warn' | 'error', 
  message: string, 
  data?: any
): void => {
  // Simple console logging as fallback
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] [${sessionId}] ${message}`, data || '');
};

export const logWebhookCall = (
  sessionId: string, 
  url: string, 
  payload: any
): void => {
  console.log(`[${sessionId}] Webhook call to: ${url}`, payload);
};

export const logWebhookResponse = (
  sessionId: string, 
  response: Response, 
  body: string, 
  responseTime: number
): void => {
  console.log(`[${sessionId}] Webhook response: ${response.status} ${response.statusText} (${responseTime}ms)`, body);
};

export const logCreativeAnalysisError = (
  sessionId: string, 
  error: Error, 
  context?: any
): void => {
  console.error(`[${sessionId}] Creative analysis error:`, error.message, context || '');
};

export const logCreativeAnalysisSuccess = (
  sessionId: string, 
  result: any, 
  totalTime: number
): void => {
  console.log(`[${sessionId}] Creative analysis completed successfully in ${totalTime}ms:`, result);
};
