# Facebook Ads Library Implementation

This document describes the implementation of the Facebook Ads Library functionality in the Intrend dashboard application.

## Overview

The Facebook Ads Library feature allows users to search, browse, and analyze ads from Facebook's public Ads Library. This is useful for competitor research, creative inspiration, and understanding advertising trends.

## Features

- **Search Functionality**: Search ads by brand names, keywords, or page names
- **Advanced Filtering**: Filter by region, media type, ad type, date range, spend, and platforms
- **Grid View**: Display search results in an organized grid layout
- **Detailed View**: View comprehensive information about individual ads
- **Export Options**: Download results in CSV or JSON format
- **Pagination**: Navigate through large result sets efficiently
- **Responsive Design**: Works on desktop and mobile devices

## Components

### 1. AdsLibraryTab
Main container component that orchestrates the entire Ads Library experience.

**Location**: `components/AdsLibraryTab.tsx`

**Props**:
- `searchTerm`: Current search query
- `setSearchTerm`: Function to update search term
- `facebookAccessToken`: User's Facebook access token
- `adAccountId`: Selected Facebook ad account ID
- `dateRange`: Selected date range
- `selectedAdAccounts`: Array of available ad accounts

### 2. AdsLibrarySearch
Search interface with suggestions and tips.

**Location**: `components/AdsLibrarySearch.tsx`

**Features**:
- Search input with clear button
- Popular search suggestions
- Search tips and guidance
- Loading states

### 3. AdsLibraryFilters
Advanced filtering options for search results.

**Location**: `components/AdsLibraryFilters.tsx`

**Filter Options**:
- Region (US, CA, GB, DE, FR, AU, BR, IN, JP, MX)
- Media Type (Image, Video, Carousel, Dynamic)
- Ad Type (Political, Issue Advocacy, Election, Commercial)
- Date Range (Last 7/30/90 days, Last 12 months, All time)
- Spend Range (Min/Max)
- Publisher Platforms (Facebook, Instagram, Messenger, Audience Network)

### 4. AdsLibraryGrid
Displays search results with pagination.

**Location**: `components/AdsLibraryGrid.tsx`

**Features**:
- Responsive grid layout
- Pagination controls
- Results count display
- Loading and error states

### 5. AdsLibraryCard
Individual ad display card.

**Location**: `components/AdsLibraryCard.tsx`

**Information Displayed**:
- Ad creative preview (image/video)
- Page name and ad title
- Performance metrics (spend, impressions)
- Platform indicators
- Status badges
- Date and region information

### 6. AdsLibraryDetailModal
Detailed view of individual ad information.

**Location**: `components/AdsLibraryDetailModal.tsx`

**Features**:
- Full-size media preview
- Complete ad information
- Performance metrics
- Timing and platform details
- External link to Facebook

## API Routes

### 1. Main Search Endpoint
**Route**: `POST /api/facebook/ads-library`

**Purpose**: Search Facebook Ads Library with filters and pagination

**Request Body**:
```json
{
  "accessToken": "string",
  "searchQuery": "string",
  "filters": {
    "region": "string",
    "mediaType": "string",
    "adType": "string",
    "dateRange": "string",
    "minSpend": "string",
    "maxSpend": "string",
    "publisherPlatforms": "string[]"
  },
  "page": "number",
  "pageSize": "number"
}
```

**Response**:
```json
{
  "success": true,
  "ads": "AdsLibraryAd[]",
  "totalResults": "number",
  "hasNextPage": "boolean",
  "hasPreviousPage": "boolean",
  "currentPage": "number",
  "pageSize": "number",
  "totalPages": "number"
}
```

### 2. Export Endpoint
**Route**: `POST /api/facebook/ads-library/export`

**Purpose**: Export search results in CSV or JSON format

**Request Body**:
```json
{
  "accessToken": "string",
  "searchQuery": "string",
  "filters": "object",
  "format": "csv|json"
}
```

### 3. Single Ad Details
**Route**: `GET /api/facebook/ads-library/[adId]?access_token=string`

**Purpose**: Get detailed information about a specific ad

## Data Types

### AdsLibraryAd Interface
```typescript
interface AdsLibraryAd {
  id: string;
  adCreativeBody: string;
  adCreativeLinkTitle: string;
  adCreativeLinkDescription?: string;
  adCreativeLinkCaption?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  pageName: string;
  pageId: string;
  adDeliveryStartTime: string;
  adDeliveryStopTime?: string;
  adSnapshotUrl: string;
  currency: string;
  spend: {
    lowerBound: string;
    upperBound: string;
  };
  impressions: {
    lowerBound: string;
    upperBound: string;
  };
  publisherPlatforms: string[];
  mediaType: 'image' | 'video' | 'carousel' | 'dynamic';
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  region: string;
  disclaimer?: string;
  adType?: string;
  adCategory?: string;
}
```

## Facebook API Integration

### Required Permissions
- `ads_read`: Read ad account data
- `read_insights`: Access to insights data
- `pages_read_engagement`: Read page engagement data

### API Endpoints Used
- **Ads Library**: `https://graph.facebook.com/v18.0/ads_archive`
- **Single Ad**: `https://graph.facebook.com/v18.0/{ad_id}`

