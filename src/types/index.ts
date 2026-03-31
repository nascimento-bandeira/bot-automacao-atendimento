export interface Settings {
  id: string;
  slug: string;
  name: string;
  owner_name: string;
  whatsapp_number: string;
  logo_url?: string;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  image_url?: string;
}

export interface Appointment {
  id: string;
  client_name?: string;
  clientName?: string; // Some pages use clientName
  service: string;
  date?: string; // Adicionado para suportar agendamentos reais por dia
  data?: string; // Suporte a tabelas que usam 'data' em português
  created_at?: string;
  time: string;
  duration: string;
  status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO';
}

export interface BusinessHour {
  id: string;
  label: string;
  time: string;
  closed: boolean;
  day_of_week: number;
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
  ownerName: string;
  services: Service[];
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

export interface AvailabilityRule {
  id: string;
  slug: string;
  type: 'specific' | 'weekly' | 'monthly';
  date?: string; // YYYY-MM-DD
  day_of_week?: number; // 0-6
  day_of_month?: number; // 1-31
  start_time: string; // HH:mm
  end_time: string; // HH:mm
}