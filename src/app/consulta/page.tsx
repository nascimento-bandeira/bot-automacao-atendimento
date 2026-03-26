'use client';

import { useState } from 'react';
import { tenant } from "@/config/tenant";
import { AppHeader } from "@/components/navigation/AppHeader";
import { MoreVertical, Plus } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';

export default function AgendaPage() {
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [selectedDay, setSelectedDay] = useState(14); // Exemplo: Terça, 14

  const days = [
    { label: 'SEG', num: 13 },
    { label: 'TER', num: 14 },
    { label: 'QUA', num: 15 },
    { label: 'QUI', num: 16 },
    { label: 'SEX', num: 17 },
  ];

  const filters = ['TODOS', 'AGENDADO', 'REALIZADO', 'CANCELADO'];

  return (
    <main className="min-h-screen bg-surface pb-32">
      <AppHeader />

      <div className="px-6 space-y-6">
        {/* Título e Mês */}
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agendamentos</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Maio 2024</span>
        </div>

        {/* Calendário Estilo Apple */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {days.map((day) => (
            <button
              key={day.num}
              onClick={() => setSelectedDay(day.num)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all ${
                selectedDay === day.num 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-105' 
                : 'bg-white text-slate-400 border border-slate-100'
              }`}
            >
              <span className="text-[10px] font-bold uppercase">{day.label}</span>
              <span className="text-xl font-black">{day.num}</span>
            </button>
          ))}
        </div>

        {/* Filtros de Status */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                activeFilter === filter 
                ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' 
                : 'bg-slate-100 text-slate-400'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Lista de Cards */}
        <div className="space-y-4">
          {tenant.appointments
            .filter(app => activeFilter === 'TODOS' || app.status === activeFilter)
            .map((app) => (
              <div 
                key={app.id} 
                className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-stitch relative overflow-hidden flex items-center gap-4`}
              >
                {/* Borda Lateral Colorida por Status */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                  app.status === 'AGENDADO' ? 'bg-amber-500' : 
                  app.status === 'REALIZADO' ? 'bg-slate-300' : 'bg-rose-400'
                }`} />

                <Image src={app.imageUrl || '/next.svg'} alt={app.clientName} width={50} height={50} className="rounded-full bg-slate-100" />
                
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 leading-tight">{app.clientName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{app.service}</p>
                  
                  {/* Status Pill Interno */}
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    app.status === 'AGENDADO' ? 'bg-amber-50 text-amber-600' : 
                    app.status === 'REALIZADO' ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      app.status === 'AGENDADO' ? 'bg-amber-500' : 
                      app.status === 'REALIZADO' ? 'bg-slate-400' : 'bg-rose-500'
                    }`} />
                    {app.status}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <div className="leading-none">
                    <p className="text-lg font-black text-slate-950">{app.time}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{app.duration}</p>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <Link href="/agendar" className="fixed bottom-24 right-6 w-14 h-14 bg-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 border-4 border-white">
        <Plus size={28} strokeWidth={3} />
      </Link>
    </main>
  );
}