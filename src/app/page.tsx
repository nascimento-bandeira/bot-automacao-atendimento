import { Header } from "@/components/landing/Header";
import Link from "next/link";
import { tenant } from "@/config/tenant";
import Highlight from "@/components/landing/Highlight";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import ClientCard from "@/components/booking/ClientCard";
import { api } from "@/services/api";

export const revalidate = 0; // Disable cache for real-time dashboard

export default async function Home() {
  let settings, appointments = [];
  try {
    const [setts, apps] = await Promise.all([
      api.getSettings(tenant.slug),
      api.getAppointments(tenant.slug)
    ]);
    settings = setts;
    appointments = apps || [];
  } catch(e) { console.error(e) }

  // Calcular estatísticas simples baseadas nos appointments
  const doneAppointments = appointments.filter(a => a.status === 'REALIZADO');
  const upcomingAppointments = appointments.filter(a => a.status === 'AGENDADO');
  
  const revenueToday = doneAppointments.reduce((acc, curr) => {
    // Attempt to extract numeric price from service string if possible, or assume a fixed average (R$45) for MVP compatibility
    return acc + 45; 
  }, 0);
  const sessionsToday = doneAppointments.length;
  
  const nextClient = upcomingAppointments[0] ? {
    name: upcomingAppointments[0].client_name,
    procedure: upcomingAppointments[0].service,
    time: upcomingAppointments[0].time,
    status: upcomingAppointments[0].status
  } : null;

  return (
    <main className="min-h-screen pb-20">
      <Header />

      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-16">
        {/* Hero Simples */}
        <section className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bem-vinda de volta</p>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight">
            Olá, {settings?.owner_name || 'Gestor'}
          </h2>
        </section>

        <Link href="/agendar" className="w-full bg-linear-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg shadow-[0_10px_20px_-5px_rgba(217,119,6,0.3)] active:scale-[0.98] transition-all">
          <div className="bg-white/20 p-1 rounded-full">
            <Plus size={20} strokeWidth={3} />
          </div>
          Novo Agendamento
        </Link>

        
        <div className="grid grid-cols-2 gap-4">
          <Link href="/analises">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-stitch border-l-4 border-l-amber-400 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita (Est.)</p>
          <p className="text-2xl font-extrabold text-slate-950">
            {formatCurrency(revenueToday)}
          </p>
        </div>
          </Link>
          <Link href="/analises">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-stitch border-l-4 border-l-slate-200 space-y-1 h-full">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sessões</p>
              <p className="text-3xl font-black text-slate-950">
                {sessionsToday}
              </p>
            </div>
          </Link>
      </div>

        {nextClient && <ClientCard client={nextClient} />}
        <div className="bg-white rounded-4xl shadow-stitch border border-slate-50 overflow-hidden">
          <Highlight />
        </div>
      </div>
    </main>
  );
}
