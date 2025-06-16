-- AI Lead Builder Database Structure
-- Run this script in Supabase SQL Editor

-- Create leads table (without status)
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table (with status, without edited)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leads table to update timestamp
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for messages table to update timestamp
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_generated_at ON messages(generated_at);

-- Insert sample data (optional, for testing)
INSERT INTO leads (name, role, company, linkedin_url) VALUES
('John Smith', 'Marketing Director', 'Google', 'https://linkedin.com/in/johnsmith'),
('Sarah Johnson', 'Engineering Manager', 'Microsoft', 'https://linkedin.com/in/sarahjohnson'),
('Mike Chen', 'Product Manager', 'Meta', 'https://linkedin.com/in/mikechen'),
('Emily Davis', 'Sales Director', 'Amazon', NULL),
('David Wilson', 'VP of Engineering', 'Netflix', 'https://linkedin.com/in/davidwilson');

-- Generate sample messages for leads with different statuses
INSERT INTO messages (lead_id, content, status) 
SELECT 
    id,
    'Hi ' || name || ', I noticed your role as ' || role || ' at ' || company || '. I''d love to connect and discuss industry insights.',
    'draft'
FROM leads
WHERE name IN ('John Smith', 'Emily Davis');

INSERT INTO messages (lead_id, content, status) 
SELECT 
    id,
    'Hello ' || name || '! I''ve been following ' || company || '''s recent developments and would appreciate the opportunity to connect with someone in your position as ' || role || '. Looking forward to potential collaboration.',
    'approved'
FROM leads
WHERE name IN ('Sarah Johnson', 'David Wilson');

INSERT INTO messages (lead_id, content, status) 
SELECT 
    id,
    'Hi ' || name || ', I hope this message finds you well. I''m reaching out because of your expertise as ' || role || ' at ' || company || '. Would love to connect and explore potential synergies.',
    'sent'
FROM leads
WHERE name = 'Mike Chen';

-- Table comments
COMMENT ON TABLE leads IS 'Table storing potential lead information';
COMMENT ON TABLE messages IS 'Table storing AI-generated LinkedIn messages with status';

-- Column comments
COMMENT ON COLUMN leads.linkedin_url IS 'LinkedIn profile URL (optional)';
COMMENT ON COLUMN messages.status IS 'Message status: draft, approved, or sent';
COMMENT ON COLUMN messages.content IS 'The LinkedIn message content';
