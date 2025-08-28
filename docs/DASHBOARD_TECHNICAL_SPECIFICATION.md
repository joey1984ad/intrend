# Dashboard Technical Specification

## Overview
The Intrend dashboard is a React-based web application built with Next.js that provides comprehensive Facebook advertising analytics and management capabilities. The dashboard integrates with Facebook's Marketing API to fetch real-time advertising data and provides AI-powered creative analysis.

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom theme system
- **State Management**: React Context API + useState hooks
- **API Integration**: Facebook Marketing API via custom backend endpoints
- **AI Analysis**: N8N workflow integration for creative analysis

### Core Architecture Pattern
The dashboard follows a **Component-Based Architecture** with:
- **Container Components**: Handle data fetching and state management
- **Presentation Components**: Handle UI rendering and user interactions
- **Context Providers**: Manage global state (themes, user authentication)
- **Custom Hooks**: Encapsulate reusable logic

## Component Hierarchy

```
MetaDashboard (Main Container)
├── Header (Navigation & Controls)
├── AccountSummary (Account Overview)
├── Tab Content (Conditional Rendering)
│   ├── Campaigns Tab
│   ├── Ad Sets Tab
│   ├── Ads Tab
│   ├── Demographics Tab
│   ├── Creatives Tab
│   └── Ads Library Tab
└── Modals (Connection & Settings)
```

## Core Components Deep Dive

### 1. MetaDashboard (Main Container)
**File**: `components/MetaDashboard.tsx`
**Purpose**: Main dashboard orchestrator and state manager

**Key Responsibilities**:
- Manages all dashboard state (tabs, data, loading states)
- Handles Facebook API integration
- Coordinates data flow between components
- Manages theme switching
- Handles user authentication flow

**State Management**:
```typescript
// Core dashboard state
const [activeTab, setActiveTab] = useState('campaigns');
const [selectedAccount, setSelectedAccount] = useState('acme-auto');
const [dateRange, setDateRange] = useState('Last 30 Days');

// Facebook integration state
const [facebookAccessToken, setFacebookAccessToken] = useState<string>('');
const [facebookUserId, setFacebookUserId] = useState<string>('');
const [selectedAdAccount, setSelectedAdAccount] = useState<string>('');

// Data loading states
const [isLoading, setIsLoading] = useState(false);
const [isLoadingCreatives, setIsLoadingCreatives] = useState(false);
const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
```

**Data Flow**:
1. User connects Facebook account → `handleFacebookSuccess()`
2. Fetches ad accounts → `fetchFacebookAdsData()`
3. Loads data for active tab → Tab-specific useEffect hooks
4. Updates UI with real-time data

### 2. Header Component
**File**: `components/Header.tsx`
**Purpose**: Navigation, account selection, and user controls

**Key Features**:
- **Tab Navigation**: 6 main tabs with loading indicators
- **Account Selector**: Facebook ad account switching
- **Date Range Picker**: Campaign performance period selection
- **Refresh Controls**: Data refresh with loading states
- **User Profile**: Dropdown with settings, billing, logout
- **Theme Integration**: Responsive to dashboard theme changes

**Props Interface**:
```typescript
interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
  connectedAccounts: ConnectedAccount[];
  setShowAccountModal: (show: boolean) => void;
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;
  setShowDatePicker: (show: boolean) => void;
  handleRefresh: () => void;
  isLoading: boolean;
  // Loading states for each tab
  isLoadingCreatives?: boolean;
  isLoadingCampaigns?: boolean;
  isLoadingAdSets?: boolean;
  isLoadingAds?: boolean;
  isLoadingDemographics?: boolean;
  isLoggedIn?: boolean;
}
```

**Tab Configuration**:
```typescript
const tabs = [
  { id: 'campaigns', label: 'Campaigns', icon: BarChart3, loading: isLoadingCampaigns },
  { id: 'adsets', label: 'Ad Sets', icon: Target, loading: isLoadingAdSets },
  { id: 'ads', label: 'Ads', icon: Grid3X3, loading: isLoadingAds },
  { id: 'demographics', label: 'Demographics', icon: Users, loading: isLoadingDemographics },
  { id: 'creatives', label: 'Creatives', icon: Image, loading: isLoadingCreatives },
  { id: 'ads-library', label: 'Ads Library', icon: Library, loading: false }
];
```

### 3. Theme System
**File**: `contexts/DashboardThemeContext.tsx`
**Purpose**: Global theme management across the dashboard

**Theme Types**:
- `'white'`: Light theme with blue accents
- `'dark'`: Dark theme with slate colors

**Implementation**:
```typescript
// Theme context provides:
const { theme, toggleTheme, setTheme } = useDashboardTheme();

// Theme-aware styling:
className={`transition-colors duration-300 ${
  theme === 'white' 
    ? 'bg-white border-gray-200' 
    : 'bg-slate-800 border-slate-700'
}`}
```

**CSS Classes Applied**:
- Light theme: `light` class on document root
- Dark theme: `dark` class on document root
- Enables CSS selector-based theming: `.light .component` / `.dark .component`

### 4. Tab System Architecture

#### Campaigns Tab
**Components**: `ChartsSection`, `MetricsGrid`, `InsightsGraph`, `CampaignsTab`
**Data Flow**:
1. Facebook API → Campaign performance data
2. Data transformation → Chart-ready format
3. Real-time metrics display
4. Campaign list with sorting/filtering

