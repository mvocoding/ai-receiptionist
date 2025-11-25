-- Standalone script to create ai_knowledge table
-- Run this if the table doesn't exist yet

-- Drop if exists (optional, for clean setup)
DROP TABLE IF EXISTS ai_knowledge CASCADE;

-- Create AI Knowledge Table
CREATE TABLE ai_knowledge (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  connections JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for auto-updating updated_at
-- Note: This requires the update_updated_at_column() function to exist
-- If you get an error, the function will be created when you run the full schema
CREATE TRIGGER update_ai_knowledge_updated_at
  BEFORE UPDATE ON ai_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on ai_knowledge"
  ON ai_knowledge
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
    {"id": "node_contact", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "You can reach us at 0483 804 522. We're here to help!"},
    {"id": "node_confirmation", "type": "message", "x": 0, "y": 0, "width": 0, "height": 0, "text": "Your appointment has been confirmed. You will receive a confirmation message shortly."}
  ]$json$::jsonb,
  '[]'::jsonb,
  10
)
ON CONFLICT (id) DO NOTHING;

