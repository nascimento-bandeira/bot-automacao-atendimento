import { supabase } from '../lib/supabase';
import { Settings, Service, Professional, Appointment, BusinessHour } from '@/types';

export const api = {
  // ============================
  // SETTINGS
  // ============================
  async getSettings(slug: string): Promise<Settings | null> {
    const { data, error } = await supabase
      .from('sys_settings')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  async updateSettings(slug: string, updates: Partial<Settings>) {
    const { data, error } = await supabase
      .from('sys_settings')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ============================
  // SERVICES
  // ============================
  async getServices(slug: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('sys_services')
      .select('*')
      .eq('slug', slug)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createService(slug: string, serviceData: { name: string; price: number; duration_minutes: number }) {
    const { data, error } = await supabase
      .from('sys_services')
      .insert({ ...serviceData, slug })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteService(id: string) {
    const { error } = await supabase
      .from('sys_services')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ============================
  // PROFESSIONALS
  // ============================
  async getProfessionals(slug: string): Promise<Professional[]> {
    const { data, error } = await supabase
      .from('sys_professionals')
      .select('*')
      .eq('slug', slug)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createProfessional(slug: string, profData: { name: string; role: string; image_url: string }) {
    const { data, error } = await supabase
      .from('sys_professionals')
      .insert({ ...profData, slug })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProfessional(id: string) {
    const { error } = await supabase
      .from('sys_professionals')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ============================
  // APPOINTMENTS
  // ============================
  async getAppointments(slug: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('sys_appointments')
      .select('*')
      .eq('slug', slug)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createAppointment(slug: string, appData: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('sys_appointments')
      .insert({ ...appData, slug })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointment(id: string, updates: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('sys_appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteAppointment(id: string) {
    const { error } = await supabase
      .from('sys_appointments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ============================
  // BUSINESS HOURS
  // ============================
  async getBusinessHours(slug: string): Promise<BusinessHour[]> {
    const { data, error } = await supabase
      .from('sys_business_hours')
      .select('*')
      .eq('slug', slug)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async updateBusinessHour(id: string, updates: { time?: string; closed?: boolean }) {
    const { data, error } = await supabase
      .from('sys_business_hours')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
