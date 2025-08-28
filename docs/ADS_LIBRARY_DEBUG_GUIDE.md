# Ads Library Debug Guide

## Overview

This guide documents the comprehensive debugging system implemented across all Ads Library components and API endpoints. The debugging system provides detailed logging for troubleshooting, performance monitoring, and development purposes.

## Debug Features

### 🔍 Debug Logging Format

All debug logs follow this consistent format:
```
🔍 [TIMESTAMP] Component.FunctionName: Message
```

**Example:**
```
🔍 [2024-01-15T10:30:45.123Z] AdsLibraryTab.searchAds: Starting search
```

### 📊 Debug Data Structure

Each debug log includes:
- **Timestamp**: ISO 8601 format for precise timing
- **Component**: The React component or API endpoint name
- **Function**: The specific function being executed
- **Message**: Human-readable description of the action
- **Data**: Optional structured data for detailed debugging

## Component Debug Coverage

### 1. AdsLibraryTab.tsx

**Debug Functions:**
- `constructor`: Component initialization with props
- `useEffect`: State changes monitoring
- `searchAds`: API request lifecycle
- `handleSearch`: Search trigger events
- `handleFiltersChange`: Filter modifications
- `handlePageChange`: Pagination events
- `handleAdClick`: Ad selection events
- `exportResults`: Export functionality
- `render`: Component rendering states

**Key Debug Data:**
- Facebook access token status (masked for security)
- Search queries and filters
- API response details
- Connection status changes
- Pagination calculations

### 2. AdsLibrarySearch.tsx

**Debug Functions:**
- `constructor`: Component initialization
- `useEffect`: Search term changes
- `handleSubmit`: Form submission events
- `handleClear`: Clear button actions
- `handleKeyPress`: Keyboard interactions
- `handleInputChange`: Input modifications
- `handleSuggestionClick`: Suggestion selections
- `render`: Component rendering

**Key Debug Data:**
- Search term changes
- Form submission details
- Suggestion interactions
- Input validation states

### 3. AdsLibraryFilters.tsx

**Debug Functions:**
- `constructor`: Component initialization
- `useEffect`: Filter prop changes
- `handleFilterChange`: Individual filter modifications
- `handlePlatformToggle`: Platform selection changes
- `clearFilters`: Filter reset actions
- `toggleExpanded`: Filter panel expansion
- `render`: Component rendering

**Key Debug Data:**
- Filter value changes
- Platform toggle states
- Filter combinations
- Active filter summaries

### 4. AdsLibraryGrid.tsx

**Debug Functions:**
- `constructor`: Component initialization
- `useEffect`: Props changes monitoring
- `handleAdClick`: Grid ad selection
- `handlePageChange`: Pagination events
- `calculatePaginationRange`: Pagination calculations
- `generatePageNumbers`: Page number generation
- `render`: Component rendering states

**Key Debug Data:**
- Grid rendering states
- Pagination calculations
- Ad click events
- Page number generation logic

### 5. AdsLibraryCard.tsx

**Debug Functions:**
- `constructor`: Component initialization
- `formatCurrency`: Currency formatting
- `formatImpressions`: Impression formatting
- `formatDate`: Date formatting
- `getPlatformIcon`: Platform icon selection
- `getMediaIcon`: Media type icon selection
- `getStatusColor`: Status color selection
- `handleCardClick`: Card selection
- `handleExternalLinkClick`: External link handling
- `handleImageError`: Image loading errors
- `render`: Component rendering

**Key Debug Data:**
- Ad data processing
- Formatting operations
- User interactions
- Image error handling

### 6. AdsLibraryDetailModal.tsx

**Debug Functions:**
- `constructor`: Component initialization
- `useEffect`: Props changes monitoring
- `formatCurrency`: Currency formatting
- `formatImpressions`: Impression formatting
- `formatDate`: Date formatting
- `getPlatformIcon`: Platform icon selection
- `getStatusColor`: Status color selection
- `getMediaIcon`: Media type icon selection
- `handleClose`: Modal closing
- `handleExternalLinkClick`: External link handling
- `handleImageError`: Image loading errors
- `render`: Component rendering

**Key Debug Data:**
- Modal state changes
- Ad detail processing
- User interactions
- Image error handling

## API Debug Coverage

### Facebook Ads Library API (`/api/facebook/ads-library`)

**Debug Functions:**
- `POST`: Request processing lifecycle
- `GET`: Method validation

**Key Debug Data:**
- Request timing and performance
- Input validation results
- Facebook SDK initialization
- Token validation and permissions
- Search parameter building
- Filter application
- Facebook API requests/responses
- Data transformation
- Error handling
- Response timing

## Debug Data Categories

### 🔐 Security & Authentication
- Access token validation (masked)
- Permission checks
- Authentication failures
- Token expiration handling

### 📡 API Communication
- Request/response details
- HTTP status codes
- Headers information
- Error responses
- Rate limiting

### 🎯 User Interactions
- Search queries
- Filter changes
- Pagination events
- Ad selections
- Export requests

### ⚡ Performance Metrics
- Response times
- Component render cycles
- State change frequency
- API call timing

