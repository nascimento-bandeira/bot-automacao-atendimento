import { tenant } from "@/config/tenant";
import { Bell } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex justify-between items-center p-6 bg-surface">
      <div className="flex items-center gap-3">
        <img src={tenant.logoUrl || '/next.svg'} alt="Logo" width={32} height={32} className="rounded-full object-cover" />
        <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
          {tenant.name}
        </h1>
      </div>
      <button className="text-slate-500 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
        <Bell size={20} />
      </button>
    </header>
  );
}