#### Creatives Tab
**Components**: `CreativesTab`, `CreativeGallery`, `CreativeFilters`
**Features**:
- AI analysis integration via N8N webhooks
- Creative performance metrics
- Bulk operations (AI analysis, export)
- Creative comparison and detail views

#### Ad Sets Tab
**Components**: `AdsetsTab`, `DataTable`
**Data**: Budget, spend, performance metrics, targeting information

#### Ads Tab
**Components**: `AdsTab`, `DataTable`
**Data**: Individual ad performance, creative assets, conversion tracking

#### Demographics Tab
**Components**: `DemographicsTab`, `DataTable`
**Data**: Age/gender breakdown, performance by demographic

#### Ads Library Tab
**Components**: `AdsLibraryTab`, `AdsLibrarySearch`, `AdsLibraryGrid`
**Features**: Facebook Ads Library integration, competitor research

### 5. Data Management

#### Facebook API Integration
**Endpoints Used**:
- `/api/facebook/auth` - Authentication and ad account fetching
- `/api/facebook/ads` - Campaign and performance data
- `/api/facebook/creatives` - Creative assets and metrics

**Data Flow**:
```typescript
// 1. User connects Facebook
handleFacebookSuccess(accessToken, userId)

// 2. Fetch ad accounts
fetch('/api/facebook/auth', { accessToken })

// 3. Load campaign data
fetchFacebookAdsData()

// 4. Load tab-specific data
useEffect(() => {
  if (activeTab === 'creatives') {
    fetchCreativeData();
  }
}, [activeTab]);
```

#### Caching Strategy
- **Cache TTL**: Configurable (default: 6 hours)
- **Force Refresh**: Bypass cache for real-time data
- **Smart Loading**: Only load data for active tabs

### 6. State Management Patterns

#### Local State
- Component-specific state managed with `useState`
- Loading states for each data type
- Search terms and filters per tab

#### Context State
- **DashboardThemeContext**: Global theme management
- **UserContext**: Authentication and user data
- **Shared State**: Passed down via props for complex data

#### Data Flow Pattern
```typescript
// Parent component manages state
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(false);

// Pass to child components
<ChildComponent 
  data={data}
  isLoading={isLoading}
  onDataUpdate={setData}
/>
```

### 7. Responsive Design

#### Breakpoint System
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm to lg)
- **Desktop**: > 1024px (lg)

#### Layout Adaptations
- Header: Horizontal layout on desktop, collapsible on mobile
- Tabs: Horizontal scrolling on mobile
- Data tables: Responsive with horizontal scroll
- Charts: Responsive sizing with mobile optimizations

### 8. Performance Optimizations

#### Lazy Loading
- Tab content only loads when active
- Images use lazy loading with placeholders
- API calls debounced and cached

#### Memoization
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers

#### Data Fetching
- Conditional API calls based on tab state
- Progressive loading (metrics → charts → detailed data)
- Error boundaries and retry logic

### 9. Error Handling

#### API Error Management
```typescript
try {
  const response = await fetch('/api/facebook/ads', options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  setFacebookError('Failed to fetch ads data');
  console.error('Error:', error);
}
```

#### User Feedback
- Loading states for all async operations
- Error messages with retry options
- Graceful fallbacks for failed data loads

### 10. Customization Points

#### Theme Customization
- Modify `DashboardThemeContext.tsx` for new themes
- Update CSS variables in `globals.css`
- Add theme-aware component variants

#### Component Styling
- Tailwind classes for rapid styling changes
- CSS custom properties for theme values
- Component-specific style overrides

#### Data Display
- Modify `types.ts` for new data structures
- Update `DataTable.tsx` for new column types
- Custom render functions for complex data

## Making Design Changes

### Header Modifications
To modify the header:

1. **Layout Changes**: Edit `Header.tsx` component structure
2. **Styling**: Update Tailwind classes and theme-aware styling
3. **Navigation**: Modify tab configuration array
4. **Controls**: Add/remove buttons in the right-side controls section

### Theme Changes
1. **New Themes**: Add to `DashboardThemeContext.tsx`
2. **Color Schemes**: Update CSS variables and Tailwind config
3. **Component Variants**: Add theme-specific styling

### Tab Content Changes
1. **New Tabs**: Add to tabs array and create new tab components
2. **Data Structure**: Update types in `types.ts`
3. **API Integration**: Add new endpoints and data fetching logic

### Component Styling
1. **Tailwind Classes**: Direct class modifications
2. **CSS Variables**: Theme-aware custom properties
3. **Component Props**: Pass styling props for customization

## Best Practices

1. **Theme Consistency**: Always use theme-aware styling
2. **Loading States**: Provide feedback for all async operations
3. **Error Boundaries**: Handle failures gracefully
4. **Performance**: Lazy load and memoize where appropriate
5. **Accessibility**: Maintain ARIA labels and keyboard navigation
6. **Responsive Design**: Test on all breakpoints

## Troubleshooting

### Common Issues
1. **Theme Not Applying**: Check context provider wrapping
2. **Data Not Loading**: Verify Facebook API integration
3. **Styling Conflicts**: Ensure Tailwind classes are properly applied
4. **Performance Issues**: Check for unnecessary re-renders

### Debug Tools
- Browser console for API calls
- React DevTools for component state
- Network tab for API responses
- Component prop drilling analysis

This specification provides the complete technical foundation for understanding and modifying your dashboard. Each component is designed to be modular and customizable while maintaining consistency across the application.
