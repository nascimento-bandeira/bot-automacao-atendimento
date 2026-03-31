'use client';

import { useState, useEffect } from 'react';
import { tenant } from "@/config/tenant";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Plus, Trash2, Clock, X, Check, Calendar as CalendarIcon, Scissors, Settings2 } from "lucide-react";
import Link from 'next/link';
import { formatCurrency, formatDate } from "@/utils/format";
import { api } from "@/services/api";
import { Appointment, Service } from "@/types";

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // Index of generated days

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const [apps, servs] = await Promise.all([
        api.getAppointments(tenant.slug),
        api.getServices(tenant.slug)
      ]);
      setAppointments(apps || []);
      setServices(servs || []);
    } catch (e) {
      console.error("Erro ao buscar agendamentos", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getDays = () => {
    const today = new Date();
    const result = [];
    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      result.push({
        label: weekDays[d.getDay()],
        num: d.getDate(),
        fullDate: d
      });
    }
    return result;
  };

  const days = getDays();
  const currentMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());

  const handleStatusChange = async (id: string, newStatus: Appointment['status']) => {
    setActiveMenuId(null);
    try {
      // Otimista
      setAppointments(appointments.map(app => app.id === id ? { ...app, status: newStatus } : app));
      await api.updateAppointment(id, { status: newStatus });
    } catch (e) {
      console.error("Erro ao atualizar status", e);
      fetchAppointments(); // Reverte em caso de erro
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      setIsModalOpen(false);
      try {
        setAppointments(appointments.map(app => app.id === editingApp.id ? editingApp : app));
        await api.updateAppointment(editingApp.id, {
          time: editingApp.time,
          duration: editingApp.duration,
          service: editingApp.service,
          status: editingApp.status
        });
        setEditingApp(null);
      } catch (e) {
        console.error("Erro ao salvar", e);
        fetchAppointments();
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    setActiveMenuId(null);
    try {
      setAppointments(appointments.filter(app => app.id !== id));
      await api.deleteAppointment(id);
    } catch (e) {
      console.error("Erro ao deletar", e);
      fetchAppointments();
    }
  };

  const filters = ['TODOS', 'AGENDADO', 'REALIZADO', 'CANCELADO'];

  const formatObjDate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const selectedDateStr = formatObjDate(days[selectedDay].fullDate);

  return (
    <main className="min-h-screen bg-surface pb-32">
      <AppHeader />

      <div className="px-6 space-y-6">
        {/* Título e Mês */}
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agendamentos</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{currentMonth}</span>
        </div>

        {/* Calendário Estilo Apple */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all ${
                selectedDay === idx 
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
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Carregando Agendamentos...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum agendamento encontrado</p>
            </div>
          ) : appointments
            .filter(app => {
              // Busca os campos mais prováveis de data no Supabase 
              // Agora usando a coluna oficial 'date' padronizada.
              const dbDateRaw = app.date; 
              if (!dbDateRaw) return false; 

              // Transforma algo como "2026-03-31T14:30:00.000Z" em "2026-03-31"
              const formattedDbDate = dbDateRaw.split('T')[0];
              
              return formattedDbDate === selectedDateStr;
            })
            .filter(app => activeFilter === 'TODOS' || app.status === activeFilter)
            .map((app) => (
              <div 
                key={app.id} 
                className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-stitch relative flex items-center gap-4`}
              >
                {/* Borda Lateral Colorida por Status */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                  app.status === 'AGENDADO' ? 'bg-amber-500' : 
                  app.status === 'REALIZADO' ? 'bg-emerald-500' : 'bg-rose-400'
                }`} />

                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 leading-tight">{app.clientName || app.client_name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{app.service}</p>
                  
                  {/* Status Pill Interno */}
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    app.status === 'AGENDADO' ? 'bg-amber-50 text-amber-600' : 
                    app.status === 'REALIZADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      app.status === 'AGENDADO' ? 'bg-amber-500' : 
                      app.status === 'REALIZADO' ? 'bg-emerald-500' : 'bg-rose-400'
                    }`} />
                    {app.status}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="leading-none text-right flex flex-col items-end gap-1">
                    <p className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-amber-100">
                      {formatDate(app.date || app.created_at)}
                    </p>
                    <p className="text-lg font-black text-slate-950">{app.time}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{app.duration}</p>
                  </div>
                  <div className="relative">
                    <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === app.id ? null : app.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                          activeMenuId === app.id 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                    >
                        <Settings2 size={14} />
                        Gerenciar
                    </button>
                    
                    {activeMenuId === app.id && (
                        <>
                        <div className="fixed inset-0 z-[45]" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ações do Agendamento</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setEditingApp(app);
                                    setIsModalOpen(true);
                                    setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 border-b border-slate-50 flex items-center gap-2"
                            >
                                <Clock size={14} className="text-blue-500" /> Editar / Reagendar
                            </button>
                            <button 
                                onClick={() => handleStatusChange(app.id, 'REALIZADO')}
                                className="w-full text-left px-4 py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 border-b border-slate-50 flex items-center gap-2"
                            >
                                <Check size={14} /> Concluir
                            </button>
                            <button 
                                onClick={() => handleStatusChange(app.id, 'CANCELADO')}
                                className="w-full text-left px-4 py-3 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 border-b border-slate-50 flex items-center gap-2"
                            >
                                <X size={14} /> Cancelar
                            </button>
                            <button 
                                onClick={() => handleDeleteAppointment(app.id)}
                                className="w-full text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Excluir
                            </button>
                        </div>
                        </>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal de Edição */}
      {isModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <form 
                onSubmit={handleUpdateAppointment}
                className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500"
            >
                <div className="p-8 space-y-8">
                    <header className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Editar Agendamento</h3>
                            <p className="text-xs font-medium text-slate-500">Altere os detalhes do procedimento.</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:text-slate-900"
                        >
                            <X size={20} />
                        </button>
                    </header>

                    <div className="space-y-5">
                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Status do Agendamento</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['AGENDADO', 'REALIZADO', 'CANCELADO'].map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setEditingApp({ ...editingApp, status: status as Appointment['status'] })}
                                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border-2 ${
                                            editingApp.status === status
                                            ? status === 'REALIZADO' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' :
                                              status === 'CANCELADO' ? 'bg-rose-50 border-rose-500 text-rose-700' :
                                              'bg-amber-50 border-amber-500 text-amber-700'
                                            : 'bg-white border-slate-100 text-slate-400'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tempo e Horário */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Horário</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400"><Clock size={16} /></span>
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-amber-500"
                                        value={editingApp.time}
                                        onChange={(e) => setEditingApp({ ...editingApp, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Duração</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400"><CalendarIcon size={16} /></span>
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none"
                                        value={editingApp.duration}
                                        onChange={(e) => setEditingApp({ ...editingApp, duration: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Serviço */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Serviço</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400"><Scissors size={16} /></span>
                                <select 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-amber-500 appearance-none"
                                    value={editingApp.service}
                                    onChange={(e) => setEditingApp({ ...editingApp, service: e.target.value })}
                                >
                                    {services.map(s => (
                                        <option key={s.id} value={s.name}>{s.name} - {formatCurrency(s.price)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit"
                            className="flex-1 bg-slate-950 text-white py-4 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-xl shadow-slate-950/20"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </form>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <Link href="/agendar" className="fixed bottom-24 right-6 w-14 h-14 bg-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 border-4 border-white">
        <Plus size={28} strokeWidth={3} />
      </Link>
    </main>
  );
}