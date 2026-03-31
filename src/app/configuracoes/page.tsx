'use client';

import { tenant } from "@/config/tenant";
import { AppHeader } from "@/components/navigation/AppHeader";
import { formatCurrency } from "@/utils/format";
import { Clock, Scissors, Users, Plus, Check, X, User, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Professional, Service, BusinessHour, AvailabilityRule } from "@/types";
import Image from "next/image";

export default function SettingsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [companyName, setCompanyName] = useState(tenant.name);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [newRuleStartTime, setNewRuleStartTime] = useState("09:00");
  const [newRuleEndTime, setNewRuleEndTime] = useState("18:00");
  const [specialDate, setSpecialDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpecialHours, setIsSpecialHours] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newRole, setNewRole] = useState("");

  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("30");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [setts, servs, profs, hours, rules] = await Promise.all([
        api.getSettings(tenant.slug),
        api.getServices(tenant.slug),
        api.getProfessionals(tenant.slug),
        api.getBusinessHours(tenant.slug),
        api.getAvailabilityRules(tenant.slug)
      ]);
      
      if (setts) {
        setWhatsapp(setts.whatsapp_number || '');
        setLogoUrl(setts.logo_url || '');
        setCompanyName(setts.name || tenant.name);
      }
      if (servs) setServices(servs);
      if (profs) setProfessionals(profs);
      if (hours && hours.length > 0) setBusinessHours(hours);
      if (rules) setAvailabilityRules(rules);
    } catch (e) {
      console.error("Erro ao carregar configurações", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (newServiceName && newServicePrice) {
      try {
        const newService = await api.createService(tenant.slug, {
          name: newServiceName,
          price: parseFloat(newServicePrice),
          duration_minutes: parseInt(newServiceDuration),
        });
        setServices([...services, newService]);
        setIsAddingService(false);
        setNewServiceName("");
        setNewServicePrice("");
        setNewServiceDuration("30");
      } catch (e) {
        console.error("Erro ao adicionar serviço", e);
      }
    }
  };

  const extractHoursFromBusinessHour = (dateStr: string) => {
    const targetDate = new Date(`${dateStr}T12:00:00`);
    const dayOfWeek = targetDate.getDay();
    const dayLabels = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const prefix = dayLabels[dayOfWeek];

    const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const getDayIndex = (str: string) => {
      return dayLabels.findIndex(d => str.includes(d));
    };

    const bHour = businessHours.find(h => {
      const label = normalizeStr(h.label);
      if (label.includes(prefix)) return true; // Match direto

      // Avalia ranges no formato "segunda a sexta" ou "seg - sex"
      const parts = label.split(/\s+a\s+|\s*-\s*/);
      if (parts.length === 2) {
         const startIdx = getDayIndex(parts[0]);
         const endIdx = getDayIndex(parts[1]);
         
         if (startIdx !== -1 && endIdx !== -1) {
            if (startIdx <= endIdx) {
               return dayOfWeek >= startIdx && dayOfWeek <= endIdx;
            } else {
               // Range cruzando o fim de semana ex: (Sexta a Segunda -> 5, 6, 0, 1)
               return dayOfWeek >= startIdx || dayOfWeek <= endIdx;
            }
         }
      }
      return false;
    });

    if (!bHour || bHour.closed) {
      return { start: "", end: "", isValid: false, reason: "Fechado neste dia da semana." };
    }

    const times = bHour.time.match(/\d{2}:\d{2}/g);
    if (times && times.length >= 2) {
      return { start: times[0], end: times[1], isValid: true };
    }
    return { start: "09:00", end: "18:00", isValid: true };
  };

  const handleToggleDay = async (formattedDate: string, existingRule?: AvailabilityRule) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (existingRule) {
        await api.deleteAvailabilityRule(existingRule.id);
        setAvailabilityRules(availabilityRules.filter(r => r.id !== existingRule.id));
      } else {
        const hourData = extractHoursFromBusinessHour(formattedDate);
        if (!hourData.isValid) return; // Cannot click on globally closed Red days directly

        // A click on an implicitly Green day (isValid = true) turns it White (Day Off) by saving 00:00 - 00:00
        const data: Omit<AvailabilityRule, 'id' | 'slug'> = {
          type: 'specific',
          date: formattedDate,
          start_time: "00:00",
          end_time: "00:00",
        };
        const newRule = await api.createAvailabilityRule(tenant.slug, data);
        setAvailabilityRules([...availabilityRules, newRule]);
      }
    } catch (e) {
      console.error("Erro ao alterar dia", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSpecialDay = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const existing = availabilityRules.find(r => r.date === specialDate);
      if (existing) {
        await api.deleteAvailabilityRule(existing.id);
      }
      const data: Omit<AvailabilityRule, 'id' | 'slug'> = {
        type: 'specific',
        date: specialDate,
        start_time: newRuleStartTime,
        end_time: newRuleEndTime,
      };
      
      const newRule = await api.createAvailabilityRule(tenant.slug, data);
      const filtered = availabilityRules.filter(r => r.date !== specialDate);
      setAvailabilityRules([...filtered, newRule]);
      
      setIsSpecialHours(false);
    } catch (e) {
      console.error("Erro ao salvar dia especial", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const fillEntireMonth = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const payloads: Omit<AvailabilityRule, 'id' | 'slug'>[] = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        // Skip if already exists
        if (!availabilityRules.some(r => r.date === formattedDate)) {
          const hourData = extractHoursFromBusinessHour(formattedDate);
          if (hourData.isValid) {
            payloads.push({
              type: 'specific',
              date: formattedDate,
              start_time: hourData.start,
              end_time: hourData.end,
            });
          }
        }
      }

      if (payloads.length > 0) {
        const inserted = await api.createAvailabilityRulesBulk(tenant.slug, payloads);
        setAvailabilityRules([...availabilityRules, ...inserted]);
      }
    } catch (e) {
      console.error("Erro ao preencher mes", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRule = async (id: string) => {
    try {
      await api.deleteAvailabilityRule(id);
      setAvailabilityRules(availabilityRules.filter(r => r.id !== id));
    } catch (e) {
      console.error("Erro ao remover regra", e);
    }
  };

  const handleUpdateHour = (index: number, field: 'time' | 'closed', value: string | boolean) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'closed' && value === true) {
      updated[index].time = 'FECHADO';
    } else if (field === 'closed' && value === false && updated[index].time === 'FECHADO') {
      updated[index].time = '09:00 — 18:00';
    }
    setBusinessHours(updated);
  };

  const handleRemoveService = async (id: string) => {
    try {
      await api.deleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (e) {
      console.error("Erro ao remover serviço", e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings(tenant.slug, { whatsapp_number: whatsapp });
      // Salva os horários que possuem IDs
      for (const h of businessHours) {
        if (h.id) {
          await api.updateBusinessHour(h.id, { time: h.time, closed: h.closed });
        }
      }
    } catch (e) {
      console.error("Erro ao salvar", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProfessional = async () => {
    if (newName && newRole) {
      try {
        const fullName = `${newName} ${newSurname}`.trim();
        const newProfessional = await api.createProfessional(tenant.slug, {
          name: fullName,
          role: newRole,
          image_url: '',
        });
        setProfessionals([...professionals, newProfessional]);
        setIsAdding(false);
        setNewName("");
        setNewSurname("");
        setNewRole("");
      } catch (e) {
        console.error("Erro ao adicionar profissional", e);
      }
    }
  };

  const handleRemoveProfessional = async (id: string) => {
    try {
      await api.deleteProfessional(id);
      setProfessionals(professionals.filter(p => p.id !== id));
    } catch (e) {
      console.error("Erro ao remover profissional", e);
    }
  };

  if (isLoading) return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Carregando Painel...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-surface pb-32">
      <AppHeader />

      <div className="px-6 space-y-8">
        {/* Título da Página */}
        <header className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Gerenciamento</p>
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Configurações</h2>
          </div>
        </header>

        {/* 0. Informações da Empresa */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-stitch space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group">
              <Image src={logoUrl || '/next.svg'} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <p className="text-[8px] text-white font-bold uppercase">Mudar</p>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-bold text-slate-900 leading-none">{companyName}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Perfil Comercial</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 transition-colors"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 5511999999999"
              />
            </div>
          </div>
        </section>

        {/* 1. Horário de Funcionamento */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Horário de Funcionamento</h3>
            </div>
            <button 
              onClick={() => setIsEditingHours(true)}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-amber-600 transition-colors"
            >
              Editar
            </button>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            {businessHours.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">{item.label}</span>
                <span className={`font-bold ${item.closed ? 'text-amber-500 italic uppercase' : 'text-slate-900'}`}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 1.5 Calendário de Escala (N8N) */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-stitch space-y-6">
          <header className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Escala do Bot</h3>
                <p className="text-xs font-semibold text-slate-400">Clique nos dias para liberar ou bloquear na agenda.</p>
              </div>
            </div>
            
            <div className={`p-2 rounded-xl text-xs font-bold transition-all ${isProcessing ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-slate-50 text-slate-400 opacity-0'}`}>
              Sincronizando...
            </div>
          </header>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-5">
            {/* Controles do topo */}
            <div className="flex flex-wrap gap-4 items-end justify-between">
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsSpecialHours(!isSpecialHours)}
                  className={`text-[10px] w-fit font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                    isSpecialHours 
                      ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-inner' 
                      : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600'
                  }`}
                >
                  {isSpecialHours ? 'Usando Horário Especial' : 'Ativar Horário Especial'}
                </button>

                {isSpecialHours ? (
                  <div className="flex flex-col gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm animate-in fade-in slide-in-from-left-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-col px-2">
                        <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Data Específica</label>
                        <input
                          type="date"
                          className="text-sm font-black text-amber-900 bg-transparent outline-none"
                          value={specialDate}
                          onChange={(e) => setSpecialDate(e.target.value)}
                        />
                      </div>
                      <div className="w-px h-8 bg-amber-200 hidden sm:block"></div>
                      <div className="flex flex-col px-2">
                        <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Abertura</label>
                        <input
                          type="time"
                          className="text-sm font-black text-amber-900 bg-transparent outline-none w-20"
                          value={newRuleStartTime}
                          onChange={(e) => setNewRuleStartTime(e.target.value)}
                        />
                      </div>
                      <div className="w-px h-8 bg-amber-200 hidden sm:block"></div>
                      <div className="flex flex-col px-2">
                        <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Fechamento</label>
                        <input
                          type="time"
                          className="text-sm font-black text-amber-900 bg-transparent outline-none w-20"
                          value={newRuleEndTime}
                          onChange={(e) => setNewRuleEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleSaveSpecialDay}
                      className="bg-amber-600 font-bold text-white text-xs py-2 rounded-lg hover:bg-amber-700 transition"
                    >
                      Salvar Feriado / Exceção
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-left-2">
                    ✅ O Calendário usará automaticamente os horários reais configurados na seção "Horário de Funcionamento".
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-40 text-center font-black text-slate-700 capitalize">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* O Calendário VisuaL */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-slate-100">
                {(() => {
                  const year = currentMonth.getFullYear();
                  const month = currentMonth.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();

                  const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="bg-white p-2"></div>);
                  const days = Array.from({ length: daysInMonth }, (_, i) => {
                    const dayDate = i + 1;
                    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayDate).padStart(2, '0')}`;
                    
                    const existingRule = availabilityRules.find(r => r.date === formattedDate);
                    const isSelected = !!existingRule;
                    
                    const hourData = extractHoursFromBusinessHour(formattedDate);
                    const isGloballyClosed = !hourData.isValid;

                    let state: 'normal' | 'special' | 'closed' | 'open' = 'closed';
                    if (isGloballyClosed) {
                      state = 'closed'; // Vermelho (APENAS globalmente fechados)
                      
                      // Mas se tiver uma exceção rolando neste dia vermelho, ele fica Amarelo
                      if (isSelected && existingRule.start_time !== "00:00") {
                        state = 'special';
                      }
                    } else {
                      if (isSelected) {
                        const dbStart = existingRule.start_time.substring(0, 5);
                        const dbEnd = existingRule.end_time.substring(0, 5);
                        
                        if (dbStart === "00:00" && dbEnd === "00:00") {
                          state = 'open'; // Branco (O Lojista bloqueou esse dia manualmente)
                        } else if (dbStart === hourData.start && dbEnd === hourData.end) {
                          state = 'normal'; // Verde explicitly saved (Caso antigo)
                        } else {
                          state = 'special'; // Amarelo dourado (Exceção)
                        }
                      } else {
                        state = 'normal'; // Verde por padrão
                      }
                    }

                    let bgClass = '';
                    let dotClass = '';
                    if (state === 'normal') {
                      bgClass = 'bg-emerald-500 text-white shadow-inner hover:brightness-110 active:scale-95 cursor-pointer';
                      dotClass = 'bg-emerald-600 text-white';
                    } else if (state === 'special') {
                      bgClass = 'bg-amber-400 text-amber-950 shadow-inner hover:brightness-110 active:scale-95 cursor-pointer ring-2 ring-amber-300 ring-offset-1';
                      dotClass = 'bg-amber-500 text-amber-950';
                    } else if (state === 'closed') {
                      bgClass = 'bg-rose-50 border border-rose-100 text-rose-300 opacity-80 cursor-not-allowed overflow-hidden';
                      dotClass = 'text-rose-400 bg-rose-200/50';
                    } else {
                      bgClass = 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 cursor-pointer active:scale-95';
                      dotClass = 'text-slate-300 bg-slate-50 group-hover:bg-slate-200';
                    }

                    return (
                      <div 
                        key={dayDate} 
                        onClick={() => {
                          if (state !== 'closed') handleToggleDay(formattedDate, existingRule);
                        }}
                        className={`min-h-[4rem] sm:min-h-[5rem] p-1.5 flex flex-col transition-all group relative ${bgClass}`}
                      >
                        <span className={`text-xs font-black self-start w-6 h-6 flex items-center justify-center rounded-full ${dotClass}`}>
                          {dayDate}
                        </span>
                        
                        {isSelected && state !== 'closed' && state !== 'open' && (
                          <div className={`mt-auto font-bold flex flex-col items-center justify-center leading-none py-1 ${state === 'special' ? 'text-amber-900' : 'text-emerald-100'}`}>
                            <span className="text-[9px] tracking-tight">{existingRule.start_time.substring(0,5)}</span>
                            <span className={`text-[7px] ${state === 'special' ? 'text-amber-700' : 'text-emerald-300'}`}>até</span>
                            <span className="text-[9px] tracking-tight">{existingRule.end_time.substring(0,5)}</span>
                          </div>
                        )}
                        
                        {!isSelected && state === 'normal' && (
                          <div className={`mt-auto font-bold flex flex-col items-center justify-center leading-none py-1 text-emerald-100 opacity-60`}>
                            <span className="text-[9px] tracking-tight">{hourData.start}</span>
                            <span className="text-[7px] text-emerald-300">até</span>
                            <span className="text-[9px] tracking-tight">{hourData.end}</span>
                          </div>
                        )}
                        
                        {state === 'open' && (
                          <div className="mt-auto m-auto -rotate-12 flex items-center justify-center pointer-events-none pb-2">
                             <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Folga</span>
                          </div>
                        )}

                        {state === 'closed' && (
                          <div className="mt-auto m-auto -rotate-12 opacity-40 mix-blend-multiply flex items-center justify-center pointer-events-none pb-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-rose-500">Fechado</span>
                          </div>
                        )}
                      </div>
                    );
                  });

                  return [...blanks, ...days];
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={fillEntireMonth}
                disabled={isProcessing}
                className="bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ativar o Mês Todo
              </button>
            </div>
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
            <button 
              onClick={() => setIsAddingService(!isAddingService)}
              className="w-8 h-8 bg-amber-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-900/20 active:scale-90 transition-transform"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          {isAddingService && (
             <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Nome do Serviço"
                    className="w-full text-sm font-bold p-3 bg-white rounded-xl border border-amber-100 outline-none focus:ring-2 focus:ring-amber-500/20"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="number" 
                      placeholder="Preço (R$)"
                      className="w-full text-sm font-bold p-3 bg-white rounded-xl border border-amber-100 outline-none"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                    />
                    <select 
                      className="w-full text-sm font-bold p-3 bg-white rounded-xl border border-amber-100 outline-none"
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(e.target.value)}
                    >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                    <button 
                      onClick={handleAddService}
                      className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-amber-700 transition-colors"
                    >
                      Salvar Serviço
                    </button>
                    <button 
                      onClick={() => setIsAddingService(false)}
                      className="px-4 bg-white text-slate-400 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
             </div>
          )}

          <div className="space-y-3">
            {services.map((service, idx) => (
              <div key={service.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-stitch flex items-center gap-4 relative overflow-hidden group">
                {/* Barrinha lateral colorida como no modelo */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                  idx === 0 ? 'bg-amber-300' : idx === 1 ? 'bg-indigo-200' : 'bg-stone-300'
                }`} />
                
                <div className="flex-1 ml-2">
                  <h4 className="font-bold text-slate-900">{service.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{service.duration_minutes} MINUTOS</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-lg font-black text-amber-700">{formatCurrency(service.price)}</p>
                  <button 
                    onClick={() => handleRemoveService(service.id)}
                    className="p-1.5 text-slate-300 hover:text-red-400 transition-colors"
                    title="Remover serviço"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Profissionais */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Profissionais</h3>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="w-8 h-8 bg-amber-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-900/20 active:scale-90 transition-transform"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
            {professionals.map((pro) => (
              <div key={pro.id} className="flex-shrink-0 w-48 space-y-3">
                <div className="relative p-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center font-black text-xl mb-4">
                    {pro.name.charAt(0)}
                  </div>
                  <p className="font-black text-slate-900 leading-tight text-lg">{pro.name}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">{pro.role}</p>
                  
                  <button 
                    onClick={() => handleRemoveProfessional(pro.id)}
                    className="absolute top-4 right-4 p-2 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    title="Remover profissional"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.15em]">{pro.role}</p>
                </div>
              </div>
            ))}

            {isAdding && (
              <div className="flex-shrink-0 w-48 space-y-3">
                <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <User size={32} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Nova Foto</span>
                </div>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Nome"
                    className="w-full text-xs font-bold p-2 bg-white rounded-xl border border-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Sobrenome"
                    className="w-full text-xs font-bold p-2 bg-white rounded-xl border border-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    value={newSurname}
                    onChange={(e) => setNewSurname(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Especialidade"
                    className="w-full text-[10px] font-black text-amber-600 uppercase tracking-[0.15em] p-2 bg-white rounded-xl border border-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddProfessional}
                      className="flex-1 bg-amber-600 text-white p-2 rounded-xl flex items-center justify-center hover:bg-amber-700 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="flex-1 bg-slate-100 text-slate-500 p-2 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Botão de Salvar Alterações */}
        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3
              ${isSaving 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-linear-to-r from-amber-600 to-amber-500 text-white shadow-amber-600/20'}
            `}
          >
            {isSaving ? (
              <>
                <Check size={24} strokeWidth={3} />
                Salvo com Sucesso!
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </div>

      {/* Modal de Horários */}
      {isEditingHours && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditingHours(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="p-8 space-y-6">
              <header className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Editar Horários</h3>
                  <p className="text-xs font-medium text-slate-500">Configure os períodos de atendimento.</p>
                </div>
                <button 
                  onClick={() => setIsEditingHours(false)}
                  className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="space-y-4">
                {businessHours.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <input 
                        type="text" 
                        disabled={item.closed}
                        className={`w-full mt-1 bg-transparent border-b border-slate-200 focus:border-amber-500 focus:outline-none py-1 text-sm font-semibold transition-colors ${item.closed ? 'text-slate-300 italic' : 'text-slate-700'}`}
                        value={item.time}
                        onChange={(e) => handleUpdateHour(idx, 'time', e.target.value)}
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fechado</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={item.closed}
                          onChange={(e) => handleUpdateHour(idx, 'closed', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsEditingHours(false)}
                className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-lg shadow-slate-950/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}