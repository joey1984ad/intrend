import React, { useState, useEffect } from 'react';
import { 
  creativeAnalysisLogger, 
  CreativeAnalysisSession 
} from '../lib/creative-analysis-logger';

interface CreativeAnalysisDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreativeAnalysisDebugger: React.FC<CreativeAnalysisDebuggerProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<CreativeAnalysisSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const updateSessions = () => {
      setSessions(creativeAnalysisLogger.getAllSessions());
    };

    // Initial load
    updateSessions();

    // Auto-refresh every 2 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(updateSessions, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, autoRefresh]);

  const handleRefresh = () => {
    setSessions(creativeAnalysisLogger.getAllSessions());
  };

  const handleClearAll = () => {
    creativeAnalysisLogger.clearAllSessions();
    setSessions([]);
    setSelectedSession(null);
  };

  const handleExportSession = (sessionId: string) => {
    const logs = creativeAnalysisLogger.exportSessionLogs(sessionId);
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative-analysis-${sessionId}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDebugSession = (sessionId: string) => {
    creativeAnalysisLogger.debugSession(sessionId);
  };

  const handleDebugAll = () => {
    creativeAnalysisLogger.debugAllSessions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">🔍 Creative Analysis Debugger</h2>
            <span className="text-sm text-gray-500">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDebugAll}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
            >
              🐛 Debug All
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
            >
              🗑️ Clear All
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh every 2s</span>
            </label>
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-200px)]">
          {/* Sessions List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sessions</h3>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>No analysis sessions found</p>
                  <p className="text-sm">Start analyzing a creative to see sessions here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      onClick={() => setSelectedSession(session.sessionId)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSession === session.sessionId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {session.creativeId}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                          {getStatusIcon(session.status)} {session.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Session: {session.sessionId.slice(-8)}</div>
                        <div>Duration: {Date.now() - session.startTime}ms</div>
                        <div>Logs: {session.logs.length}</div>
                        {session.error && (
                          <div className="text-red-500 truncate">Error: {session.error}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedSession ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Session Details: {selectedSession.slice(-8)}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDebugSession(selectedSession)}
                      className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      🐛 Debug
                    </button>
                    <button
                      onClick={() => handleExportSession(selectedSession)}
                      className="px-3 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                    >
                      📥 Export
                    </button>
                  </div>
                </div>

                {(() => {
                  const session = sessions.find(s => s.sessionId === selectedSession);
                  if (!session) return <div>Session not found</div>;

                  return (
                    <div className="space-y-4">
                      {/* Session Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Session Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Creative ID:</span>
                            <span className="ml-2 text-gray-900">{session.creativeId}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)} {session.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Start Time:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(session.startTime).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="ml-2 text-gray-900">
                              {Date.now() - session.startTime}ms
                            </span>
                          </div>
                        </div>
                        {session.error && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <span className="font-medium text-red-800">Error:</span>
                            <span className="ml-2 text-red-700">{session.error}</span>
                          </div>
                        )}
                      </div>

                      {/* Logs */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Logs ({session.logs.length})</h4>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <div className="text-green-400 font-mono text-sm space-y-1">
                            {session.logs.map((log, index) => (
                              <div key={index} className="whitespace-nowrap">
                                <span className="text-gray-400">[{log.timestamp}]</span>
                                <span className={`ml-2 ${
                                  log.level === 'error' ? 'text-red-400' :
                                  log.level === 'warn' ? 'text-yellow-400' :
                                  log.level === 'debug' ? 'text-blue-400' :
                                  'text-green-400'
                                }`}>
                                  [{log.level.toUpperCase()}]
                                </span>
                                <span className="ml-2 text-white">{log.message}</span>
                                {log.data && (
                                  <span className="ml-2 text-gray-300">
                                    {JSON.stringify(log.data, null, 2)}
                                  </span>
                                )}
                                {log.error && (
                                  <span className="ml-2 text-red-300">
                                    Error: {log.error.message}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📋</div>
                  <p>Select a session to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeAnalysisDebugger;
