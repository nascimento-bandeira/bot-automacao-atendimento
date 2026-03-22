import { TenantConfig } from "@/types";

export const tenant: TenantConfig = {
  slug: "barbearia",
  name: "Barbearia",
  whatsappNumber: "5511999999999",
  colors: {
    primary: "bg-slate-950",
    accent: "bg-blue-600",
  },
  services: [
    { id: "c1", name: "Corte Social", price: 45, durationMinutes: 30 },
    { id: "b1", name: "Barba Completa", price: 35, durationMinutes: 30 },
    { id: "cb1", name: "Corte + Barba", price: 70, durationMinutes: 60 },
  ],
};
