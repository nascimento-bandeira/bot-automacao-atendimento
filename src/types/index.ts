export interface TenantConfig {
  slug: string;
  name: string;
  logoUrl?: string;
  whatsappNumber: string;
  colors: {
    primary: string;
    accent: string;
  };
  ownerName: string;
  highlights: {
    label: string;
    value: string;
    type: 'star' | 'growth';
  }[];
  financialData: {
    totalMonth: number;
    growthPercent: number;
    weeklyStats: { day: string; value: number }[];
    topServices: { name: string; total: number; count: number }[];
  };
}