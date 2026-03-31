import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Exemplo de uso: GET /api/n8n/disponibilidade?slug=barbearia-do-ze&date=2026-03-25
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const dateStr = searchParams.get('date'); // YYYY-MM-DD

  if (!slug) {
    return NextResponse.json({ error: 'Parâmetro slug é obrigatório' }, { status: 400 });
  }

  try {
    const { data: rules, error } = await supabase
      .from('sys_availability_rules')
      .select('*')
      .eq('slug', slug)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Buscando as REGRAS GLOBAIS DE FUNCIONAMENTO DA LOJA (Business Hours)
    const { data: businessHours, error: bhError } = await supabase
      .from('sys_business_hours')
      .select('*');

    if (bhError) throw bhError;

    // Se o N8N não pedir uma data específica, retorna as configurações brutas (fallback)
    if (!dateStr) {
      return NextResponse.json({
          sucesso: true,
          total_regras: rules.length,
          regras_configuradas: rules
      });
    }

    // 1. Descobrir se a data tem REGRA ESPECÍFICA (Exceção) ou obedece ao GLOBAL
    const targetDate = new Date(`${dateStr}T12:00:00`);
    const dayOfWeek = targetDate.getDay();
    const dayLabels = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const prefix = dayLabels[dayOfWeek];
    const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let appliedStart = "";
    let appliedEnd = "";
    let allSlots: string[] = [];

    let appliedRule = rules.find(r => r.type === 'specific' && r.date === dateStr);

    if (appliedRule) {
      appliedStart = appliedRule.start_time;
      appliedEnd = appliedRule.end_time;
      
      // Se já tivermos o array fatiado no banco, usamos ele! (Economiza CPU)
      if (appliedRule.time_slots && appliedRule.time_slots.length > 0) {
        allSlots = appliedRule.time_slots;
      }
    } else {
      // Regra genérica global (Business Hours)
      const getDayIndex = (str: string) => {
        return dayLabels.findIndex(d => str.includes(d));
      };

      const bHour = businessHours?.find(h => {
        const label = normalizeStr(h.label);
        if (label.includes(prefix)) return true;

        const parts = label.split(/\s+a\s+|\s*-\s*/);
        if (parts.length === 2) {
           const startIdx = getDayIndex(parts[0]);
           const endIdx = getDayIndex(parts[1]);
           if (startIdx !== -1 && endIdx !== -1) {
              if (startIdx <= endIdx) {
                 return dayOfWeek >= startIdx && dayOfWeek <= endIdx;
              } else {
                 return dayOfWeek >= startIdx || dayOfWeek <= endIdx;
              }
           }
        }
        return false;
      });

      if (!bHour || bHour.closed) {
        return NextResponse.json({
          sucesso: true,
          data: dateStr,
          horarios_livres: [],
          msg: "Data não liberada na escala (Fechado de acordo com o padrão semanal)."
        });
      }

      const times = bHour.time.match(/\d{2}:\d{2}/g);
      if (!times || times.length < 2) {
         return NextResponse.json({ sucesso: true, data: dateStr, horarios_livres: [], msg: "Abertura global não parametrizada" });
      }
      appliedStart = times[0];
      appliedEnd = times[1];
    }

    // 2. Gerar slots de 30 em 30 min (FallBack caso o array do banco não exista por algum motivo)
    if (allSlots.length === 0 && appliedStart && appliedEnd) {
      const startParts = appliedStart.split(':');
      const endParts = appliedEnd.split(':');
      const startMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

      for (let m = startMins; m < endMins; m += 30) {
        const hh = Math.floor(m / 60).toString().padStart(2, '0');
        const mm = (m % 60).toString().padStart(2, '0');
        allSlots.push(`${hh}:${mm}`);
      }
    }

    // 3. Consultar sys_appointments como fonte única de verdade.
    // Isso garante que agendamentos feitos pelo bot E pelo formulário web
    // sejam considerados, evitando horários duplicados.
    const { data: ocupados, error: ocupadosError } = await supabase
      .from('sys_appointments')
      .select('time')
      .eq('slug', slug)
      .eq('date', dateStr)
      .in('status', ['AGENDADO']); // Só bloqueia confirmados; ignora cancelados

    if (ocupadosError) throw ocupadosError;

    // Normaliza para "HH:mm" (o campo time pode ser "09:00" ou "09:00:00")
    const horariosOcupados = (ocupados || []).map(o =>
      typeof o.time === 'string' ? o.time.substring(0, 5) : ''
    );

    // 4. Subtrai os horários ocupados da lista geral de slots gerados
    const horariosVazios = allSlots.filter(slot => !horariosOcupados.includes(slot));

    return NextResponse.json({
        sucesso: true,
        loja: slug,
        data: dateStr,
        abertura: appliedStart,
        fechamento: appliedEnd,
        total_livres: horariosVazios.length,
        horarios_livres: horariosVazios
    });

  } catch (err: any) {
    console.error("Erro ao buscar regras para n8n", err);
    return NextResponse.json({ error: 'Erro interno ao buscar disponibilidade', detalhes: err.message }, { status: 500 });
  }
}

