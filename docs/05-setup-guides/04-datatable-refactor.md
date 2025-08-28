# DataTable Refactor - Comprehensive Guide

## Overview

This refactor introduces a **reusable, generic DataTable component** that centralizes all table functionality including sorting, filtering, selection, and bulk actions. The system provides type safety, performance optimizations, and consistent UI/UX across all tabs.

## Architecture

### Core Components

1. **`DataTable.tsx`** - Main reusable table component
2. **`useTableFilterSort.ts`** - Custom hook for filtering and sorting logic
3. **`useDebounce.ts`** - Performance optimization hook
4. **`types.ts`** - Comprehensive TypeScript interfaces

### Key Features

- ✅ **Generic & Reusable** - Works with any data type
- ✅ **Type Safe** - Full TypeScript support
- ✅ **Performance Optimized** - Memoized filtering/sorting
- ✅ **Consistent UI** - Unified design across all tabs
- ✅ **Advanced Filtering** - Global search + per-column filters
- ✅ **Sorting** - Multi-column sorting with visual indicators
- ✅ **Bulk Actions** - Select all/none with bulk operations
- ✅ **Accessibility** - Keyboard navigation and semantic HTML
- ✅ **Loading States** - Skeleton loading animations
- ✅ **Empty States** - Customizable empty state messages

## Usage Examples

### Basic Usage

```tsx
import { DataTable } from './DataTable';
import { Campaign, ColumnDefinition } from './types';

const columns: ColumnDefinition<Campaign>[] = [
  {
    key: 'name',
    header: 'Campaign Name',
    sortable: true,
    searchable: true
  },
  {
    key: 'insights.spend',
    header: 'Spend',
    sortable: true,
    align: 'right',
    render: (value) => formatCurrency(value)
  }
];

<DataTable
  data={campaigns}
  columns={columns}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  selectedItems={selectedItems}
  onItemSelect={handleSelectItem}
  onBulkAction={handleBulkAction}
  sortField={sortField}
  sortDirection={sortDirection}
  onSort={handleSort}
  isLoading={isLoading}
  title="Campaigns"
  subtitle={`${activeCampaigns} active campaigns`}
/>
```

### Advanced Usage with Custom Rendering

```tsx
const columns: ColumnDefinition<CreativeData>[] = [
  {
    key: 'name',
    header: 'Creative',
    render: (value, creative) => (
      <div className="flex items-center space-x-3">
        <img src={creative.thumbnailUrl} className="w-12 h-12 rounded" />
        <div>
          <div className="font-medium">{creative.name}</div>
          <div className="text-sm text-gray-500">{creative.adsetName}</div>
        </div>
      </div>
    )
  },
  {
    key: 'performance',
    header: 'Performance',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'excellent' ? 'bg-green-100 text-green-800' :
        value === 'good' ? 'bg-blue-100 text-blue-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )
  }
];
```

## Column Definition Interface

```typescript
interface ColumnDefinition<T> {
  key: keyof T | string;           // Field key or nested path like 'insights.spend'
  header: string;                   // Column header text
  render?: (value: any, row: T) => React.ReactNode;  // Custom render function
  sortable?: boolean;               // Enable sorting
  searchable?: boolean;             // Include in global search
  filterType?: 'text' | 'number' | 'date' | 'select';  // Filter type
  width?: string;                   // Column width (e.g., 'w-32')
  align?: 'left' | 'center' | 'right';  // Text alignment
  className?: string;               // Additional CSS classes
}
```

## DataTable Props

```typescript
interface DataTableProps<T> {
  data: T[];                        // Array of data items
  columns: ColumnDefinition<T>[];   // Column definitions
  searchTerm: string;               // Global search term
  onSearchChange: (term: string) => void;
  selectedItems: number[];          // Selected item IDs
  onItemSelect: (id: number) => void;
  onBulkAction: (action: string) => void;
  sortField?: keyof T | string;     // Current sort field
  sortDirection?: 'asc' | 'desc';   // Sort direction
  onSort?: (field: keyof T | string) => void;
  isLoading?: boolean;              // Loading state
  title?: string;                   // Table title
  subtitle?: string;                // Table subtitle
  showBulkActions?: boolean;        // Show bulk action bar
  bulkActions?: Array<{             // Custom bulk actions
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  showExport?: boolean;             // Show export button
  onExport?: () => void;            // Export handler
  showFilters?: boolean;            // Show advanced filters
  filters?: FilterConfig[];         // Advanced filters
  onFiltersChange?: (filters: FilterConfig[]) => void;
  pagination?: {                    // Pagination config
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  emptyState?: {                    // Custom empty state
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}
```

## Performance Optimizations

### 1. Memoized Filtering & Sorting

The `useTableFilterSort` hook uses `useMemo` to prevent unnecessary re-computations:

