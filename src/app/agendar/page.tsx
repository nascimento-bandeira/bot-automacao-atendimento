'use client';

import { useState } from 'react';
import { tenant } from "@/config/tenant";
import { formatCurrency } from "@/utils/format";
import { User, Phone, Scissors, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<typeof tenant.services[0] | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState(tenant.professionals[0]);

  return (
    <main className="min-h-screen bg-surface p-6 pb-32 max-w-lg mx-auto space-y-8">
      
      {/* 1. Título e Subtítulo */}
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agende sua experiência</h1>
        <p className="text-slate-500 font-medium">Personalize seu atendimento.</p>
      </header>

      {/* 2. Inputs de Contato */}
      <section className="space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
            <User size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Seu nome completo"
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-stitch outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
          />
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
            <Phone size={18} />
          </span>
          <input 
            type="tel" 
            placeholder="Telefone de contato"
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-stitch outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
          />
        </div>
      </section>

      {/* 3. Seleção de Serviço (Dropdown) */}
      <section className="space-y-3">
        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Selecione o Serviço</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-brand-600">
            <Scissors size={18} />
          </span>
          <select 
            value={selectedService?.id || ""} // Garante que volte ao placeholder se necessário
            onChange={(e) => {
              const service = tenant.services.find(s => s.id === e.target.value);
              if (service) setSelectedService(service);
            }}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-stitch outline-none appearance-none font-bold text-slate-800"
          >
            <option value="" disabled>Selecione o Serviço</option>
            {tenant.services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 4. Data e Horário */}
      <section className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Data</label>
          <div className="relative">
            <input type="date" className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-stitch text-sm font-bold outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Horário</label>
          <select className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-stitch text-sm font-bold outline-none appearance-none">
            <option>09:00</option>
            <option>10:00</option>
            <option>14:00</option>
          </select>
        </div>
      </section>

      {/* 5. Profissionais Disponíveis */}
      <section className="space-y-4">
        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Profissional</label>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {tenant.professionals.map(pro => (
            <button 
              key={pro.id}
              onClick={() => setSelectedProfessional(pro)}
              className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedProfessional.id === pro.id ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' : 'bg-white border-slate-100 shadow-stitch'}`}
            >
              <Image src={pro.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${pro.name}`} alt={pro.name} width={40} height={40} className="rounded-xl bg-slate-100" />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">{pro.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{pro.role}</p>
              </div>
              {selectedProfessional.id === pro.id && <CheckCircle2 size={16} className="text-brand-600" />}
            </button>
          ))}
        </div>
      </section>

      {/* 6. Resumo e Valor Final */}
      <footer className="fixed bottom-20 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 max-w-lg mx-auto rounded-t-4xl shadow-2xl">
        {selectedService && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Tempo Médio</p>
                <p className="font-bold text-slate-900">{selectedService.durationMinutes} min</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Valor Total</p>
              <p className="text-2xl font-black text-brand-600">{formatCurrency(selectedService.price)}</p>
            </div>
          </div>
        )}
        {!selectedService && (
          <div className="flex justify-center items-center mb-4 min-h-[48px]">
             <p className="text-slate-400 font-bold text-sm">Selecione um serviço para continuar</p>
          </div>
        )}
        <button 
          disabled={!selectedService}
          className="w-full bg-linear-to-r from-brand-500 to-brand-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
        >
          Confirmar Agendamento
        </button>
      </footer>

    </main>
  );
}