-- Fade Station Database Schema
-- Run this SQL in your Supabase SQL Editor to create the tables

-- Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800',
  intro_text TEXT NOT NULL DEFAULT 'Welcome to Fade Station. Premium Barbershop Experience.',
  phone_number TEXT NOT NULL DEFAULT '+64 1 234 56789',
  address TEXT NOT NULL DEFAULT '123 Barbershop Avenue
Auckland, NZ 1010',
  hours TEXT NOT NULL DEFAULT 'Mon-Fri: 9:00 AM - 6:00 PM
Sat: 9:00 AM - 5:00 PM
Sun: Closed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barbers Table
CREATE TABLE IF NOT EXISTS barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  image TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  working_days TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default store settings (single row)
INSERT INTO store_settings (id, banner_url, intro_text, phone_number, address, hours)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800',
  'Welcome to Fade Station. Premium Barbershop Experience.',
  '+64 1 234 56789',
  '123 Barbershop Avenue
Auckland, NZ 1010',
  'Mon-Fri: 9:00 AM - 6:00 PM
Sat: 9:00 AM - 5:00 PM
Sun: Closed'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample barbers (UUIDs will be auto-generated, only if they don't exist)
INSERT INTO barbers (name, specialty, image, price, working_days)
SELECT * FROM (VALUES 
  (
    'Ace',
    'Fades · Beard · Kids',
    'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&q=80&w=200&h=200',
    45.00,
    ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  ),
  (
    'Jay',
    'Tapers · Line-ups',
    'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=200&h=200',
    40.00,
    ARRAY['Monday', 'Wednesday', 'Friday', 'Saturday']
  ),
  (
    'Mia',
    'Skin Fades · Scissor',
    'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200&h=200',
    45.00,
    ARRAY['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  )
) AS v(name, specialty, image, price, working_days)
WHERE NOT EXISTS (SELECT 1 FROM barbers WHERE barbers.name = v.name);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON barbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on store_settings"
  ON store_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on barbers"
  ON barbers
  FOR ALL
  USING (true)
  WITH CHECK (true);

