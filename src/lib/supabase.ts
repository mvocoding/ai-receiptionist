import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type StoreSettings = {
  id: string;
  banner_url: string;
  intro_text: string;
  phone_number: string;
  address: string;
  hours: string;
  created_at?: string;
  updated_at?: string;
};

export type Barber = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  phone?: string;
  price: number;
  working_days: string[];
  created_at?: string;
  updated_at?: string;
};

export type Appointment = {
  id: string;
  barber_id: string;
  customer_name?: string;
  customer_phone?: string;
  appointment_date: string;
  slot_time: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type Communication = {
  id: string;
  comm_type: 'call' | 'sms' | 'recording';
  contact_name?: string;
  contact_number?: string;
  status: string;
  sentiment?: string;
  tag?: string;
  action_taken?: string;
  ai_summary?: string;
  timestamp?: string;
  duration?: number;
  audio_url?: string;
  created_at?: string;
};

export type CommunicationMessage = {
  id: string;
  communication_id: string;
  sender: 'customer' | 'ai' | 'system';
  message: string;
  message_time?: string;
};

export type User = {
  id: string;
  email: string;
  created_at?: string;
  last_login_at?: string;
  updated_at?: string;
};

export type AIKnowledge = {
  id: string;
  nodes: any[]; 
  connections: any[]; 
  next_id: number;
  created_at?: string;
  updated_at?: string;
};
