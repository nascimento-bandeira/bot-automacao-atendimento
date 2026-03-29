import { tenant } from "@/config/tenant";
import { Bell } from "lucide-react";


export function Header() {
  return (
    <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={tenant.logoUrl || '/next.svg'} alt={tenant.name} width={40} height={40} className="rounded-full bg-slate-100 object-cover" />
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            {tenant.name}
          </h1>
        </div>
        <button className="text-slate-500 hover:text-brand-600 transition p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <Bell size={22} />
        </button>
      </header>
  );
}