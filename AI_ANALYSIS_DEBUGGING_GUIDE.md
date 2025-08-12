# AI Analysis Debugging and Troubleshooting Guide

## Overview

This guide provides comprehensive debugging and troubleshooting information for the "Start AI Analysis" function in the Intrend application. The system includes enhanced logging, error tracking, and troubleshooting capabilities to help diagnose and resolve issues.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Debugging Features](#debugging-features)
3. [Common Issues and Solutions](#common-issues-and-solutions)
4. [Troubleshooting Workflow](#troubleshooting-workflow)
5. [Debug Panel Usage](#debug-panel-usage)
6. [Log Analysis](#log-analysis)
7. [Performance Monitoring](#performance-monitoring)
8. [Error Severity Levels](#error-severity-levels)
9. [Support and Resources](#support-and-resources)

## System Architecture

### Components

- **CreativeDetailModal**: Individual creative analysis interface
- **MetaDashboard**: Bulk analysis interface
- **Creative Analysis Logger**: Enhanced logging and debugging system
- **Webhook Integration**: AI analysis service communication

### Data Flow

1. User initiates AI analysis
2. System creates analysis session with unique ID
3. Validation of creative data and environment
4. Pre-flight checks (network, authentication)
5. Webhook call to AI service
6. Response processing and score extraction
7. Session completion and cleanup

## Debugging Features

### Session Tracking

Each AI analysis creates a unique session with:
- **Session ID**: Unique identifier for tracking
- **Status**: pending → running → completed/failed
- **Steps**: Detailed execution steps with timing
- **Errors**: Comprehensive error logging with severity
- **Performance**: Response times and metrics
- **Troubleshooting**: Automated issue detection and suggestions

### Enhanced Logging

- **Structured Logging**: JSON-formatted logs with context
- **Performance Metrics**: Response times, network latency
- **Error Classification**: Automatic severity determination
- **User Actions**: Suggested solutions for common issues
- **Technical Details**: Stack traces and debugging information

### Real-time Monitoring

- **Active Sessions**: Live view of running analyses
- **Environment Status**: Configuration validation
- **Network Health**: Connectivity and service availability
- **Performance Trends**: Historical analysis metrics

## Common Issues and Solutions

### 1. Authentication Errors

**Symptoms:**
- 401 Unauthorized responses
- Facebook access token validation failures
- Permission denied errors

**Solutions:**
- Refresh Facebook login
- Check token permissions and expiration
- Verify app configuration
- Clear browser cache and cookies

**Debug Steps:**
```javascript
// Check token validity
const tokenTest = await fetch(`https://graph.facebook.com/me?access_token=${facebookAccessToken}`);
console.log('Token Status:', tokenTest.status);
```

### 2. Network Connectivity Issues

**Symptoms:**
- Request timeouts (30s)
- Network error messages
- Failed pre-flight checks

**Solutions:**
- Check internet connection
- Verify firewall settings
- Test webhook endpoint accessibility
- Check proxy configuration

**Debug Steps:**
```javascript
// Test connectivity
const testResponse = await fetch(webhookUrl, { 
  method: 'HEAD',
  mode: 'no-cors'
});
```

### 3. Image URL Issues

**Symptoms:**
- "No image content available" errors
- Invalid URL format errors
- Image access denied

**Solutions:**
- Verify creative has valid image URLs
- Check Facebook CDN accessibility
- Validate URL format and encoding
- Ensure proper access token inclusion

**Debug Steps:**
```javascript
// Validate URL format
try {
  new URL(imageUrl);
  console.log('✅ Valid URL format');
} catch (error) {
  console.error('❌ Invalid URL:', error);
}
```

### 4. Webhook Configuration Errors

**Symptoms:**
- "No webhook URL configured" errors
- Environment variable missing
- Service endpoint unreachable

**Solutions:**
- Check environment configuration
- Verify webhook URL format
- Test service endpoint
- Contact support for configuration

**Debug Steps:**
```javascript
// Check environment
console.log('Webhook URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);
console.log('Node Env:', process.env.NODE_ENV);
```

### 5. Response Parsing Issues

**Symptoms:**
- JSON parsing errors
- Unexpected response formats
- Missing score data

**Solutions:**
- Check AI service response format
- Verify response structure
- Handle non-JSON responses gracefully
- Contact AI service support

**Debug Steps:**
```javascript
// Parse response safely
try {
  const parsed = JSON.parse(result);
  console.log('✅ Valid JSON response');
} catch (error) {
  console.warn('⚠️ Non-JSON response, attempting extraction');
  // Extract score from text response
}
```

## Troubleshooting Workflow

### Step 1: Initial Assessment

1. **Check Console Logs**: Look for error messages and warnings
2. **Verify Session Status**: Check if analysis session was created
3. **Review Environment**: Confirm configuration and connectivity

### Step 2: Error Classification

1. **Identify Error Type**: Authentication, network, validation, etc.
2. **Determine Severity**: Low, medium, high, or critical
3. **Check Context**: Review error details and session information

### Step 3: Targeted Resolution

1. **Follow Suggested Actions**: Use automated troubleshooting guidance
2. **Apply Fixes**: Implement recommended solutions
3. **Test Resolution**: Verify issue is resolved

### Step 4: Escalation

1. **Document Issue**: Record error details and resolution steps
2. **Contact Support**: If automated solutions don't work
3. **Provide Context**: Include session ID and error logs

## Debug Panel Usage

### Accessing Debug Information

The debug panel is available in development mode and provides:

- **Session Status**: Active analysis sessions
- **Environment Check**: Configuration validation
- **Troubleshooting Actions**: Debug tools and utilities
- **Common Issues**: Known problems and solutions

### Debug Actions

1. **Log Session to Console**: Detailed session information
2. **Export Session Data**: Download session data as JSON
3. **Clear All Sessions**: Reset session tracking
4. **Environment Validation**: Check configuration status

### Interpreting Debug Data

- **Green Status**: Successful operations
- **Yellow Status**: Warnings and potential issues
- **Red Status**: Errors requiring attention
- **Blue Status**: Information and debugging data

## Log Analysis

### Log Format

```
[Timestamp] [LEVEL] [SessionID] Message
📊 Data: { structured data }
📈 Session Status: status
⏱️ Total Steps: count
❌ Errors: count
```

### Log Levels

- **INFO**: Normal operation and status updates
- **WARN**: Potential issues and warnings
- **ERROR**: Errors requiring attention

### Key Log Entries

1. **Session Creation**: `🔧 Created new analysis session`
2. **Validation**: `🔍 Starting creative validation`
3. **Webhook Call**: `🔗 Calling webhook URL`
4. **Response**: `📡 Webhook response received`
5. **Completion**: `🎉 Analysis completed successfully`
6. **Errors**: `💥 Analysis error`

## Performance Monitoring

### Metrics Tracked

- **Total Time**: Complete analysis duration
- **Webhook Response**: AI service response time
- **Network Latency**: Connection performance
- **Image Processing**: Image handling time
- **Memory Usage**: Resource consumption

### Performance Thresholds

- **Excellent**: < 5 seconds
- **Good**: 5-10 seconds
- **Fair**: 10-20 seconds
- **Poor**: > 20 seconds

### Optimization Tips

1. **Image Optimization**: Use appropriate image sizes
2. **Network**: Ensure stable internet connection
3. **Caching**: Leverage browser and service caching
4. **Batch Processing**: Use bulk analysis for multiple creatives

## Error Severity Levels

### Critical (Red)

- Authentication failures
- Service unavailable
- Configuration errors

**Action Required**: Immediate attention, contact support

### High (Orange)

- Network timeouts
- Service errors
- Data validation failures

**Action Required**: Check configuration, retry operation

### Medium (Yellow)

- Response format issues
- Performance degradation
- Warning conditions

**Action Required**: Monitor, optimize if needed

### Low (Blue)

- Information messages
- Status updates
- Debug information

**Action Required**: None, informational only

## Support and Resources

### Self-Service Tools

1. **Debug Panel**: Built-in troubleshooting interface
2. **Console Logs**: Detailed error information
3. **Session Export**: Data for support analysis
4. **Performance Metrics**: System health indicators

### Documentation

- **API Reference**: Webhook integration details
- **Configuration Guide**: Environment setup
- **Troubleshooting FAQ**: Common solutions
- **Performance Guide**: Optimization tips

### Support Channels

1. **Technical Support**: Email and chat support
2. **Developer Community**: Forums and discussions
3. **Issue Tracking**: Bug reports and feature requests
4. **Knowledge Base**: Searchable solution database

### Escalation Process

1. **Automated Troubleshooting**: Use debug panel and logs
2. **Self-Service Resolution**: Follow troubleshooting guides
3. **Community Support**: Check forums and documentation
4. **Technical Support**: Contact support team with context

## Best Practices

### Development

1. **Enable Debug Mode**: Use debug panel in development
2. **Monitor Logs**: Check console for warnings and errors
3. **Test Scenarios**: Validate error handling paths
4. **Performance Testing**: Monitor response times

### Production

1. **Error Monitoring**: Track error rates and patterns
2. **Performance Alerts**: Set thresholds for response times
3. **User Feedback**: Collect issue reports and patterns
4. **Regular Reviews**: Analyze logs for optimization opportunities

### Maintenance

1. **Session Cleanup**: Regular cleanup of old sessions
2. **Log Rotation**: Manage log file sizes
3. **Performance Review**: Analyze trends and bottlenecks
4. **Update Monitoring**: Track service and dependency updates

## Conclusion

The enhanced debugging and troubleshooting system provides comprehensive visibility into AI analysis operations. By following this guide, users and developers can quickly identify and resolve issues, ensuring optimal performance and reliability of the AI analysis functionality.

For additional support or questions, refer to the support channels and resources listed above.