```typescript
const { sortedData, totalCount, filteredCount } = useTableFilterSort({
  data,
  searchTerm,
  searchableFields,
  filters,
  sortConfig: sortField && sortDirection ? { field: sortField, direction: sortDirection } : undefined
});
```

### 2. Debounced Search

Use the `useDebounce` hook for search input:

```typescript
const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

### 3. Efficient Rendering

- Virtual scrolling for large datasets (planned)
- Pagination support
- Optimized re-renders with React.memo

## Migration Guide

### Before (Old Table Structure)

```tsx
// Old CampaignsTab with manual table implementation
const filteredCampaigns = campaigns.filter(campaign => {
  return campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         campaign.status.toLowerCase().includes(searchTerm.toLowerCase());
});

<table>
  <thead>
    <tr>
      <th onClick={() => handleSort('name')}>Campaign Name</th>
      <th onClick={() => handleSort('status')}>Status</th>
    </tr>
  </thead>
  <tbody>
    {filteredCampaigns.map(campaign => (
      <tr key={campaign.id}>
        <td>{campaign.name}</td>
        <td>{campaign.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### After (New DataTable)

```tsx
// New CampaignsTab using DataTable
const columns: ColumnDefinition<Campaign>[] = [
  {
    key: 'name',
    header: 'Campaign Name',
    sortable: true,
    searchable: true
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    searchable: true,
    render: (value) => <StatusBadge status={value} />
  }
];

<DataTable
  data={campaigns}
  columns={columns}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  selectedItems={selectedItems}
  onItemSelect={handleSelectItem}
  onBulkAction={handleBulkAction}
  sortField={sortField}
  sortDirection={sortDirection}
  onSort={handleSort}
  isLoading={isLoading}
  title="Campaigns"
/>
```

## Benefits

### 1. **Consistency**
- All tables have the same look and feel
- Unified search, sorting, and bulk action interfaces
- Consistent loading and empty states

### 2. **Maintainability**
- Single source of truth for table logic
- Easy to add new features to all tables at once
- Reduced code duplication

### 3. **Type Safety**
- Full TypeScript support with generic types
- Compile-time error checking for column definitions
- IntelliSense support for data properties

### 4. **Performance**
- Memoized filtering and sorting
- Debounced search input
- Optimized re-renders

### 5. **Accessibility**
- Keyboard navigation support
- Semantic HTML structure
- ARIA labels and roles

### 6. **Extensibility**
- Easy to add new column types
- Custom render functions for complex cells
- Pluggable bulk actions and filters

## Advanced Features

### 1. Nested Property Access

```typescript
{
  key: 'insights.spend',
  header: 'Spend',
  sortable: true,
  render: (value) => formatCurrency(value)
}
```

### 2. Custom Cell Rendering

```typescript
{
  key: 'status',
  header: 'Status',
  render: (value) => (
    <span className={`px-2 py-1 rounded-full ${
      value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
      value === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800'
    }`}>
      {value}
    </span>
  )
}
```

### 3. Advanced Filtering

```typescript
const filters: FilterConfig[] = [
  {
    field: 'insights.spend',
    operator: 'greater',
    value: 1000
  },
  {
    field: 'status',
    operator: 'in',
    value: ['ACTIVE', 'PAUSED']
  }
];
```

### 4. Custom Bulk Actions

```typescript
bulkActions={[
  { label: 'Pause Selected', action: 'pause', variant: 'secondary' },
  { label: 'Delete Selected', action: 'delete', variant: 'danger' },
  { label: 'Export Selected', action: 'export', variant: 'primary' }
]}
```

## Future Enhancements

1. **Virtual Scrolling** - For tables with thousands of rows
2. **Advanced Filters UI** - Visual filter builder
3. **Column Resizing** - Drag to resize columns
4. **Column Reordering** - Drag to reorder columns
5. **Export Formats** - CSV, Excel, PDF export
6. **Row Grouping** - Group rows by common values
7. **Inline Editing** - Edit cell values directly
8. **Row Details** - Expandable row details
9. **Multi-Select** - Shift+click for range selection
10. **Keyboard Shortcuts** - Ctrl+A for select all, etc.

## Testing

The DataTable component is designed to be easily testable:

```typescript
// Test column definitions
const testColumns: ColumnDefinition<TestData>[] = [
  { key: 'name', header: 'Name', sortable: true }
];

// Test data
const testData: TestData[] = [
  { id: 1, name: 'Test Item' }
];

// Test component
<DataTable
  data={testData}
  columns={testColumns}
  searchTerm=""
  onSearchChange={jest.fn()}
  selectedItems={[]}
  onItemSelect={jest.fn()}
  onBulkAction={jest.fn()}
/>
```

This refactor provides a solid foundation for all table functionality in the dashboard while maintaining flexibility and type safety. 