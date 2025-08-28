# Header Customization Guide

## Quick Reference for Header Modifications

The Header component (`components/Header.tsx`) is the main navigation component that controls the entire dashboard experience. Here's how to customize it effectively.

## Component Structure

```typescript
// Header.tsx - Main structure
const Header: React.FC<HeaderProps> = ({ ... }) => {
  return (
    <div className="shadow-sm border-b transition-colors duration-300 p-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo Section */}
            {/* Navigation Tabs */}
          </div>
          
          {/* Right Side: Controls */}
          <div className="flex items-center space-x-4">
            {/* Account Selector */}
            {/* Date Range Picker */}
            {/* Refresh Button */}
            {/* User Profile Dropdown */}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Key Customization Areas

### 1. Logo & Branding
**Location**: Lines 130-150 in Header.tsx

```typescript
{/* Logo and Brand */}
<button 
  onClick={handleLogoClick}
  className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 cursor-pointer group"
>
  {/* Logo Icon */}
  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
    <div className="w-4 h-4 rounded-sm bg-white"></div>
  </div>
  
  {/* Brand Name */}
  <span className="text-xl font-bold group-hover:text-blue-600">
    Intrend
  </span>
</button>
```

**Customization Options**:
- Change logo colors: Modify `from-blue-500 to-blue-600`
- Update brand name: Change "Intrend" text
- Modify logo size: Adjust `w-8 h-8` classes
- Change logo shape: Modify `rounded-lg` to other Tailwind classes

### 2. Navigation Tabs
**Location**: Lines 151-180 in Header.tsx

```typescript
{/* Main Navigation */}
<nav className="flex space-x-1">
  {tabs.map((tab) => {
    const IconComponent = tab.icon;
    const isActive = activeTab === tab.id;
    
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
          isActive
            ? 'text-blue-700 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <IconComponent className="w-4 h-4" />
        <span>{tab.label}</span>
        {tab.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      </button>
    );
  })}
</nav>
```

**Tab Configuration**: Lines 85-92
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

**Customization Options**:
- **Add New Tab**: Add to tabs array with icon, label, and loading state
- **Change Tab Names**: Modify `label` property
- **Update Icons**: Import new icons from `lucide-react` and replace
- **Modify Styling**: Update button className for active/inactive states

### 3. Right Side Controls
**Location**: Lines 181-280 in Header.tsx

#### Account Selector
```typescript
{/* Account Selector */}
<button
  onClick={() => setShowAccountModal(true)}
  className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
>
  {selectedAccount}
</button>
```

#### Date Range Picker
```typescript
{/* Date Range Selector */}
<button
  onClick={() => setShowDatePicker(true)}
  className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
>
  {selectedDateRange}
</button>
```

#### Refresh Button
```typescript
{/* Refresh Button */}
<button
  onClick={handleRefresh}
  className="p-2 transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-100"
  disabled={isLoading}
>
  <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
</button>
```

### 4. User Profile Dropdown
**Location**: Lines 281-344 in Header.tsx

```typescript
{/* User Profile Dropdown */}
<div className="relative" onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
  <button className="flex items-center space-x-3 pl-4 border-l border-gray-200">
    {/* Avatar */}
    <div className="w-8 h-8 rounded-full bg-gray-200">
      <User className="w-4 h-4 text-gray-600" />
    </div>
    
    {/* User Info */}
    <div className="text-sm">
      <p className="font-medium text-gray-900">{userName}</p>
      <p className="text-gray-500">{userRole}</p>
    </div>
    
    <ChevronDown className="w-4 h-4 text-gray-400" />
  </button>
  
  {/* Dropdown Menu */}
  {showProfileMenu && (
    <div className="absolute right-0 mt-0 w-56 rounded-xl shadow-xl border bg-white">
      {/* Menu Items */}
    </div>
  )}
</div>
```

## Theme Integration

The Header automatically responds to theme changes via the `DashboardThemeContext`:

```typescript
// Get theme from context
const themeContext = useDashboardTheme();
const theme = themeContext?.theme || 'white';

// Theme-aware styling
className={`transition-colors duration-300 ${
  theme === 'white' 
    ? 'bg-white border-gray-200' 
    : 'bg-slate-800 border-slate-700'
}`}
```

**Theme Variables**:
- **Light Theme**: `bg-white`, `border-gray-200`, `text-gray-900`
- **Dark Theme**: `bg-slate-800`, `border-slate-700`, `text-white`

## Common Customization Examples

### 1. Change Header Height
```typescript
// Current: h-16 (64px)
// Change to: h-20 (80px)
<div className="flex items-center justify-between h-20">
```

### 2. Add New Control Button
```typescript
{/* Add after refresh button */}
<button
  onClick={() => handleNewAction()}
  className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
>
  New Action
</button>
```

### 3. Modify Tab Styling
```typescript
// Change active tab styling
className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
  isActive
    ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50' // Custom active style
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
}`}
```

### 4. Add Loading State to New Tab
```typescript
const tabs = [
  // ... existing tabs
  { id: 'new-tab', label: 'New Tab', icon: Star, loading: isLoadingNewTab }
];

// Add loading state to Header props
interface HeaderProps {
  // ... existing props
  isLoadingNewTab?: boolean;
}
```

## Props Interface

The Header receives these props from MetaDashboard:

```typescript
interface HeaderProps {
  activeTab: string;                    // Current active tab
  setActiveTab: (tab: string) => void;  // Function to change tabs
  selectedAccount: string;              // Currently selected Facebook account
  setSelectedAccount: (account: string) => void;
  connectedAccounts: ConnectedAccount[]; // Available accounts
  setShowAccountModal: (show: boolean) => void;
  selectedDateRange: string;            // Current date range
  setSelectedDateRange: (range: string) => void;
  setShowDatePicker: (show: boolean) => void;
  handleRefresh: () => void;            // Refresh function
  isLoading: boolean;                   // Global loading state
  
  // Individual tab loading states
  isLoadingCreatives?: boolean;
  isLoadingCampaigns?: boolean;
  isLoadingAdSets?: boolean;
  isLoadingAds?: boolean;
  isLoadingDemographics?: boolean;
  isLoggedIn?: boolean;
}
```

## Best Practices

1. **Maintain Theme Consistency**: Always use theme-aware styling
2. **Preserve Loading States**: Keep loading indicators for user feedback
3. **Responsive Design**: Test on mobile and tablet breakpoints
4. **Accessibility**: Maintain proper ARIA labels and keyboard navigation
5. **Performance**: Avoid unnecessary re-renders with proper prop management

## Troubleshooting Header Issues

### Tab Not Switching
- Check if `setActiveTab` is properly passed from MetaDashboard
- Verify tab ID matches exactly in tabs array

### Theme Not Applying
- Ensure Header is wrapped in `DashboardThemeProvider`
- Check if `useDashboardTheme()` hook is working

### Styling Not Updating
- Verify Tailwind classes are correct
- Check for CSS specificity conflicts
- Ensure theme context is updating properly

### New Controls Not Working
- Verify onClick handlers are properly defined
- Check if required state/setState functions are passed as props
- Ensure proper error handling for new functionality

This guide should give you everything you need to customize the header effectively while maintaining the dashboard's functionality and design consistency.
