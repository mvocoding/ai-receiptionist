-- Fade Station Database Schema

DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS comm_messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS barber_exceptions CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS ai_knowledge CASCADE;

-- Drop functions (after tables are dropped)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_distinct_customers() CASCADE;


-- Store Settings Table
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800',
  intro_text TEXT NOT NULL DEFAULT 'Welcome to Fade Station. Premium Barbershop Experience.',
  phone_number TEXT NOT NULL DEFAULT '0483 804 500',
  address TEXT NOT NULL DEFAULT '1 Fern Court, Parafield Gardens, SA 5107',
  hours TEXT NOT NULL DEFAULT 'Mon-Fri: 9:00 AM - 6:00 PM
Sat: 9:00 AM - 5:00 PM
Sun: Closed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barbers Table (simplified structure)
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barber Exceptions Table
CREATE TABLE barber_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_day_off BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT barber_exception_time_check CHECK (
    is_day_off = TRUE OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

-- Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  note JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL DEFAULT 'self-service',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT appointments_unique_slot UNIQUE (barber_id, appointment_date, start_time)
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
  email TEXT UNIQUE,
  phone_number TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Knowledge Table (single row table)
CREATE TABLE ai_knowledge (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  connections JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Insert sample users (customers)
INSERT INTO users (id, phone_number, name)
VALUES
  ('22d1f8f3-60cf-4ec3-8ed2-d5e76f66d326', '61467483638', 'James'),
  ('6f8eff3c-dc80-4c9d-adff-d605cb6d3c94', '468044179', 'Sean'),
  ('ad1c4d50-8f42-480e-92be-063c1d8e5f87', '0483804501', 'Jordan Client'),
  ('ffb4ce65-bab1-4d0e-9a9f-2fe299db4c77', '0483804602', 'Casey Demo')
ON CONFLICT (id) DO NOTHING;

-- Insert sample barbers
INSERT INTO barbers (name, status, description)
VALUES 
  (
    'Joe',
    'active',
    'Hair cut specialist · Modern men styles'
  ),
  (
    'Lara',
    'active',
    'Classic cuts · Kids trims'
  ),
  (
    'Mason',
    'inactive',
    'Currently on leave'
  );

-- Insert sample barber exceptions
INSERT INTO barber_exceptions (barber_id, exception_date, is_day_off, start_time, end_time)
SELECT id, DATE '2025-11-29', FALSE, TIME '13:00', TIME '17:00'
FROM barbers WHERE name = 'Joe'
ON CONFLICT DO NOTHING;

INSERT INTO barber_exceptions (barber_id, exception_date, is_day_off)
SELECT id, DATE '2025-12-01', TRUE
FROM barbers WHERE name = 'Lara'
ON CONFLICT DO NOTHING;

-- Insert sample appointments referencing the seeded barbers
INSERT INTO appointments (barber_id, user_id, appointment_date, start_time, end_time, status, note, created_by)
SELECT id, 'ad1c4d50-8f42-480e-92be-063c1d8e5f87', CURRENT_DATE, TIME '09:00', TIME '09:30', 'booked',
       jsonb_build_object('message', 'Prefers fade with hard part'),
       'seed'
FROM barbers WHERE name = 'Joe'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, user_id, appointment_date, start_time, end_time, status, note, created_by)
SELECT id, 'ffb4ce65-bab1-4d0e-9a9f-2fe299db4c77', CURRENT_DATE, TIME '10:30', TIME '11:00', 'booked',
       jsonb_build_object('message', 'Ask about beard trim add-on'),
       'seed'
FROM barbers WHERE name = 'Joe'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, user_id, appointment_date, start_time, end_time, status, note, created_by)
SELECT id, '22d1f8f3-60cf-4ec3-8ed2-d5e76f66d326', CURRENT_DATE + INTERVAL '1 day', TIME '11:00', TIME '11:30', 'booked',
       jsonb_build_object('message', 'Wants classic taper'),
       'seed'
FROM barbers WHERE name = 'Lara'
ON CONFLICT DO NOTHING;

INSERT INTO appointments (barber_id, user_id, appointment_date, start_time, end_time, status, note, created_by)
SELECT id, '6f8eff3c-dc80-4c9d-adff-d605cb6d3c94', CURRENT_DATE + INTERVAL '1 day', TIME '15:30', TIME '16:00', 'booked',
       jsonb_build_object('message', 'Kid''s cut, extra patience'),
       'seed'
FROM barbers WHERE name = 'Lara'
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
  ON appointments (barber_id, appointment_date, start_time);

CREATE INDEX idx_appointments_date
  ON appointments (appointment_date, start_time);

CREATE INDEX idx_barber_exceptions_barber_date
  ON barber_exceptions (barber_id, exception_date);


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
  user_email TEXT,
  last_appointment TIMESTAMP WITH TIME ZONE
) AS $$
  SELECT
    COALESCE(
      user_id::text,
      note ->> 'customerPhone',
      id::text
    ) AS customer_key,
    COALESCE(u.name, note ->> 'customerName', 'Unknown') AS customer_name,
    COALESCE(u.phone_number, note ->> 'customerPhone') AS customer_phone,
    MAX(
      appointment_date::timestamp
      + make_interval(
          hours := EXTRACT(HOUR FROM start_time)::int,
          mins := EXTRACT(MINUTE FROM start_time)::int
        )
    ) AS last_appointment,
    MAX(u.email) AS user_email
  FROM appointments a
  LEFT JOIN users u ON a.user_id = u.id
  GROUP BY 1, 2, 3;
$$ LANGUAGE SQL STABLE;

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON barbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barber_exceptions_updated_at
  BEFORE UPDATE ON barber_exceptions
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

CREATE TRIGGER update_ai_knowledge_updated_at
  BEFORE UPDATE ON ai_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_exceptions ENABLE ROW LEVEL SECURITY;


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

CREATE POLICY "Allow all operations on ai_knowledge"
  ON ai_knowledge
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on barber_exceptions"
  ON barber_exceptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default AI knowledge configuration
INSERT INTO ai_knowledge (id, nodes, connections, next_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  $json$[
    {"id": "node_welcome", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "Welcome! How can I help you today?"},
    {"id": "node_end", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "Thank you for contacting us. Have a great day!"},
    {"id": "node_sorry", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "I apologize, but I didn't understand that. Could you please rephrase?"},
    {"id": "node_booking", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "I can help you book an appointment. What date and time works for you?"},
    {"id": "node_pricing", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "Our services range from $40 to $45. Would you like to know more about our barbers?"},
    {"id": "node_hours", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "We are open Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 5:00 PM, Sun: Closed."},
    {"id": "node_location", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "We are located at 1 Fern Court, Parafield Gardens, SA 5107."},
    {"id": "node_contact", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "You can reach us at 0483 804 500. We're here to help!"},
    {"id": "node_confirmation", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "Your appointment has been confirmed. You will receive a confirmation message shortly."}
  ]$json$::jsonb,
  '[]'::jsonb,
  10
)
ON CONFLICT (id) DO NOTHING;

