export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface TenantConfig {
  slug: string;
  name: string;
  logoUrl?: string;
  whatsappNumber: string;
  colors: {
    primary: string;
    accent: string;
  };
  services: Service[];
  ownerName: string;
  stats: {
    revenueToday: number;
    sessionsToday: number;
  };
  nextClient: {
    name: string;
    procedure: string;
    time: string;
    minutesUntil: number;
    status: string;
    imageUrl?: string;
  };
  highlights: {
    label: string;
    value: string;
    type: 'star' | 'growth';
  }[];
  professionals: {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
  }[];
  appointments: {
    id: string;
    clientName: string;
    service: string;
    time: string;
    duration: string;
    status: string;
    imageUrl?: string;
  }[];
  businessHours: {
    label: string;
    time: string;
    closed: boolean;
  }[];
  financialData: {
    totalMonth: number;
    growthPercent: number;
    weeklyStats: { day: string; value: number }[];
    topServices: { name: string; total: number; count: number }[];
  };
}