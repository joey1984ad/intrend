# AI Analysis Debugging & Troubleshooting Guide

## Overview

The AI Analysis feature now includes comprehensive debugging and troubleshooting capabilities to help developers and users identify and resolve issues quickly. This guide covers all the debugging features, how to use them, and common troubleshooting steps.

## 🔧 Debug Panel Features

### 1. Debug Controls
- **Enable Debug Mode**: Toggle detailed logging and performance tracking
- **Refresh Logs**: Manually refresh the current session logs
- **Clear Logs**: Clear all stored logs (useful for testing)
- **Export Logs**: Download logs as JSON file for external analysis

### 2. Session Information
- **Session ID**: Unique identifier for each AI analysis attempt
- **Status**: Current analysis status (Analyzing/Idle)
- **Creative Details**: ID and type of the creative being analyzed

### 3. Environment Check
- **Webhook URL**: Verifies if the n8n webhook is configured
- **Facebook Token**: Checks if Facebook access token is available
- **Creative Data**: Confirms creative information is accessible
- **Ad Account ID**: Validates ad account ID presence

### 4. Real-time Logs
- **Live Updates**: Logs refresh automatically during analysis
- **Log Levels**: Color-coded by severity (Info/Warning/Error)
- **Expandable Details**: Click to view full error data and context
- **Timestamp Tracking**: Precise timing for each log entry

### 5. Error Summary
- **Error Count**: Total errors and warnings in current session
- **Recent Errors**: Last 3 error messages with full details
- **Error Context**: Additional data and stack traces when available

### 6. Performance Metrics
- **Phase Timing**: Duration of each analysis phase
- **Response Times**: Network request performance data
- **Total Analysis Time**: Complete end-to-end timing

## 🚀 How to Use the Debug Panel

### Step 1: Access the Debug Panel
1. Open a creative in the Creative Detail Modal
2. Navigate to the "🤖 AI Analysis" tab
3. Click "Show Debug Panel" to expand debugging tools

### Step 2: Enable Debug Mode
1. Check the "Enable Debug Mode" checkbox
2. This enables detailed logging and performance tracking
3. All subsequent AI analysis attempts will generate comprehensive logs

### Step 3: Start AI Analysis
1. Click the "🤖 Start AI Analysis" button
2. Watch the debug panel for real-time updates
3. Logs will automatically refresh every second during analysis

### Step 4: Review Results
1. Check the Environment Check section for configuration issues
2. Review Real-time Logs for detailed execution flow
3. Examine Error Summary for any issues that occurred
4. View Performance Metrics for timing analysis

## 📊 Log Levels and Meanings

### ℹ️ INFO (Blue)
- **Purpose**: General information about the analysis process
- **Examples**: Phase transitions, successful operations, timing data
- **Action**: Usually no action needed, just informational

### ⚠️ WARNING (Yellow)
- **Purpose**: Non-critical issues that might affect functionality
- **Examples**: Missing optional data, fallback operations
- **Action**: Review and address if functionality is affected

### ❌ ERROR (Red)
- **Purpose**: Critical issues that prevent successful analysis
- **Examples**: Network failures, missing required data, configuration errors
- **Action**: Immediate attention required to resolve the issue

## 🔍 Common Issues and Solutions

### 1. Webhook URL Not Configured
**Symptoms**: 
- Environment Check shows "❌ Not configured" for Webhook URL
- AI analysis fails immediately

**Solutions**:
- Add `NEXT_PUBLIC_N8N_WEBHOOK_URL` to your environment variables
- Ensure the URL is accessible from your application
- Verify the n8n workflow is running and accessible

### 2. Facebook Token Missing
**Symptoms**:
- Environment Check shows "❌ Not available" for Facebook Token
- Cannot access creative data

**Solutions**:
- Re-authenticate with Facebook
- Check if the token has expired
- Verify the token has required permissions

### 3. Creative Data Issues
**Symptoms**:
- Environment Check shows "❌ Missing" for Ad Account ID
- AI analysis fails during validation

**Solutions**:
- Ensure the creative has a valid `adAccountId` field
- Check if the creative data is properly loaded
- Verify the creative has valid image URLs

### 4. Network Timeouts
**Symptoms**:
- Analysis hangs for more than 30 seconds
- Error message mentions timeout

**Solutions**:
- Check your internet connection
- Verify the n8n webhook is responding
- Check if the webhook URL is accessible
- Review n8n workflow performance

### 5. Invalid Response Format
**Symptoms**:
- Warning about "Webhook response is not valid JSON"
- Analysis completes but with unexpected results

