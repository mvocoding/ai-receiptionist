-- Fade Station Database Schema
-- Run this SQL in your Supabase SQL Editor to create the tables
-- This script drops all existing objects and recreates them

-- ============================================
-- DROP EXISTING OBJECTS
-- ============================================

DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;

-- Drop functions (after tables are dropped)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Store Settings Table
CREATE TABLE store_settings (
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
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  image TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  working_days TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  appointment_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT appointments_unique_slot UNIQUE (barber_id, appointment_date, slot_time)
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

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
);

-- Insert sample barbers
INSERT INTO barbers (name, specialty, image, price, working_days)
VALUES 
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
  );

-- Insert sample appointments referencing the seeded barbers
INSERT INTO appointments (barber_id, customer_name, customer_email, appointment_date, slot_time, status)
SELECT id, 'Jordan Client', 'jordan@example.com', CURRENT_DATE, '09:00', 'booked'
FROM barbers WHERE name = 'Ace'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, customer_name, customer_email, appointment_date, slot_time, status)
SELECT id, 'Casey Demo', 'casey@example.com', CURRENT_DATE, '10:30', 'booked'
FROM barbers WHERE name = 'Ace'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, customer_name, customer_email, appointment_date, slot_time, status)
SELECT id, 'Morgan Test', 'morgan@example.com', CURRENT_DATE + INTERVAL '1 day', '11:00', 'booked'
FROM barbers WHERE name = 'Jay'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, customer_name, customer_email, appointment_date, slot_time, status)
SELECT id, 'Taylor Sample', 'taylor@example.com', CURRENT_DATE + INTERVAL '1 day', '15:30', 'booked'
FROM barbers WHERE name = 'Mia'
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_appointments_barber_date
  ON appointments (barber_id, appointment_date);

CREATE INDEX idx_appointments_date
  ON appointments (appointment_date);

-- ============================================
-- CREATE FUNCTIONS
-- ============================================

-- Create function to update updated_at timestamp
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON barbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES
-- ============================================

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

CREATE POLICY "Allow all operations on users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on appointments"
  ON appointments
  FOR ALL
  USING (true)
  WITH CHECK (true);

