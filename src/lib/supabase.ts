import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  status: 'active' | 'inactive';
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type BarberException = {
  id: string;
  barber_id: string;
  date: string;
  is_day_off: boolean;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
};

export type Appointment = {
  id: string;
  user_id?: string;
  barber_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  note?: string | null;
  created_by?: string | null;
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

export type Conversation = {
  id: string;
  user_id?: string;
  phone_number: string;
  messages: any[];
  created_at?: string;
  updated_at?: string;
};

export type User = {
  id: string;
  email?: string;
  phone_number?: string;
  name?: string;
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

export type AgentSettings = {
  id: string;
  greeting: string;
  prompt_sections: any[];
  channel: 'call' | 'sms';
  created_at?: string;
  updated_at?: string;
};

export type AgentFunctionDescription = {
  id: string;
  function_name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
};