**Solutions**:
- Check the n8n workflow output format
- Ensure the webhook returns valid JSON
- Verify the response structure matches expected format

## 📈 Performance Optimization

### Understanding Performance Metrics
- **Validation Time**: Time spent validating creative data
- **Network Time**: Time for webhook request/response
- **Processing Time**: Time to parse and process response
- **Total Time**: Complete end-to-end analysis time

### Performance Targets
- **Validation**: < 100ms
- **Network**: < 5000ms (5 seconds)
- **Processing**: < 100ms
- **Total**: < 6000ms (6 seconds)

### Optimization Tips
1. **Enable Debug Mode** to identify slow phases
2. **Monitor Network Time** for webhook performance issues
3. **Check Response Size** for large payloads
4. **Review Phase Timing** to identify bottlenecks

## 🛠️ Advanced Debugging

### Console Logging
All debug information is also logged to the browser console with:
- Structured formatting
- Expandable groups
- Color-coded levels
- Performance data

### Log Export
Use the "Export Logs" button to:
- Download complete log history
- Share logs with support teams
- Analyze logs in external tools
- Archive debugging sessions

### Session Tracking
Each analysis attempt gets a unique session ID:
- Format: `session_{creativeId}_{timestamp}_{randomId}`
- Used to correlate logs across components
- Helps track issues across multiple attempts

## 🔧 Developer Tools

### Browser Console Commands
```javascript
// Enable debug mode programmatically
window.setDebugMode(true);

// Get all logs
window.getAllLogs();

// Get logs for specific session
window.getSessionLogs('session_123_456_abc');

// Clear all logs
window.clearLogs();

// Export logs
window.exportLogs();
```

### Network Tab Analysis
1. Open Browser DevTools → Network tab
2. Start AI analysis
3. Look for the webhook request
4. Check request/response details
5. Verify timing and status codes

### Error Stack Traces
- Full error stack traces are logged when available
- Use browser console to view complete error details
- Stack traces help identify the exact source of issues

## 📋 Troubleshooting Checklist

### Before Starting Analysis
- [ ] Webhook URL is configured and accessible
- [ ] Facebook token is valid and has permissions
- [ ] Creative has valid image URLs
- [ ] Creative has ad account ID
- [ ] Debug mode is enabled (if troubleshooting)

### During Analysis
- [ ] Watch real-time logs for errors
- [ ] Monitor performance metrics
- [ ] Check network tab for webhook calls
- [ ] Verify response format and content

### After Analysis
- [ ] Review error summary if any errors occurred
- [ ] Check performance metrics for bottlenecks
- [ ] Export logs if issues persist
- [ ] Verify AI score was updated

### Common Error Codes
- **400**: Bad Request - Check creative data
- **401**: Unauthorized - Verify credentials
- **403**: Forbidden - Check permissions
- **404**: Not Found - Verify webhook URL
- **429**: Too Many Requests - Wait and retry
- **500**: Server Error - Check n8n workflow
- **502/503/504**: Service Unavailable - Check n8n status

## 🆘 Getting Help

### When to Contact Support
- Analysis consistently fails with the same error
- Performance is significantly below targets
- Configuration appears correct but analysis fails
- Unusual error messages or behavior

### Information to Provide
1. **Session ID** from the debug panel
2. **Exported logs** from the debug panel
3. **Error messages** and screenshots
4. **Environment configuration** (without sensitive data)
5. **Steps to reproduce** the issue

### Support Channels
- Check this documentation first
- Review browser console for additional details
- Export and analyze logs independently
- Contact development team with detailed information

## 🔄 Regular Maintenance

### Log Management
- Clear logs periodically to prevent memory issues
- Export important debugging sessions before clearing
- Monitor log storage usage in long-running sessions

### Performance Monitoring
- Regularly review performance metrics
- Identify trends in analysis times
- Optimize slow phases based on data

### Configuration Validation
- Periodically verify webhook URL accessibility
- Check Facebook token validity
- Validate environment variable settings

---

## Quick Reference

| Feature | Location | Purpose |
|---------|----------|---------|
| Debug Panel | AI Analysis Tab | Comprehensive debugging interface |
| Real-time Logs | Debug Panel → Real-time Logs | Live analysis progress |
| Environment Check | Debug Panel → Environment Check | Configuration validation |
| Error Summary | Debug Panel → Error Summary | Issue identification |
| Performance Metrics | Debug Panel → Performance Metrics | Timing analysis |
| Log Export | Debug Panel → Export Logs | External analysis |

**Remember**: Enable debug mode before starting analysis to get the most comprehensive debugging information!
