'use client';

import { useState } from 'react';
import { tenant } from "@/config/tenant";
import { AppHeader } from "@/components/navigation/AppHeader";
import { formatCurrency } from "@/utils/format";
import { TrendingUp, Calendar, ArrowUpRight, Award } from "lucide-react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('Semana');
  const maxValue = Math.max(...tenant.financialData.weeklyStats.map(s => s.value));

  return (
    <main className="min-h-screen bg-surface pb-32">
      <AppHeader />

      <div className="px-6 space-y-8">
        {/* Título e Seletor de Período */}
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financeiro</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Análises</h2>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            {['Semana', 'Mês'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  period === p ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </header>

        {/* Card de Receita Total */}
        <section className="bg-linear-to-br from-amber-500 to-amber-600 p-6 rounded-4xl shadow-xl shadow-amber-600/20 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Receita Total ({period})</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold opacity-90">R$</span>
              <h3 className="text-4xl font-black tracking-tighter">
                {tenant.financialData.totalMonth.toLocaleString('pt-BR')}
              </h3>
            </div>
            <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black">
              <ArrowUpRight size={14} />
              +{tenant.financialData.growthPercent}% vs período anterior
            </div>
          </div>
          {/* Círculo decorativo ao fundo */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </section>

        {/* Gráfico de Barras Minimalista (CSS Native) */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-stitch space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Desempenho Diário</h4>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          
          <div className="flex items-end justify-between h-40 gap-2 pt-4">
            {tenant.financialData.weeklyStats.map((stat, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                {/* Tooltip simples no hover */}
                <div className="h-full w-full bg-slate-50 rounded-t-xl relative flex items-end overflow-hidden">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                      stat.day === 'Ter' ? 'bg-amber-500' : 'bg-slate-200 group-hover:bg-slate-300'
                    }`}
                    style={{ height: `${(stat.value / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ranking de Serviços */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Award size={20} className="text-amber-600" />
            <h4 className="font-bold text-slate-800">Serviços mais Rentáveis</h4>
          </div>
          
          <div className="space-y-3">
            {tenant.financialData.topServices.map((service, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{service.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{service.count} atendimentos</p>
                  </div>
                </div>
                <p className="font-black text-slate-900">{formatCurrency(service.total)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}