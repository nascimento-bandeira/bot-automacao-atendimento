import { tenant } from "@/config/tenant";
import Image from "next/image";
import { MoreVertical } from "lucide-react";

export default function ClientCard() {
  return (
    <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-stitch space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-extrabold text-slate-950 tracking-tight">
          Próximo Cliente
        </h3>
        <button className="text-brand-600 font-semibold text-sm">
          Ver todos
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
        <div className="relative p-1 rounded-full bg-linear-to-tr from-amber-400 to-transparent">
        <Image
          src={tenant.nextClient.imageUrl || "/next.svg"}
          alt={tenant.nextClient.name}
          width={48}
          height={48}
          className="rounded-full bg-slate-100 border-2 shadow-inner"
        />
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-slate-900 leading-tight">{tenant.nextClient.name}</h4>
          <p className="text-xs text-slate-400 font-semibold">
            {tenant.nextClient.procedure}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-black text-slate-950 leading-none">
            {tenant.nextClient.time}
          </p>
          <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">
            em {tenant.nextClient.minutesUntil} min
          </p>
        </div>
      </div>

      {/* Linha de Progresso e Status */}
      <div className="flex items-center gap-3 px-4 pb-2">
        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 w-2/3 rounded-full" />
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
          Status:
          <span className="text-amber-600 font-bold bg-slate-100 px-2 py-1 rounded">
            {tenant.nextClient.status}
          </span>
        </p>
      </div>
    </section>
  );
}