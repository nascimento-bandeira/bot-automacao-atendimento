import { tenant } from "@/config/tenant";
import { Star, TrendingUp } from "lucide-react";

export default function Highlight() {
    return(
    <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-stitch space-y-6">
        <h3 className="text-lg font-extrabold text-slate-950 tracking-tight">Destaques da Semana</h3>
        <div className="grid grid-cols-2 gap-4">
          {tenant.highlights.map((highlight, index) => {
            const isStar = highlight.type === 'star';
            const Icon = isStar ? Star : TrendingUp;
            return (
              <div key={index} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-stitch space-y-4 group">
                <div className="flex justify-between items-center">
                  <div className={`p-3 rounded-xl ${isStar ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Icon size={20} />
                  </div>
                  {/* Menu futuro */}
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-slate-950">{highlight.value}</p>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {highlight.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

  );
}