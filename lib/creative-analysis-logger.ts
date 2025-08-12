/**
 * Enhanced Creative Analysis Logger with Comprehensive Debugging and Troubleshooting
 * 
 * This logger provides detailed logging, error tracking, and troubleshooting information
 * for the "Start AI Analysis" function across the application.
 */

export interface CreativeAnalysisSession {
  id: string;
  creativeId: string | number;
  startTime: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  steps: AnalysisStep[];
  errors: AnalysisError[];
  performance: PerformanceMetrics;
  troubleshooting: TroubleshootingInfo;
}

export interface AnalysisStep {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: any;
  error?: string;
}

export interface AnalysisError {
  id: string;
  step: string;
  timestamp: Date;
  error: Error;
  context: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAction?: string;
  technicalDetails: string[];
}

export interface PerformanceMetrics {
  totalTime: number;
  webhookResponseTime: number;
  imageProcessingTime?: number;
  aiAnalysisTime?: number;
  networkLatency: number;
  memoryUsage?: number;
}

export interface TroubleshootingInfo {
  commonIssues: string[];
  suggestedActions: string[];
  technicalDetails: string[];
  supportResources: string[];
}

// Global session storage for debugging
export const activeSessions = new Map<string, CreativeAnalysisSession>();

/**
 * Creates a comprehensive creative analysis session with debugging capabilities
 */
