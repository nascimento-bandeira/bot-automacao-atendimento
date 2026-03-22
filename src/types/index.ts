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
}