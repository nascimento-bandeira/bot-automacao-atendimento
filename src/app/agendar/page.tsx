'use client';

import { useState, useEffect } from 'react';
import { tenant } from "@/config/tenant";
import { formatCurrency } from "@/utils/format";
import { User, Phone, Scissors, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';

export default function BookingPage() {
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [servs, profs, hours] = await Promise.all([
        api.getServices(tenant.slug),
        api.getProfessionals(tenant.slug),
        api.getBusinessHours(tenant.slug)
      ]);
      if (servs) setServices(servs);
      if (hours) setBusinessHours(hours);
      if (profs && profs.length > 0) {
        setProfessionals(profs);
        setSelectedProfessional(profs[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = (rangeStr: string) => {
    if (!rangeStr || rangeStr === 'FECHADO') return [];
    
    // Suporta vários tipos de traços (hífen, en-dash, em-dash) e normaliza
    const normalizedRange = rangeStr.replace(/[—–-]/g, '|');
    if (!normalizedRange.includes('|')) return [];

    const [start, end] = normalizedRange.split('|').map(t => t.trim());
    const slots: string[] = [];
    
    let current = new Date(`2024-01-01T${start}:00`);
    const limit = new Date(`2024-01-01T${end}:00`);
    
    while (current < limit) {
      const hours = current.getHours().toString().padStart(2, '0');
      const minutes = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return slots;
  };

  useEffect(() => {
    if (date && businessHours.length > 0) {
      const selectedDate = new Date(date + 'T00:00:00');
      const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday...
      
      // Mapeamento simples baseado nos labels padrão
      // Ajustável se os labels mudarem drasticamente
      let dayRange;
      if (dayOfWeek === 0) {
        dayRange = businessHours.find(h => h.label.toLowerCase().includes('domingo'));
      } else if (dayOfWeek === 6) {
        dayRange = businessHours.find(h => h.label.toLowerCase().includes('sábado') || h.label.toLowerCase().includes('sabado'));
      } else {
        dayRange = businessHours.find(h => h.label.toLowerCase().includes('segunda') || h.label.toLowerCase().includes('sexta'));
      }

      const slots = dayRange ? generateTimeSlots(dayRange.time) : [];
      setAvailableSlots(slots);
      if (slots.length > 0) setTime(slots[0]);
      else setTime("");
    }
  }, [date, businessHours]);

  const handleConfirm = async () => {
    if (!selectedService || !selectedProfessional) return;
    setIsBooking(true);
    try {
      await api.createAppointment(tenant.slug, {
        client_name: name,
        service: selectedService.name,
        time: time,
        duration: `${selectedService.duration_minutes} MIN`,
        status: 'AGENDADO'
      });
      setIsSuccess(true);
    } catch(e) {
      console.error("Erro ao agendar", e);
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 size={48} strokeWidth={3} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agendamento Realizado!</h2>
          <p className="text-slate-500 font-medium">Sua experiência foi reservada com sucesso.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full max-w-xs bg-slate-950 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-950/20 active:scale-95 transition-all"
        >
          Voltar para Início
        </button>
      </main>
    );
  }

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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
              const service = services.find(s => s.id === e.target.value);
              if (service) setSelectedService(service);
            }}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-stitch outline-none appearance-none font-bold text-slate-800"
          >
            <option value="" disabled>Selecione o Serviço</option>
            {services.map(service => (
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
            <input 
              type="date" 
              className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-stitch text-sm font-bold outline-none" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Horário</label>
          <select 
            className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-stitch text-sm font-bold outline-none appearance-none disabled:opacity-50"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={availableSlots.length === 0}
          >
            {availableSlots.length > 0 ? (
              availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))
            ) : (
              <option value="">Indisponível</option>
            )}
          </select>
        </div>
      </section>

      {/* 5. Profissionais Disponíveis */}
      <section className="space-y-4">
        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Profissional</label>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {professionals.map(pro => (
            <button 
              key={pro.id}
              onClick={() => setSelectedProfessional(pro)}
              className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedProfessional?.id === pro.id ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' : 'bg-white border-slate-100 shadow-stitch'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${selectedProfessional?.id === pro.id ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {pro.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">{pro.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{pro.role}</p>
              </div>
              {selectedProfessional?.id === pro.id && <CheckCircle2 size={16} className="text-brand-600" />}
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
                <p className="font-bold text-slate-900">{selectedService.duration_minutes} min</p>
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
          disabled={!selectedService || !name || !date || isBooking}
          onClick={handleConfirm}
          className={`w-full py-4 rounded-2xl font-black shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2
            ${isBooking ? 'bg-slate-100 text-slate-400' : 'bg-linear-to-r from-brand-500 to-brand-600 text-white shadow-brand-500/20'}
          `}
        >
          {isBooking ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          ) : 'Confirmar Agendamento'}
        </button>
      </footer>

    </main>
  );
}