### Rate Limiting
- **Limit**: 200 requests per minute
- **Window**: 1 minute
- **Implementation**: Built into API routes with proper error handling

## Configuration

### Environment Variables
```env
# Facebook Ads Library specific settings
FACEBOOK_ADS_LIBRARY_API_VERSION=v18.0
FACEBOOK_ADS_LIBRARY_RATE_LIMIT=200
FACEBOOK_ADS_LIBRARY_CACHE_TTL=3600

# Optional: Enable specific features
ENABLE_ADS_LIBRARY_EXPORT=true
ENABLE_AI_ANALYSIS=true
```

### Facebook App Setup
1. Go to [Facebook Developers Console](https://developers.facebook.com/)
2. Select your app
3. Navigate to **App Review** → **Permissions and Features**
4. Request required permissions:
   - `ads_read`
   - `pages_read_engagement`
   - `read_insights`

## Usage

### Basic Search
1. Navigate to the "Ads Library" tab
2. Enter a search term (e.g., "Nike", "iPhone", "Tesla")
3. Click "Search" or press Enter
4. Browse results in the grid view

### Advanced Filtering
1. Click the "Filters" button to expand filter options
2. Select desired filters:
   - Choose region for targeted results
   - Filter by media type (image, video, etc.)
   - Set date ranges for recent ads
   - Specify spend ranges
   - Select publisher platforms
3. Apply filters to refine search results

### Viewing Ad Details
1. Click on any ad card in the grid
2. View comprehensive information in the detail modal
3. Click "View on Facebook" to see the ad on Facebook
4. Close modal to return to search results

### Exporting Results
1. Use the export buttons in the header
2. Choose between CSV and JSON formats
3. Download file with search query and date in filename

## Error Handling

### Common Error Scenarios
1. **Invalid Access Token**: User needs to reconnect Facebook account
2. **Rate Limit Exceeded**: Wait before making additional requests
3. **Permission Denied**: Check Facebook app permissions
4. **No Results**: Adjust search terms or filters

### Error Messages
- Clear, user-friendly error messages
- Actionable guidance for resolution
- Graceful fallbacks for API failures

## Performance Considerations

### Caching
- Search results cached for 1 hour
- Image thumbnails cached locally
- Pagination data cached per session

### Optimization
- Lazy loading for images
- Efficient pagination
- Debounced search input
- Minimal API calls

### Mobile Optimization
- Responsive grid layout
- Touch-friendly interactions
- Optimized image sizes
- Fast loading times

## Security

### Data Protection
- Access tokens never stored in localStorage
- API calls made server-side
- User data not logged or stored
- HTTPS required for all requests

### Privacy Compliance
- GDPR compliant data handling
- No personal information collected
- Transparent data usage
- User consent for Facebook integration

## Testing

### Test Scenarios
1. **Search Functionality**
   - Basic keyword search
   - Empty search handling
   - Special character handling

2. **Filtering**
   - All filter combinations
   - Filter reset functionality
   - Active filter display

3. **Pagination**
   - Page navigation
   - Results per page
   - Edge cases (first/last page)

4. **Export**
   - CSV format validation
   - JSON format validation
   - Large dataset handling

5. **Error Handling**
   - Invalid tokens
   - Network failures
   - API rate limits

### Test Data
- Use real Facebook ads for testing
- Test with various ad types and formats
- Verify image and video handling
- Test with different regions and languages

## Troubleshooting

### Common Issues

1. **"No Results Found"**
   - Check search query spelling
   - Verify Facebook permissions
   - Try different search terms
   - Check filter settings

2. **Images Not Loading**
   - Facebook image URLs may expire
   - Check network connectivity
   - Verify image proxy settings

3. **Slow Performance**
   - Reduce page size
   - Clear browser cache
   - Check network speed
   - Verify API response times

4. **Export Failures**
   - Check file permissions
   - Verify export format
   - Check result set size
   - Verify browser download settings

### Debug Information
- Console logging for API calls
- Network tab monitoring
- Error boundary implementation
- User feedback collection

## Future Enhancements

### Planned Features
1. **AI Analysis Integration**
   - Creative performance scoring
   - Trend analysis
   - Competitor insights

2. **Advanced Analytics**
   - Spend trend analysis
   - Platform performance comparison
   - Creative effectiveness metrics

3. **User Preferences**
   - Saved searches
   - Favorite ads
   - Custom filters
   - Search history

4. **Collaboration Features**
   - Share search results
   - Team annotations
   - Export sharing
   - Comment system

### Technical Improvements
1. **Performance**
   - Virtual scrolling for large datasets
   - Advanced caching strategies
   - Background data prefetching

2. **User Experience**
   - Keyboard shortcuts
   - Drag and drop functionality
   - Advanced search operators
   - Search suggestions

3. **Integration**
   - Slack notifications
   - Email reports
   - Calendar integration
   - CRM integration

## Support

### Documentation
- This README file
- Component documentation
- API documentation
- User guide

### Contact
- Technical issues: Check console logs and network tab
- Feature requests: Submit through project management system
- Bug reports: Include steps to reproduce and error details

## License

This implementation is part of the Intrend dashboard application and follows the same licensing terms.