### 🐛 Error Handling
- Validation failures
- API errors
- Network issues
- Data transformation errors
- Image loading failures

## Using the Debug System

### 1. Console Monitoring

Open your browser's Developer Tools Console to view all debug logs in real-time:

```javascript
// Filter debug logs by component
console.log('🔍 AdsLibraryTab') // Shows only AdsLibraryTab logs

// Filter by function
console.log('searchAds') // Shows only search function logs
```

### 2. Performance Analysis

Monitor API response times and component performance:

```javascript
// Look for response time logs
console.log('responseTime') // Shows API performance metrics
```

### 3. Error Tracking

Identify and debug issues:

```javascript
// Look for error logs
console.log('error') // Shows all error-related logs
```

### 4. User Flow Analysis

Track user interactions through the system:

```javascript
// Follow user journey
console.log('handleSearch') // Shows search flow
console.log('handleFiltersChange') // Shows filter changes
console.log('handleAdClick') // Shows ad selections
```

## Debug Configuration

### Environment Variables

The debug system respects environment variables:

```bash
# Enable verbose debugging (if implemented)
DEBUG_LEVEL=verbose

# Disable debug logging in production
NODE_ENV=production
```

### Conditional Debugging

Debug logs are automatically included in development builds and can be conditionally disabled in production.

## Troubleshooting Common Issues

### 1. Facebook API Connection Issues

**Debug Indicators:**
- Look for "Token validation failed" logs
- Check permission verification logs
- Monitor connection status changes

**Common Solutions:**
- Verify Facebook app permissions
- Check access token validity
- Ensure proper app configuration

### 2. Search Performance Issues

**Debug Indicators:**
- Monitor response time logs
- Check filter application logs
- Review search parameter building

**Common Solutions:**
- Optimize filter combinations
- Reduce page size for large results
- Implement caching strategies

### 3. Component Rendering Issues

**Debug Indicators:**
- Monitor render cycle logs
- Check state change logs
- Review prop change monitoring

**Common Solutions:**
- Optimize component dependencies
- Implement proper memoization
- Review state management

### 4. Image Loading Issues

**Debug Indicators:**
- Look for image error logs
- Check thumbnail processing
- Monitor media type detection

**Common Solutions:**
- Verify image URLs
- Implement fallback images
- Check CORS configuration

## Best Practices

### 1. Debug Log Management

- **Development**: Enable all debug logs for comprehensive troubleshooting
- **Staging**: Enable critical debug logs for testing
- **Production**: Disable debug logs for performance

### 2. Performance Monitoring

- Monitor API response times
- Track component render cycles
- Identify performance bottlenecks

### 3. Error Prevention

- Use debug logs to identify patterns
- Monitor validation failures
- Track user interaction issues

### 4. Security Monitoring

- Monitor authentication flows
- Track permission changes
- Validate token usage

## Debug Output Examples

### Successful Search Flow
```
🔍 [2024-01-15T10:30:45.123Z] AdsLibraryTab.searchAds: Starting search
🔍 [2024-01-15T10:30:45.124Z] FacebookAdsLibraryAPI.POST: Request received
🔍 [2024-01-15T10:30:45.125Z] FacebookAdsLibraryAPI.POST: Input validation passed
🔍 [2024-01-15T10:30:45.126Z] FacebookAdsLibraryAPI.POST: Token validation successful
🔍 [2024-01-15T10:30:45.127Z] FacebookAdsLibraryAPI.POST: Building search parameters
🔍 [2024-01-15T10:30:45.128Z] FacebookAdsLibraryAPI.POST: Making request to Facebook Ads Library API
🔍 [2024-01-15T10:30:45.500Z] FacebookAdsLibraryAPI.POST: Facebook API success response received
🔍 [2024-01-15T10:30:45.501Z] FacebookAdsLibraryAPI.POST: Request completed successfully
🔍 [2024-01-15T10:30:45.502Z] AdsLibraryTab.searchAds: API success response
🔍 [2024-01-15T10:30:45.503Z] AdsLibraryTab.searchAds: Setting ads data
```

### Error Handling Flow
```
🔍 [2024-01-15T10:30:45.123Z] AdsLibraryTab.searchAds: Starting search
🔍 [2024-01-15T10:30:45.124Z] FacebookAdsLibraryAPI.POST: Request received
🔍 [2024-01-15T10:30:45.125Z] FacebookAdsLibraryAPI.POST: Input validation passed
🔍 [2024-01-15T10:30:45.126Z] FacebookAdsLibraryAPI.POST: Token validation failed
🔍 [2024-01-15T10:30:45.127Z] AdsLibraryTab.searchAds: API error response
🔍 [2024-01-15T10:30:45.128Z] AdsLibraryTab.searchAds: Search error occurred
```

## Conclusion

The comprehensive debugging system provides complete visibility into the Ads Library functionality, enabling developers to:

- **Monitor Performance**: Track API response times and component rendering
- **Debug Issues**: Identify and resolve problems quickly
- **Optimize User Experience**: Understand user interaction patterns
- **Maintain Security**: Monitor authentication and permission flows
- **Improve Reliability**: Track error patterns and system health

Use this debug system during development and testing to ensure optimal performance and reliability of the Ads Library feature.
