import { tenant } from "@/config/tenant";
import { formatCurrency } from "@/utils/format";

export function Services() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenant.services.map((service) => (
          <div 
            key={service.id} 
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-stitch hover:shadow-lg transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-brand-50 p-4 rounded-2xl text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758L5 19m0-14l4.121 4.121" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-slate-900">
                {formatCurrency(service.price)}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{service.name}</h3>
            <p className="text-slate-500 text-sm font-medium">
              Duração aproximada: {service.duration_minutes} min
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}