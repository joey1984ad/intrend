export interface CreativeAnalysisLogEntry {
  timestamp: string;
  requestId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  error?: Error;
  duration?: number;
}

export interface CreativeAnalysisSession {
  sessionId: string;
  creativeId: string;
  startTime: number;
  logs: CreativeAnalysisLogEntry[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: string;
}

class CreativeAnalysisLogger {
  private sessions: Map<string, CreativeAnalysisSession> = new Map();
  private maxLogsPerSession = 100;

  createSession(creativeId: string): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CreativeAnalysisSession = {
      sessionId,
      creativeId,
      startTime: Date.now(),
      logs: [],
      status: 'pending'
    };

    this.sessions.set(sessionId, session);
    
    // Log session creation
    this.log(sessionId, 'info', 'Creative analysis session created', { creativeId });
    
    return sessionId;
  }

  log(sessionId: string, level: CreativeAnalysisLogEntry['level'], message: string, data?: any, error?: Error) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`No session found for ID: ${sessionId}`);
      return;
    }

    const entry: CreativeAnalysisLogEntry = {
      timestamp: new Date().toISOString(),
      requestId: sessionId,
      level,
      message,
      data,
      error
    };

    // Add to session logs
    session.logs.push(entry);
    
    // Limit log entries per session
    if (session.logs.length > this.maxLogsPerSession) {
      session.logs = session.logs.slice(-this.maxLogsPerSession);
    }

    // Console output with emojis for easy identification
    const emoji = this.getLevelEmoji(level);
    const prefix = `[${emoji} Creative Analysis] [${sessionId}]`;
    
    switch (level) {
      case 'info':
        console.log(`${prefix} ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case 'error':
        console.error(`${prefix} ${message}`, data || '', error || '');
        break;
      case 'debug':
        console.debug(`${prefix} ${message}`, data || '');
        break;
    }
  }

  private getLevelEmoji(level: CreativeAnalysisLogEntry['level']): string {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'debug': return '🔍';
      default: return '📝';
    }
  }

  updateSessionStatus(sessionId: string, status: CreativeAnalysisSession['status'], error?: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      if (error) {
        session.error = error;
      }
      
      this.log(sessionId, 'info', `Session status updated to: ${status}`, { 
        previousStatus: session.status,
        error: error || null,
        duration: Date.now() - session.startTime
      });
    }
  }

  logWebhookCall(sessionId: string, webhookUrl: string, payload: any) {
    this.log(sessionId, 'info', 'Initiating webhook call to n8n', {
      webhookUrl,
      payloadKeys: Object.keys(payload),
      payloadSize: JSON.stringify(payload).length,
      timestamp: new Date().toISOString()
    });
  }

  logWebhookResponse(sessionId: string, response: Response, responseBody: string, duration: number) {
    const isSuccess = response.ok;
    const level = isSuccess ? 'info' : 'error';
    
    this.log(sessionId, level, `Webhook response received`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      duration,
      success: isSuccess
    });
  }

  logError(sessionId: string, error: Error, context?: any) {
    this.log(sessionId, 'error', 'Error occurred during creative analysis', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      context
    });
    
    this.updateSessionStatus(sessionId, 'failed', error.message);
  }

  logSuccess(sessionId: string, result: any, duration: number) {
    this.log(sessionId, 'info', 'Creative analysis completed successfully', {
      result,
      duration,
      totalLogs: this.sessions.get(sessionId)?.logs.length || 0
    });
    
    this.updateSessionStatus(sessionId, 'completed');
  }

  getSession(sessionId: string): CreativeAnalysisSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): CreativeAnalysisSession[] {
    return Array.from(this.sessions.values());
  }

  clearSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  clearAllSessions() {
    this.sessions.clear();
  }

  exportSessionLogs(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return 'Session not found';
    }

    const logText = session.logs
      .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.data ? ` | Data: ${JSON.stringify(log.data, null, 2)}` : ''}${log.error ? ` | Error: ${log.error.message}` : ''}`)
      .join('\n');

    return `Creative Analysis Session: ${sessionId}
Creative ID: ${session.creativeId}
Status: ${session.status}
Start Time: ${new Date(session.startTime).toISOString()}
Duration: ${Date.now() - session.startTime}ms
${session.error ? `Error: ${session.error}\n` : ''}
Logs:
${logText}`;
  }

  // Browser console helpers for easy debugging
  debugSession(sessionId: string) {
    const session = this.getSession(sessionId);
    if (session) {
      console.group(`🔍 Creative Analysis Session: ${sessionId}`);
      console.log('Session Details:', session);
      console.log('Logs:', session.logs);
      console.groupEnd();
    } else {
      console.warn(`Session ${sessionId} not found`);
    }
  }

  debugAllSessions() {
    console.group('🔍 All Creative Analysis Sessions');
    this.getAllSessions().forEach(session => {
      console.group(`Session: ${session.sessionId}`);
      console.log('Creative ID:', session.creativeId);
      console.log('Status:', session.status);
      console.log('Duration:', Date.now() - session.startTime, 'ms');
      console.log('Log Count:', session.logs.length);
      if (session.error) {
        console.error('Error:', session.error);
      }
      console.groupEnd();
    });
    console.groupEnd();
  }
}

// Export singleton instance
export const creativeAnalysisLogger = new CreativeAnalysisLogger();

// Export helper functions for easy use
export const logCreativeAnalysis = (
  sessionId: string, 
  level: CreativeAnalysisLogEntry['level'], 
  message: string, 
  data?: any, 
  error?: Error
) => creativeAnalysisLogger.log(sessionId, level, message, data, error);

export const createCreativeAnalysisSession = (creativeId: string) => 
  creativeAnalysisLogger.createSession(creativeId);

export const logWebhookCall = (sessionId: string, webhookUrl: string, payload: any) =>
  creativeAnalysisLogger.logWebhookCall(sessionId, webhookUrl, payload);

export const logWebhookResponse = (sessionId: string, response: Response, responseBody: string, duration: number) =>
  creativeAnalysisLogger.logWebhookResponse(sessionId, response, responseBody, duration);

export const logCreativeAnalysisError = (sessionId: string, error: Error, context?: any) =>
  creativeAnalysisLogger.logError(sessionId, error, context);

export const logCreativeAnalysisSuccess = (sessionId: string, result: any, duration: number) =>
  creativeAnalysisLogger.logSuccess(sessionId, result, duration);
