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
  price: number;
  working_days: string[];
  created_at?: string;
  updated_at?: string;
};

