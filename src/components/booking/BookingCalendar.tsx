'use client';

import { useState } from 'react';
import { tenant } from '@/config/tenant';
import { Service } from '@/types';

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleFinalizeBooking = () => {
    if (!selectedDate || !selectedTime || !selectedService) return;

    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const message = `Olá, gostaria de agendar um horário:\n\n` +
                   `Serviço: *${selectedService.name}*\n` +
                   `Data: *${formattedDate}*\n` +
                   `Horário: *${selectedTime}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${tenant.whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">Agende seu Horário</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          
    {/* Passo 1: Serviço */}
        <div className="flex flex-col w-full">
            <h3 className="font-semibold mb-4 text-slate-700">1. Selecione o Serviço</h3>
  
            <div className="relative group">
                <select 
                onChange={(e) => {
                    const service = tenant.services.find(s => s.id === e.target.value);
                    if (service) setSelectedService(service);
                }}
                defaultValue=""
                className="w-full p-4 rounded-lg border transition-all outline-none appearance-none
               bg-slate-800 text-white border-slate-700 
               focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer
               font-medium shadow-sm pr-10"
                >
                    <option value="" disabled className="bg-slate-800">Escolha um serviço...</option>
                    {tenant.services.map(service => (
                        <option key={service.id} value={service.id} className="bg-slate-800 py-2">
                            {service.name} — {service.duration_minutes} min ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)})
                        </option>
                    ))}
                </select>
    
                {/* Ícone de seta customizado (opcional, para estética) */}
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Feedback visual do que foi selecionado (Opcional, mas ajuda o usuário) */}
            {selectedService && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800 text-sm">
                    Selecionado: <strong>{selectedService.name}</strong>
                </div>
            )}
        </div>

          {/* Passo 2: Data */}
         <div className="flex flex-col items-center w-full">
            <h3 className="font-semibold mb-4 text-slate-700 text-center w-full">2. Escolha a Data</h3> 
            <div className="w-full flex justify-center">
                <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} 
                className="w-full p-4 rounded-lg border transition-all outline-none
         bg-white text-slate-800 border-slate-200 
         focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer
         font-medium shadow-sm"/>
            </div>
            </div>

          {/* Passo 3: Horários */}
    <div className="flex flex-col w-full">
    <h3 className="font-semibold mb-4 text-slate-700">3. Escolha o Horário</h3>
  
    <div className="space-y-4">
        {/* Divisão por períodos para melhor UX */}
        <div>
         <p className="text-xs font-bold uppercase text-slate-400 mb-2">Manhã</p>
        <div className="grid grid-cols-4 gap-2">
        {['08:00', '09:00', '10:00', '11:00'].map(time => (
          <button 
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`py-2 text-sm font-semibold rounded-md border transition-all
              ${selectedTime === time 
                ? `${tenant.colors.accent} text-white border-transparent shadow-md scale-105` 
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'}`}
          >
            {time}
          </button>
        ))}
        </div>
    </div>

    <div>
      <p className="text-xs font-bold uppercase text-slate-400 mb-2">Tarde</p>
      <div className="grid grid-cols-4 gap-2">
        {['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(time => (
          <button 
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`py-2 text-sm font-semibold rounded-md border transition-all
              ${selectedTime === time 
                ? `${tenant.colors.accent} text-white border-transparent shadow-md scale-105` 
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'}`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  </div>

    {/* Botão de Ação Principal agora mais destacado */}
    <button 
        onClick={handleFinalizeBooking}
        disabled={!selectedDate || !selectedTime || !selectedService}
        className={`mt-8 w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg
        ${tenant.colors.accent} hover:brightness-110 active:scale-95
        disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed`}
    >
        Confirmar Agendamento
        </button>
        </div>

        </div>
      </div>
    </section>
  );
}