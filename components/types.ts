export interface ConnectedAccount {
  id: string;
  name: string;
  status: 'connected' | 'pending';
  lastSync: string;
  spend: string;
  campaigns: number;
}

export interface Notification {
  id: number;
  type: 'warning' | 'success' | 'info';
  message: string;
  time: string;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

// Data Types
export interface Campaign {
  id: number;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  insights: {
    spend: number;
    clicks: number;
    impressions: number;
    reach: number;
    ctr: string;
    cpc: number;
    cpm: number;
  };
  objective: string;
  startDate: string;
  endDate: string;
}

export interface Adset {
  id: number;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  reach: number;
  frequency: number;
  campaignName: string;
}

export interface Ad {
  id: number;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  reach: number;
  frequency: number;
  campaignName: string;
  adsetName: string;
}

export interface CreativeAsset {
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface CreativeData {
  id: number;
  name: string;
  description?: string;
  campaignName: string;
  adsetName: string;
  creativeType: 'image' | 'video' | 'carousel' | 'dynamic';
  thumbnailUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  assets?: CreativeAsset[]; // For carousel/dynamic creatives
  clicks: number;
  impressions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  reach: number;
  frequency: number;
  roas?: number;
  conversions?: number;
  conversionRate?: number;
  costPerConversion?: number;
  status: string;
  createdAt: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  fatigueLevel: 'low' | 'medium' | 'high';
  tags?: string[];
  notes?: string;
}

export interface DemographicsData {
  age: string;
  gender: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
}

// DataTable Types
export interface ColumnDefinition<T> {
  key: keyof T | string; // string for nested properties like 'insights.spend'
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  filterType?: 'text' | 'number' | 'date' | 'select';
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface FilterConfig {
  field: keyof any;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  secondaryValue?: any; // For 'between' operator
}

export interface SortConfig {
  field: keyof any;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItems: number[];
  onItemSelect: (id: number) => void;
  onBulkAction: (action: string) => void;
  sortField?: keyof T | string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: keyof T | string) => void;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  showBulkActions?: boolean;
  bulkActions?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  showExport?: boolean;
  onExport?: () => void;
  showFilters?: boolean;
  filters?: FilterConfig[];
  onFiltersChange?: (filters: FilterConfig[]) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  emptyState?: {
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export interface UseTableFilterSortProps<T> {
  data: T[];
  searchTerm: string;
  searchableFields: (keyof T | string)[];
  filters: FilterConfig[];
  sortConfig?: SortConfig;
}

export interface UseTableFilterSortReturn<T> {
  filteredData: T[];
  sortedData: T[];
  totalCount: number;
  filteredCount: number;
} 