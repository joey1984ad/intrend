// Enhanced creative analysis logger with comprehensive debugging capabilities
// This provides detailed logging, performance tracking, and error reporting for AI analysis

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  sessionId: string;
  message: string;
  data?: any;
  performance?: {
    phase: string;
    duration: number;
    totalTime: number;
  };
}

export interface ErrorContext {
  creativeId: string | number;
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  sessionId: string;
  timestamp: string;
  totalTime: number;
  additionalData?: any;
}

export interface SuccessContext {
  sessionId: string;
  result: any;
  totalTime: number;
  performanceMetrics?: {
    validationTime: number;
    networkTime: number;
    processingTime: number;
    totalTime: number;
  };
}

// In-memory log storage for debugging (can be enhanced with persistent storage)
const logStorage: LogEntry[] = [];
const MAX_LOG_ENTRIES = 1000;

export const createCreativeAnalysisSession = (creativeId: string | number): string => {
  // Generate a unique session ID with timestamp and creative ID
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `session_${creativeId}_${timestamp}_${randomId}`;
};

export const logCreativeAnalysis = (
  sessionId: string, 
  level: 'info' | 'warn' | 'error', 
  message: string, 
  data?: any,
  performance?: { phase: string; duration: number; totalTime: number }
): void => {
  const timestamp = new Date().toISOString();
  const logEntry: LogEntry = {
    timestamp,
    level,
    sessionId,
    message,
    data,
    performance
  };

  // Store log entry
  logStorage.push(logEntry);
  if (logStorage.length > MAX_LOG_ENTRIES) {
    logStorage.shift(); // Remove oldest entry
  }

  // Enhanced console logging with formatting
  const emoji = getLevelEmoji(level);
  const levelUpper = level.toUpperCase();
  const timeStr = new Date(timestamp).toLocaleTimeString();
  
  console.group(`${emoji} [${timeStr}] [${levelUpper}] [${sessionId}]`);
  console.log(`📝 ${message}`);
  
  if (data) {
    console.log('📊 Data:', data);
  }
  
  if (performance) {
    console.log('⏱️ Performance:', {
      phase: performance.phase,
      duration: `${performance.duration}ms`,
      totalTime: `${performance.totalTime}ms`
    });
  }
  
  console.groupEnd();

  // Additional logging for errors
  if (level === 'error') {
    console.error(`🚨 ERROR DETAILS for session ${sessionId}:`, {
      message,
      data,
      performance,
      timestamp,
      sessionId
    });
  }
};

export const logWebhookCall = (
  sessionId: string, 
  url: string, 
  payload: any
): void => {
  const timestamp = Date.now();
  logCreativeAnalysis(sessionId, 'info', '🌐 Webhook call initiated', {
    url,
    payload,
    timestamp,
    payloadSize: JSON.stringify(payload).length
  });
};

export const logWebhookResponse = (
  sessionId: string, 
  response: Response, 
  body: string, 
  responseTime: number
): void => {
  logCreativeAnalysis(sessionId, 'info', '📡 Webhook response received', {
    status: response.status,
    statusText: response.statusText,
    responseTime,
    responseLength: body.length,
    headers: Object.fromEntries(response.headers.entries()),
    body: body.length > 500 ? body.substring(0, 500) + '...' : body
  });
};

export const logCreativeAnalysisError = (
  sessionId: string, 
  error: Error, 
  context?: ErrorContext
): void => {
  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context: context || {}
  };

  logCreativeAnalysis(sessionId, 'error', '❌ Creative analysis error occurred', errorDetails);
  
  // Log to browser console with detailed error information
  console.group(`🚨 AI ANALYSIS ERROR - Session ${sessionId}`);
  console.error('Error Details:', errorDetails);
  console.error('Full Error Object:', error);
  if (context) {
    console.error('Error Context:', context);
  }
  console.groupEnd();
};

export const logCreativeAnalysisSuccess = (
  sessionId: string, 
  result: any, 
  totalTime: number
): void => {
  const successData = {
    result,
    totalTime,
    timestamp: new Date().toISOString(),
    sessionId
  };

  logCreativeAnalysis(sessionId, 'info', '✅ Creative analysis completed successfully', successData, {
    phase: 'completion',
    duration: totalTime,
    totalTime
  });
  
  // Log success to console
  console.group(`🎉 AI ANALYSIS SUCCESS - Session ${sessionId}`);
  console.log('Result:', result);
  console.log('Total Time:', `${totalTime}ms`);
  console.log('Session ID:', sessionId);
  console.groupEnd();
};

// Performance tracking functions
export const startPerformanceTimer = (sessionId: string, phase: string): (() => void) => {
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    logCreativeAnalysis(sessionId, 'info', `⏱️ Phase completed: ${phase}`, {
      phase,
      duration,
      timestamp: new Date().toISOString()
    });
  };
};

// Debug utilities
export const getSessionLogs = (sessionId: string): LogEntry[] => {
  return logStorage.filter(entry => entry.sessionId === sessionId);
};

export const getAllLogs = (): LogEntry[] => {
  return [...logStorage];
};

export const clearLogs = (): void => {
  logStorage.length = 0;
  console.log('🧹 All logs cleared');
};

export const exportLogs = (): string => {
  const logData = {
    exportTimestamp: new Date().toISOString(),
    totalEntries: logStorage.length,
    logs: logStorage
  };
  
  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-analysis-logs-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  return JSON.stringify(logData, null, 2);
};

// Helper function to get emoji for log level
const getLevelEmoji = (level: string): string => {
  switch (level) {
    case 'info': return 'ℹ️';
    case 'warn': return '⚠️';
    case 'error': return '❌';
    default: return '📝';
  }
};

// Debug mode toggle
let debugMode = false;

export const setDebugMode = (enabled: boolean): void => {
  debugMode = enabled;
  console.log(`🔧 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
};

export const isDebugMode = (): boolean => debugMode;

// Enhanced logging when debug mode is enabled
export const debugLog = (sessionId: string, message: string, data?: any): void => {
  if (debugMode) {
    logCreativeAnalysis(sessionId, 'info', `🔍 DEBUG: ${message}`, data);
  }
};

// Performance monitoring
export const logPerformanceMetric = (
  sessionId: string,
  metricName: string,
  value: number,
  unit: string = 'ms'
): void => {
  logCreativeAnalysis(sessionId, 'info', `📊 Performance Metric: ${metricName}`, {
    metricName,
    value,
    unit,
    timestamp: new Date().toISOString()
  });
};

// Network diagnostics
export const logNetworkDiagnostics = (
  sessionId: string,
  url: string,
  method: string,
  headers: Record<string, string>,
  payloadSize: number
): void => {
  logCreativeAnalysis(sessionId, 'info', '🌐 Network request diagnostics', {
    url,
    method,
    headers,
    payloadSize,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
};
