-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  signature_text TEXT,
  timezone TEXT DEFAULT 'Europe/Stockholm',
  ai_enabled BOOLEAN DEFAULT false,
  inbound_email_address TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active' | 'past_due' | 'canceled' | 'inactive'
  plan TEXT, -- 'starter' | 'professional' | 'enterprise'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sequences table
CREATE TABLE sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sequence_steps table
CREATE TABLE sequence_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  delay_days INTEGER NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, step_number)
);

-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  service_type TEXT,
  status TEXT NOT NULL DEFAULT 'SENT', -- 'SENT' | 'REPLIED' | 'WON' | 'LOST' | 'MANUAL_PAUSE'
  thread_id TEXT, -- For email threading
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  direction TEXT NOT NULL, -- 'in' | 'out'
  subject TEXT,
  body TEXT,
  from_email TEXT,
  to_email TEXT,
  sendgrid_message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lead_sequence_state table
CREATE TABLE lead_sequence_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE UNIQUE,
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  next_send_at TIMESTAMPTZ,
  is_paused BOOLEAN DEFAULT false,
  paused_reason TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX idx_leads_customer_email ON leads(customer_email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_lead_sequence_state_next_send ON lead_sequence_state(next_send_at) WHERE is_paused = false AND is_completed = false;
CREATE INDEX idx_sequences_workspace_id ON sequences(workspace_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sequence_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they are members of" ON workspaces 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = workspaces.id 
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workspaces they own" ON workspaces 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = workspaces.id 
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can insert workspaces" ON workspaces FOR INSERT WITH CHECK (true);

-- RLS Policies for workspace_members
CREATE POLICY "Users can view workspace members of their workspaces" ON workspace_members 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm 
      WHERE wm.workspace_id = workspace_members.workspace_id 
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workspace members" ON workspace_members FOR INSERT WITH CHECK (true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view subscriptions of their workspaces" ON subscriptions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = subscriptions.workspace_id 
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (true);

-- RLS Policies for sequences
CREATE POLICY "Users can view sequences in their workspaces" ON sequences 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = sequences.workspace_id 
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage sequences in their workspaces" ON sequences 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = sequences.workspace_id 
      AND workspace_members.user_id = auth.uid()
    )
  );

-- RLS Policies for sequence_steps
CREATE POLICY "Users can view sequence steps in their workspaces" ON sequence_steps 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sequences s
      JOIN workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE s.id = sequence_steps.sequence_id 
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage sequence steps in their workspaces" ON sequence_steps 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sequences s
      JOIN workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE s.id = sequence_steps.sequence_id 
      AND wm.user_id = auth.uid()
    )
  );

-- RLS Policies for leads
CREATE POLICY "Users can view leads in their workspaces" ON leads 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = leads.workspace_id 
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage leads in their workspaces" ON leads 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = leads.workspace_id 
      AND workspace_members.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their workspaces" ON messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = messages.workspace_id 
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage messages in their workspaces" ON messages 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = messages.workspace_id 
      AND workspace_members.user_id = auth.uid()
    )
  );

-- RLS Policies for lead_sequence_state
CREATE POLICY "Users can view lead sequence state in their workspaces" ON lead_sequence_state 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads l
      JOIN workspace_members wm ON wm.workspace_id = l.workspace_id
      WHERE l.id = lead_sequence_state.lead_id 
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage lead sequence state in their workspaces" ON lead_sequence_state 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM leads l
      JOIN workspace_members wm ON wm.workspace_id = l.workspace_id
      WHERE l.id = lead_sequence_state.lead_id 
      AND wm.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sequence_steps_updated_at BEFORE UPDATE ON sequence_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_sequence_state_updated_at BEFORE UPDATE ON lead_sequence_state FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique inbound email address
CREATE OR REPLACE FUNCTION generate_inbound_email(workspace_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  random_string TEXT;
  domain TEXT;
BEGIN
  -- Generate 8-character random string
  random_string := substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);
  domain := current_setting('app.inbound_email_domain', true);
  
  IF domain IS NULL OR domain = '' THEN
    domain := 'in.offertpilot.se';
  END IF;
  
  RETURN workspace_slug || '.' || random_string || '@' || domain;
END;
$$ LANGUAGE plpgsql;
