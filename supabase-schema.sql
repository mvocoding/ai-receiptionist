-- Fade Station Database Schema

DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS comm_messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;

-- Drop functions (after tables are dropped)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_distinct_customers() CASCADE;


-- Store Settings Table
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800',
  intro_text TEXT NOT NULL DEFAULT 'Welcome to Fade Station. Premium Barbershop Experience.',
  phone_number TEXT NOT NULL DEFAULT '0483 804 522',
  address TEXT NOT NULL DEFAULT '1 Fern Court, Parafield Gardens, SA 5107',
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
  phone TEXT,
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
  customer_phone TEXT,
  appointment_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT appointments_unique_slot UNIQUE (barber_id, appointment_date, slot_time)
);

-- Communications Table
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comm_type TEXT NOT NULL CHECK (comm_type IN ('call', 'sms', 'recording')),
  contact_name TEXT,
  contact_number TEXT,
  status TEXT NOT NULL,
  sentiment TEXT,
  tag TEXT,
  action_taken TEXT,
  ai_summary TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication Messages
CREATE TABLE comm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'ai', 'system')),
  message TEXT NOT NULL,
  message_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  '0483 804 500',
  '1 Fern Court, Parafield Gardens, SA 5107',
  'Mon-Fri: 9:00 AM - 6:00 PM
Sat: 9:00 AM - 5:00 PM
Sun: Closed'
);

-- Insert sample barbers
INSERT INTO barbers (name, specialty, image, phone, price, working_days)
VALUES 
  (
    'Ace',
    'Fades · Beard · Kids',
    'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&q=80&w=200&h=200',
    '0483 804 522',
    45.00,
    ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  ),
  (
    'Jay',
    'Tapers · Line-ups',
    'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=200&h=200',
    '0483 804 533',
    40.00,
    ARRAY['Monday', 'Wednesday', 'Friday', 'Saturday']
  ),
  (
    'Mia',
    'Skin Fades · Scissor',
    'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200&h=200',
    '0483 804 544',
    45.00,
    ARRAY['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  );

-- Insert sample appointments referencing the seeded barbers
INSERT INTO appointments (barber_id, customer_name, customer_phone, appointment_date, slot_time, status)
SELECT id, 'Jordan Client', '0483 804 600', CURRENT_DATE, '09:00', 'booked'
FROM barbers WHERE name = 'Ace'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, customer_name, customer_phone, appointment_date, slot_time, status)
SELECT id, 'Casey Demo', '0483 804 601', CURRENT_DATE, '10:30', 'booked'
FROM barbers WHERE name = 'Ace'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, customer_name, customer_phone, appointment_date, slot_time, status)
SELECT id, 'Morgan Test', '0483 804 602', CURRENT_DATE + INTERVAL '1 day', '11:00', 'booked'
FROM barbers WHERE name = 'Jay'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, customer_name, customer_phone, appointment_date, slot_time, status)
SELECT id, 'Taylor Sample', '0483 804 603', CURRENT_DATE + INTERVAL '1 day', '15:30', 'booked'
FROM barbers WHERE name = 'Mia'
ON CONFLICT DO NOTHING;

-- Insert sample communications
WITH inserted_call AS (
  INSERT INTO communications (
    comm_type,
    contact_name,
    contact_number,
    status,
    sentiment,
    tag,
    action_taken,
    ai_summary,
    timestamp,
    duration,
    audio_url
  )
  VALUES (
    'call',
    'Jordan Smith',
    '0483 555 1024',
    'completed',
    'positive',
    'booking',
    'Appointment booked',
    'Customer requested fade appointment for Friday afternoon. Successfully booked with Ace at 3:30pm. Confirmation sent via SMS.',
    NOW(),
    180,
    'https://cdn.pixabay.com/download/audio/2021/09/16/audio_8c4d3f2b7d.mp3?filename=click-124467.mp3'
  )
  RETURNING id
)
INSERT INTO comm_messages (communication_id, sender, message, message_time)
SELECT id, msg.sender, msg.message, NOW()
FROM inserted_call,
LATERAL (VALUES
  ('customer', 'Hi, I''d like to book a fade for Friday afternoon if possible.'),
  ('ai', 'Hello! I''d be happy to help you book a fade appointment. What''s your name and phone number?'),
  ('customer', 'It''s Jordan, 021-555-1024. Do you have anything after 3pm?'),
  ('ai', 'Perfect! I have Ace available at 3:30pm and 4:00pm on Friday. Which would you prefer? A fade is $45.'),
  ('customer', '3:30pm works great. Do I need to pay upfront?'),
  ('ai', 'No payment needed now! I''ve booked you with Ace for Friday at 3:30pm. You''ll get a confirmation text shortly.')
) AS msg(sender, message);

WITH inserted_sms AS (
  INSERT INTO communications (
    comm_type,
    contact_name,
    contact_number,
    status,
    sentiment,
    tag,
    action_taken,
    ai_summary,
    timestamp
  )
  VALUES (
    'sms',
    'Emily Chen',
    '0483 880 3344',
    'completed',
    'neutral',
    'reschedule',
    'Appointment rescheduled',
    'Customer requested to move appointment from Friday to Saturday morning and change service from standard cut to line-up and taper.',
    NOW()
  )
  RETURNING id
)
INSERT INTO comm_messages (communication_id, sender, message, message_time)
SELECT id, msg.sender, msg.message, NOW()
FROM inserted_sms,
LATERAL (VALUES
  ('customer', 'Hi, I need to move my appointment from Friday to Saturday morning if possible'),
  ('ai', 'I can help you reschedule! What time works best on Saturday morning?'),
  ('customer', 'Any time between 9-11am. Also can I change from standard cut to line-up and taper?'),
  ('ai', 'Perfect! I have Jay available at 10am on Saturday. Line-up and taper is $40. Should I book that?'),
  ('customer', 'Yes please, that works great'),
  ('ai', 'Done! Your appointment is now Saturday 10am with Jay for line-up and taper. Confirmation sent.')
) AS msg(sender, message);



CREATE INDEX idx_appointments_barber_date
  ON appointments (barber_id, appointment_date);

CREATE INDEX idx_appointments_date
  ON appointments (appointment_date);


CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to list distinct customers by phone or name
CREATE FUNCTION get_distinct_customers()
RETURNS TABLE (
  customer_key TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  last_appointment TIMESTAMP WITH TIME ZONE
) AS $$
  SELECT
    COALESCE(customer_phone, customer_name, id::text) AS customer_key,
    customer_name,
    customer_phone,
    MAX(
      appointment_date::timestamp
      + make_interval(
          hours := split_part(slot_time, ':', 1)::int,
          mins := split_part(slot_time, ':', 2)::int
        )
    ) AS last_appointment
  FROM appointments
  GROUP BY customer_key, customer_name, customer_phone;
$$ LANGUAGE SQL STABLE;

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

CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_messages ENABLE ROW LEVEL SECURITY;


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

CREATE POLICY "Allow all operations on communications"
  ON communications
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on comm_messages"
  ON comm_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

