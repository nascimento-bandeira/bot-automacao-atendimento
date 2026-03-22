import { tenant } from "@/config/tenant";
import { formatCurrency } from "@/utils/format";

export function Services() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">Nossos Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tenant.services.map((service) => (
            <div key={service.id} className="border border-slate-200 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-slate-900">{service.name}</h3>
              <p className="text-slate-600 text-sm mb-4">{service.durationMinutes} minutos</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}