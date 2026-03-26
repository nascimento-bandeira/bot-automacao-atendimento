'use client';

import { tenant } from "@/config/tenant";
import { AppHeader } from "@/components/navigation/AppHeader";
import { formatCurrency } from "@/utils/format";
import { Clock, Scissors, Users, Plus } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-surface pb-32">
      <AppHeader />

      <div className="px-6 space-y-8">
        {/* Título da Página */}
        <header className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Gerenciamento</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Configurações</h2>
        </header>

        {/* 1. Horário de Funcionamento */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Horário de Funcionamento</h3>
            </div>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-amber-600 transition-colors">Editar</button>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            {tenant.businessHours.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">{item.label}</span>
                <span className={`font-bold ${item.closed ? 'text-amber-500 italic uppercase' : 'text-slate-900'}`}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Serviços & Preços */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Scissors size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Serviços & Preços</h3>
            </div>
            <button className="w-8 h-8 bg-amber-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-900/20 active:scale-90 transition-transform">
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          <div className="space-y-3">
            {tenant.services.map((service, idx) => (
              <div key={service.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-stitch flex items-center gap-4 relative overflow-hidden">
                {/* Barrinha lateral colorida como no modelo */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                  idx === 0 ? 'bg-amber-300' : idx === 1 ? 'bg-indigo-200' : 'bg-stone-300'
                }`} />
                
                <div className="flex-1 ml-2">
                  <h4 className="font-bold text-slate-900">{service.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{service.durationMinutes} MINUTOS</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-amber-700">{formatCurrency(service.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Profissionais */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Profissionais</h3>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {tenant.professionals.map((pro) => (
              <div key={pro.id} className="flex-shrink-0 w-48 space-y-3">
                <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg group">
                  <Image src={pro.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${pro.name}`} alt={pro.name} fill className="object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <p className="absolute bottom-4 left-4 text-white font-black text-xl">{pro.name.split(' ')[0]}</p>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.15em]">{pro.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Botão de Salvar Alterações */}
        <div className="pt-4">
          <button className="w-full bg-linear-to-r from-amber-600 to-amber-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-amber-600/20 active:scale-[0.98] transition-all">
            Salvar Alterações
          </button>
        </div>
      </div>
    </main>
  );
}