export const createCreativeAnalysisSession = (creativeId: string | number): string => {
  const sessionId = `session_${creativeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: CreativeAnalysisSession = {
    id: sessionId,
    creativeId,
    startTime: new Date(),
    status: 'pending',
    steps: [],
    errors: [],
    performance: {
      totalTime: 0,
      webhookResponseTime: 0,
      networkLatency: 0
    },
    troubleshooting: {
      commonIssues: [],
      suggestedActions: [],
      technicalDetails: [],
      supportResources: []
    }
  };

  activeSessions.set(sessionId, session);
  
  console.log(`🔧 [${sessionId}] Created new analysis session for creative ${creativeId}`);
  return sessionId;
};

/**
 * Enhanced logging with step tracking and performance monitoring
 */
export const logCreativeAnalysis = (
  sessionId: string, 
  level: 'info' | 'warn' | 'error', 
  message: string, 
  data?: any
): void => {
  const timestamp = new Date().toISOString();
  const session = activeSessions.get(sessionId);
  
  if (session) {
    // Add step tracking
    const step: AnalysisStep = {
      id: `step_${Date.now()}`,
      name: message,
      startTime: new Date(),
      status: 'completed',
      details: data
    };
    
    session.steps.push(step);
  }

  // Enhanced console logging with emojis and formatting
  const emoji = level === 'info' ? 'ℹ️' : level === 'warn' ? '⚠️' : '❌';
  const levelColor = level === 'info' ? 'color: #0066cc' : level === 'warn' ? 'color: #ff9900' : 'color: #cc0000';
  
  console.group(`%c${emoji} [${timestamp}] [${level.toUpperCase()}] [${sessionId}] ${message}`, levelColor);
  if (data) {
    console.log('📊 Data:', data);
  }
  if (session) {
    console.log('📈 Session Status:', session.status);
    console.log('⏱️ Total Steps:', session.steps.length);
    console.log('❌ Errors:', session.errors.length);
  }
  console.groupEnd();
};

/**
 * Logs webhook calls with detailed debugging information
 */
export const logWebhookCall = (
  sessionId: string, 
  url: string, 
  payload: any
): void => {
  const session = activeSessions.get(sessionId);
  const step: AnalysisStep = {
    id: `webhook_call_${Date.now()}`,
    name: 'Webhook Call Initiated',
    startTime: new Date(),
    status: 'running',
    details: { url, payload }
  };
  
  if (session) {
    session.steps.push(step);
    session.status = 'running';
  }

  console.group(`🔗 [${sessionId}] Webhook Call Details`);
  console.log('🌐 URL:', url);
  console.log('📦 Payload:', payload);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🔍 Session Status:', session?.status || 'unknown');
  console.groupEnd();
};

/**
 * Enhanced webhook response logging with performance metrics
 */
export const logWebhookResponse = (
  sessionId: string, 
  response: Response, 
  body: string, 
  responseTime: number
): void => {
  const session = activeSessions.get(sessionId);
  const step = session?.steps.find(s => s.name === 'Webhook Call Initiated');
  
  if (step) {
    step.endTime = new Date();
    step.duration = responseTime;
    step.status = response.ok ? 'completed' : 'failed';
    step.details = { status: response.status, statusText: response.statusText, responseTime };
  }

  if (session) {
    session.performance.webhookResponseTime = responseTime;
    session.performance.networkLatency = responseTime;
    
    if (response.ok) {
      session.status = 'completed';
    } else {
      session.status = 'failed';
      addTroubleshootingInfo(session, 'webhook_failure', response.status, response.statusText);
    }
  }

  console.group(`📡 [${sessionId}] Webhook Response`);
  console.log('✅ Status:', response.status, response.statusText);
  console.log('⏱️ Response Time:', responseTime + 'ms');
  console.log('📄 Response Body:', body);
  console.log('🔍 Session Status:', session?.status || 'unknown');
  
  if (!response.ok) {
    console.warn('⚠️ Webhook call failed - check troubleshooting info');
    if (session) {
      console.log('🔧 Troubleshooting:', session.troubleshooting);
    }
  }
  console.groupEnd();
};

/**
 * Enhanced error logging with troubleshooting information
 */
export const logCreativeAnalysisError = (
  sessionId: string, 
  error: Error, 
  context?: any
): void => {
  const session = activeSessions.get(sessionId);
  
  const analysisError: AnalysisError = {
    id: `error_${Date.now()}`,
    step: context?.step || 'unknown',
    timestamp: new Date(),
    error,
    context,
    severity: determineErrorSeverity(error, context),
    userAction: getSuggestedUserAction(error, context),
    technicalDetails: getTechnicalDetails(error, context)
  };

  if (session) {
    session.errors.push(analysisError);
    session.status = 'failed';
    addTroubleshootingInfo(session, 'analysis_error', error.message, context);
  }

  console.group(`💥 [${sessionId}] Analysis Error`);
  console.error('❌ Error:', error);
  console.error('🔍 Context:', context);
  console.error('🚨 Severity:', analysisError.severity);
  console.error('👤 User Action:', analysisError.userAction);
  console.error('🔧 Technical Details:', analysisError.technicalDetails);
  
  if (session) {
    console.error('📊 Session Status:', session.status);
    console.error('🔧 Troubleshooting:', session.troubleshooting);
  }
  console.groupEnd();
};

/**
 * Enhanced success logging with performance metrics
 */
export const logCreativeAnalysisSuccess = (
  sessionId: string, 
  result: any, 
  totalTime: number
): void => {
  const session = activeSessions.get(sessionId);
  
  if (session) {
    session.status = 'completed';
    session.performance.totalTime = totalTime;
    
    const step: AnalysisStep = {
      id: `completion_${Date.now()}`,
      name: 'Analysis Completed Successfully',
      startTime: new Date(),
      status: 'completed',
      details: { result, totalTime }
    };
    
    session.steps.push(step);
  }

  console.group(`🎉 [${sessionId}] Analysis Success`);
  console.log('✅ Result:', result);
  console.log('⏱️ Total Time:', totalTime + 'ms');
  
  if (session) {
    console.log('📊 Performance Metrics:', session.performance);
    console.log('📈 Steps Completed:', session.steps.length);
    console.log('🔍 Final Status:', session.status);
  }
  console.groupEnd();
};

/**
 * Determines error severity based on error type and context
 */
function determineErrorSeverity(error: Error, context?: any): 'low' | 'medium' | 'high' | 'critical' {
  const errorMessage = error.message.toLowerCase();
  
  // Critical errors
  if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return 'critical';
  }
  
  // High severity errors
  if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'high';
  }
  
  // Medium severity errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Provides user-friendly action suggestions based on error type
 */
function getSuggestedUserAction(error: Error, context?: any): string {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return 'Check your Facebook access token and permissions. Try logging out and back in.';
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    return 'Check your internet connection. The AI service may be temporarily unavailable.';
  }
  
  if (errorMessage.includes('webhook')) {
    return 'Contact support - there may be a configuration issue with the AI analysis service.';
  }
  
  if (errorMessage.includes('validation')) {
    return 'Ensure the creative has valid image content and metadata.';
  }
  
  return 'Try refreshing the page and running the analysis again.';
}

/**
 * Extracts technical details for debugging
 */
function getTechnicalDetails(error: Error, context?: any): string[] {
  const details: string[] = [];
  
  if (error.stack) {
    details.push(`Stack trace: ${error.stack}`);
  }
  
  if (context?.creativeId) {
    details.push(`Creative ID: ${context.creativeId}`);
  }
  
  if (context?.adAccountId) {
    details.push(`Ad Account ID: ${context.adAccountId}`);
  }
  
  if (context?.imageUrl) {
    details.push(`Image URL: ${context.imageUrl}`);
  }
  
  return details;
}

/**
 * Adds troubleshooting information to the session
 */
function addTroubleshootingInfo(
  session: CreativeAnalysisSession, 
  issueType: string, 
  details: any, 
  context?: any
): void {
  const commonIssues = [
    'Facebook access token expired or invalid',
    'Network connectivity issues',
    'AI analysis service temporarily unavailable',
    'Creative image URL inaccessible',
    'Webhook configuration error'
  ];
  
  const suggestedActions = [
    'Refresh your Facebook login',
    'Check your internet connection',
    'Wait a few minutes and try again',
    'Verify the creative has valid image content',
    'Contact support if the issue persists'
  ];
  
  const technicalDetails = [
    `Issue Type: ${issueType}`,
    `Details: ${JSON.stringify(details)}`,
    `Context: ${JSON.stringify(context)}`,
    `Timestamp: ${new Date().toISOString()}`,
    `Session ID: ${session.id}`
  ];
  
  const supportResources = [
    'Facebook Developer Documentation',
    'AI Analysis Service Status Page',
    'Technical Support Contact',
    'Troubleshooting Guide'
  ];
  
  session.troubleshooting = {
    commonIssues,
    suggestedActions,
    technicalDetails,
    supportResources
  };
}

/**
 * Gets session information for debugging
 */
export const getSessionInfo = (sessionId: string): CreativeAnalysisSession | undefined => {
  return activeSessions.get(sessionId);
};

/**
 * Gets all active sessions for debugging
 */
export const getAllActiveSessions = (): CreativeAnalysisSession[] => {
  return Array.from(activeSessions.values());
};

/**
 * Cleans up completed sessions to prevent memory leaks
 */
export const cleanupCompletedSessions = (): void => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [sessionId, session] of Array.from(activeSessions.entries())) {
    if (session.status === 'completed' || session.status === 'failed') {
      const age = now.getTime() - session.startTime.getTime();
      if (age > maxAge) {
        activeSessions.delete(sessionId);
        console.log(`🧹 Cleaned up old session: ${sessionId}`);
      }
    }
  }
};

/**
 * Exports session data for debugging purposes
 */
export const exportSessionData = (sessionId: string): string => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return 'Session not found';
  }
  
  return JSON.stringify(session, null, 2);
};

// Auto-cleanup every hour
setInterval(cleanupCompletedSessions, 60 * 60 * 1000);
