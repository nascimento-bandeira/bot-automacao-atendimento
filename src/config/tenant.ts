import { TenantConfig } from "@/types";

export const tenant: TenantConfig = {
  slug: "barbearia",
  name: "Barbearia",
  ownerName: "Mateus", 
  logoUrl: "/next.svg", 
  whatsappNumber: "5511999999999",
  colors: {
    primary: "bg-slate-950",
    accent: "bg-brand-600", 
  },
  services: [
    { id: "c1", name: "Corte Social", price: 45, durationMinutes: 30 },
    { id: "b1", name: "Barba Completa", price: 35, durationMinutes: 30 },
  ],
  stats: {
    revenueToday: 2500,
    sessionsToday: 15,
  },
  nextClient: {
    name: "Maria Eduarda",
    procedure: "Corte & Coloração",
    time: "14:30",
    minutesUntil: 15,
    status: "Confirmado",
    imageUrl: "/next.svg",
  },
  highlights: [
    { label: "Média Avaliações", value: "4.9", type: "star" },
    { label: "vs Semana Anterior", value: "+12%", type: "growth" },
  ],
  professionals: [
    { id: 'p1', name: 'Ricardo Silva', role: 'Barbeiro', imageUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=ricardo' },
    { id: 'p2', name: 'Ana Oliveira', role: 'Especialista em Corte', imageUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=ana' },
  ],
  appointments: [
    { id: '1', clientName: 'Alessandra Martins', service: 'Corte & Escova', time: '09:00', duration: '60 MIN', status: 'AGENDADO', imageUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alessandra' },
    { id: '2', clientName: 'Bruno Rodriguez', service: 'Barba & Relaxamento', time: '10:30', duration: '45 MIN', status: 'REALIZADO', imageUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=bruno' },
    { id: '3', clientName: 'Camila Vieira', service: 'Coloração Premium', time: '14:00', duration: '120 MIN', status: 'CANCELADO', imageUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=camila' },
    { id: '4', clientName: 'Juliana Paes', service: 'Manicure & Pedicure', time: '16:30', duration: '90 MIN', status: 'AGENDADO', imageUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=juliana' },
  ], 
  businessHours: [
    { label: 'Segunda - Sexta', time: '09:00 — 20:00', closed: false },
    { label: 'Sábado', time: '08:00 — 18:00', closed: false },
    { label: 'Domingo', time: 'FECHADO', closed: true },
  ],
  financialData: {
    totalMonth: 28450,
    growthPercent: 15.4,
    weeklyStats: [
      { day: 'Seg', value: 2100 },
      { day: 'Ter', value: 4280 }, // Valor que bate com a home
      { day: 'Qua', value: 3500 },
      { day: 'Qui', value: 2900 },
      { day: 'Sex', value: 5100 },
      { day: 'Sáb', value: 6800 },
      { day: 'Dom', value: 0 },
    ],
    topServices: [
      { name: 'Corte Feminino', total: 12400, count: 68 },
      { name: 'Coloração', total: 8200, count: 25 },
      { name: 'Manicure', total: 3450, count: 40 },
    ]
  }
};
