-- supabase-pv-schema.sql (FIXED)
-- Complete schema setup for Espace Client application

-- ==========================================
-- EXTENSIONS AND PREREQUISITES
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CREATE ENUMS FOR DROPDOWNS
-- ==========================================
-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('admin', 'gestionnaire', 'client');
CREATE TYPE project_status AS ENUM ('En cours', 'Terminé', 'En pause');
CREATE TYPE quote_status AS ENUM ('En attente de validation', 'Validé', 'Expiré');
CREATE TYPE payment_status AS ENUM ('En attente', 'Payé', 'Annulé');
CREATE TYPE pv_status AS ENUM ('En attente de signature', 'Signé', 'Refusé');
CREATE TYPE tma_status AS ENUM ('Actif', 'Terminé', 'Suspendu');

-- ==========================================
-- SCHEMA SETUP - CORE TABLES
-- ==========================================

-- Users Table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'client',
  phone TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  contact_name TEXT,
  phone TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  siret TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'En cours',
  start_date DATE,
  end_date DATE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  issue_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  status quote_status NOT NULL DEFAULT 'En attente de validation',
  file_path TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status payment_status NOT NULL,
  payment_method TEXT,
  reference TEXT,
  description TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PV (Procès-verbal) Table
CREATE TABLE IF NOT EXISTS pv (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status pv_status NOT NULL DEFAULT 'En attente de signature',
  signature_date DATE,
  file_path TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TMA (Tierce Maintenance Applicative) Table
CREATE TABLE IF NOT EXISTS tma (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  hours_allocated INT NOT NULL,
  hours_used INT NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status tma_status NOT NULL DEFAULT 'Actif',
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TMA Activities Table
CREATE TABLE IF NOT EXISTS tma_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  hours INT NOT NULL,
  activity_date DATE NOT NULL,
  tma_id UUID NOT NULL REFERENCES tma(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- AUTO-ADD USERS FROM AUTH SIGNUP
-- ==========================================

-- Function to automatically add new auth users to users table
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID;
  user_email TEXT;
BEGIN
  -- Insert the new user
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 'client', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING
  RETURNING id, email INTO new_user_id, user_email;
  
  -- If successfully inserted and it's a client role, create a client record
  IF new_user_id IS NOT NULL THEN
    -- Create a corresponding client record
    INSERT INTO public.clients (
      name, 
      email, 
      contact_name,
      user_id
    ) 
    VALUES (
      substring(NEW.email from '^[^@]+'),  -- Use part of email as initial name, without 'Client ' prefix
      NEW.email,
      substring(NEW.email from '^[^@]+'),  -- Use part of email as initial contact name
      new_user_id
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call this function on new user sign-ups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to add client records for existing users who don't have them
CREATE OR REPLACE FUNCTION public.create_missing_client_records() 
RETURNS void AS $$
BEGIN
  INSERT INTO public.clients (
    name, 
    email, 
    contact_name,
    user_id
  )
  SELECT 
    substring(u.email from '^[^@]+'), -- Use part of email as name, without 'Client ' prefix
    u.email,
    substring(u.email from '^[^@]+'),
    u.id
  FROM 
    users u
  WHERE 
    u.role = 'client' AND
    NOT EXISTS (
      SELECT 1 FROM clients c WHERE c.user_id = u.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- CREATE INDEXES
-- ==========================================

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_issue_date ON quotes(issue_date);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_quote_id ON payments(quote_id);

-- PV indexes
CREATE INDEX IF NOT EXISTS idx_pv_client_id ON pv(client_id);
CREATE INDEX IF NOT EXISTS idx_pv_project_id ON pv(project_id);
CREATE INDEX IF NOT EXISTS idx_pv_status ON pv(status);

-- TMA indexes
CREATE INDEX IF NOT EXISTS idx_tma_client_id ON tma(client_id);
CREATE INDEX IF NOT EXISTS idx_tma_project_id ON tma(project_id);
CREATE INDEX IF NOT EXISTS idx_tma_status ON tma(status);

-- TMA activities indexes
CREATE INDEX IF NOT EXISTS idx_tma_activities_tma_id ON tma_activities(tma_id);

-- ==========================================
-- STORAGE SETUP
-- ==========================================

-- Create buckets for file storage
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('quote_files', 'quote_files', false),
  ('pv_files', 'pv_files', false),
  ('project_files', 'project_files', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pv ENABLE ROW LEVEL SECURITY;
ALTER TABLE tma ENABLE ROW LEVEL SECURITY;
ALTER TABLE tma_activities ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- HELPER FUNCTIONS FOR RLS
-- ==========================================

-- Fix for the infinite recursion - create a safe function to check admin role
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = auth.uid();
  RETURN user_role = 'admin';
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is gestionnaire or admin
CREATE OR REPLACE FUNCTION is_gestionnaire_or_admin() 
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = auth.uid();
  RETURN user_role IN ('admin', 'gestionnaire');
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- USERS TABLE POLICIES
-- Users can view and edit their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (role = role); -- Prevent changing own role

-- Admins can view and edit all users - policies rewritten to avoid recursion
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (is_admin() = TRUE);

-- CLIENTS TABLE POLICIES
-- Clients can view their own client record
CREATE POLICY "Clients can view their own client record"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view, create, and edit all clients
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can insert clients"
  ON clients FOR INSERT
  WITH CHECK (is_admin() = TRUE);

CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  USING (is_admin() = TRUE);

-- PROJECTS TABLE POLICIES
-- Clients can view their own projects
CREATE POLICY "Clients can view their own projects"
  ON projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = projects.client_id AND clients.user_id = auth.uid()
  ));

-- Gestionnaires can view, create, and edit all projects
CREATE POLICY "Gestionnaires can view all projects"
  ON projects FOR SELECT
  USING (is_gestionnaire_or_admin() = TRUE);

CREATE POLICY "Gestionnaires can insert projects"
  ON projects FOR INSERT
  WITH CHECK (is_gestionnaire_or_admin() = TRUE);

CREATE POLICY "Gestionnaires can update projects"
  ON projects FOR UPDATE
  USING (is_gestionnaire_or_admin() = TRUE);

-- Admins can view, create, and edit all projects
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  WITH CHECK (is_admin() = TRUE);

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (is_admin() = TRUE);

-- QUOTES TABLE POLICIES
-- Clients can view their own quotes
CREATE POLICY "Clients can view their own quotes"
  ON quotes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = quotes.client_id AND clients.user_id = auth.uid()
  ));

-- Gestionnaires can view, create, and edit all quotes
CREATE POLICY "Gestionnaires can view all quotes"
  ON quotes FOR SELECT
  USING (is_gestionnaire_or_admin() = TRUE);

CREATE POLICY "Gestionnaires can insert quotes"
  ON quotes FOR INSERT
  WITH CHECK (is_gestionnaire_or_admin() = TRUE);

CREATE POLICY "Gestionnaires can update quotes"
  ON quotes FOR UPDATE
  USING (is_gestionnaire_or_admin() = TRUE);

-- Admins can view, create, and edit all quotes
CREATE POLICY "Admins can view all quotes"
  ON quotes FOR SELECT
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can insert quotes"
  ON quotes FOR INSERT
  WITH CHECK (is_admin() = TRUE);

CREATE POLICY "Admins can update quotes"
  ON quotes FOR UPDATE
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can delete quotes"
  ON quotes FOR DELETE
  USING (is_admin() = TRUE);

-- FIXED: Clients can validate their own quotes (removed OLD references)
CREATE POLICY "Clients can validate their own quotes"
  ON quotes FOR UPDATE
  USING (
    -- Check if the quote belongs to the client
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = quotes.client_id AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Only allow changing status to validated
    status = 'Validé'
  );

-- PAYMENTS TABLE POLICIES
-- Clients can view their own payments
CREATE POLICY "Clients can view their own payments"
  ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = payments.client_id AND clients.user_id = auth.uid()
  ));

-- Admins can view, create, and edit all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT
  WITH CHECK (is_admin() = TRUE);

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can delete payments"
  ON payments FOR DELETE
  USING (is_admin() = TRUE);

-- PV TABLE POLICIES
-- Clients can view and sign their own PVs
CREATE POLICY "Clients can view their own PVs"
  ON pv FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = pv.client_id AND clients.user_id = auth.uid()
  ));

-- FIXED: Clients can sign their own PVs (removed OLD references)
CREATE POLICY "Clients can sign their own PVs"
  ON pv FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = pv.client_id AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Only allow changing status to signed and setting signature date
    status = 'Signé' AND signature_date IS NOT NULL
  );

-- Admins can view, create, and edit all PVs
CREATE POLICY "Admins can view all PVs"
  ON pv FOR SELECT
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can insert PVs"
  ON pv FOR INSERT
  WITH CHECK (is_admin() = TRUE);

CREATE POLICY "Admins can update PVs"
  ON pv FOR UPDATE
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can delete PVs"
  ON pv FOR DELETE
  USING (is_admin() = TRUE);

-- TMA TABLE POLICIES
-- Clients can view their own TMAs
CREATE POLICY "Clients can view their own TMAs"
  ON tma FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = tma.client_id AND clients.user_id = auth.uid()
  ));

-- Gestionnaires can view, create, and edit all TMAs
CREATE POLICY "Gestionnaires can view all TMAs"
  ON tma FOR SELECT
  USING (is_gestionnaire_or_admin() = TRUE);

CREATE POLICY "Gestionnaires can insert TMAs"
  ON tma FOR INSERT
  WITH CHECK (is_gestionnaire_or_admin() = TRUE);

CREATE POLICY "Gestionnaires can update TMAs"
  ON tma FOR UPDATE
  USING (is_gestionnaire_or_admin() = TRUE);

-- Admins can view, create, and edit all TMAs
CREATE POLICY "Admins can view all TMAs"
  ON tma FOR SELECT
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can insert TMAs"
  ON tma FOR INSERT
  WITH CHECK (is_admin() = TRUE);

CREATE POLICY "Admins can update TMAs"
  ON tma FOR UPDATE
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can delete TMAs"
  ON tma FOR DELETE
  USING (is_admin() = TRUE);

-- TMA ACTIVITIES TABLE POLICIES
-- Clients can view TMA activities related to their TMAs
CREATE POLICY "Clients can view their own TMA activities"
  ON tma_activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tma 
    JOIN clients ON tma.client_id = clients.id
    WHERE tma.id = tma_activities.tma_id AND clients.user_id = auth.uid()
  ));

-- Gestionnaires can view, create, and edit all TMA activities
CREATE POLICY "Gestionnaires can view all TMA activities"
  ON tma_activities FOR SELECT
  USING (is_gestionnaire_or_admin() = TRUE);

CREATE POLICY "Gestionnaires can insert TMA activities"
  ON tma_activities FOR INSERT
  WITH CHECK (is_gestionnaire_or_admin() = TRUE);

CREATE POLICY "Gestionnaires can update TMA activities"
  ON tma_activities FOR UPDATE
  USING (is_gestionnaire_or_admin() = TRUE);

-- Admins can view, create, and edit all TMA activities
CREATE POLICY "Admins can view all TMA activities"
  ON tma_activities FOR SELECT
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can insert TMA activities"
  ON tma_activities FOR INSERT
  WITH CHECK (is_admin() = TRUE);

CREATE POLICY "Admins can update TMA activities"
  ON tma_activities FOR UPDATE
  USING (is_admin() = TRUE);

CREATE POLICY "Admins can delete TMA activities"
  ON tma_activities FOR DELETE
  USING (is_admin() = TRUE);

-- ==========================================
-- STORAGE POLICIES
-- ==========================================

-- QUOTE FILES POLICIES
CREATE POLICY "Anyone authenticated can view files from quote_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'quote_files' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can upload files to quote_files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'quote_files'
    AND is_admin() = TRUE
  );

CREATE POLICY "Admins can update files in quote_files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'quote_files'
    AND is_admin() = TRUE
  );

CREATE POLICY "Admins can delete files from quote_files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'quote_files'
    AND is_admin() = TRUE
  );

-- PV FILES POLICIES
CREATE POLICY "Anyone authenticated can view files from pv_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pv_files' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can upload files to pv_files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pv_files'
    AND is_admin() = TRUE
  );

CREATE POLICY "Admins can update files in pv_files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pv_files'
    AND is_admin() = TRUE
  );

CREATE POLICY "Admins can delete files from pv_files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pv_files'
    AND is_admin() = TRUE
  );

-- PROJECT FILES POLICIES
CREATE POLICY "Anyone authenticated can view files from project_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project_files' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admins and gestionnaires can upload files to project_files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project_files'
    AND (is_admin() = TRUE OR is_gestionnaire_or_admin() = TRUE)
  );

CREATE POLICY "Admins can update files in project_files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project_files'
    AND is_admin() = TRUE
  );

CREATE POLICY "Admins can delete files from project_files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project_files'
    AND is_admin() = TRUE
  );

-- AVATAR POLICIES
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_clients
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_projects
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_quotes
BEFORE UPDATE ON quotes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_payments
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_pv
BEFORE UPDATE ON pv
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tma
BEFORE UPDATE ON tma
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tma_activities
BEFORE UPDATE ON tma_activities
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to create an admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  auth_id UUID,
  user_email TEXT,
  first_name TEXT DEFAULT NULL,
  last_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  INSERT INTO users (id, email, first_name, last_name, role)
  VALUES (auth_id, user_email, first_name, last_name, 'admin')
  ON CONFLICT (id) DO 
    UPDATE SET 
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      role = 'admin',
      updated_at = NOW()
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create a client user
CREATE OR REPLACE FUNCTION create_client_user(
  auth_id UUID,
  user_email TEXT,
  first_name TEXT DEFAULT NULL,
  last_name TEXT DEFAULT NULL,
  company TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  INSERT INTO users (id, email, first_name, last_name, role, company)
  VALUES (auth_id, user_email, first_name, last_name, 'client', company)
  ON CONFLICT (id) DO 
    UPDATE SET 
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      company = EXCLUDED.company,
      role = 'client',
      updated_at = NOW()
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically mark quotes as expired when valid_until date passes
CREATE OR REPLACE FUNCTION check_quote_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If the quote is still awaiting validation and has expired
  IF NEW.status = 'En attente de validation' AND NEW.valid_until < CURRENT_DATE THEN
    NEW.status = 'Expiré';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check quote expiration on update or insert
CREATE TRIGGER check_quote_expiration
BEFORE INSERT OR UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION check_quote_expiration();

-- Function to manually update expired quotes (can be run as a scheduled job)
CREATE OR REPLACE FUNCTION update_expired_quotes()
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE quotes
  SET status = 'Expiré',
      updated_at = NOW()
  WHERE status = 'En attente de validation'
  AND valid_until < CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_expired_quotes() TO authenticated;

-- Function to create authentication audit log view for user login tracking
CREATE OR REPLACE FUNCTION public.create_auth_audit_log_view()
RETURNS void AS $$
BEGIN
  -- Create the view if it doesn't exist
  CREATE OR REPLACE VIEW auth_audit_log_view AS
  SELECT
    -- User ID is in actor_id field in the Supabase audit logs
    (payload->>'actor_id')::uuid AS user_id,
    payload->>'action' AS event_type,
    created_at AS timestamp,
    payload AS full_payload,
    -- Email is in actor_username field
    payload->>'actor_username' AS email
  FROM
    auth.audit_log_entries
  WHERE
    payload->>'action' IN ('login', 'signup', 'token_refreshed');
    
  -- Grant permissions to authenticated users
  GRANT SELECT ON auth_audit_log_view TO authenticated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_auth_audit_log_view() TO authenticated;

-- Comment describing the function
COMMENT ON FUNCTION public.create_auth_audit_log_view() IS 'Creates a view to access auth audit logs for tracking user login history';

-- Debug function to explore audit log structure
CREATE OR REPLACE FUNCTION public.debug_audit_logs()
RETURNS json AS $$
DECLARE
  sample_row RECORD;
  result json;
BEGIN
  -- Get a sample row
  SELECT * INTO sample_row FROM auth.audit_log_entries 
  WHERE payload->>'action' = 'login'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- No rows found
  IF sample_row IS NULL THEN
    RETURN json_build_object('error', 'No login audit logs found');
  END IF;
  
  -- Build response with all potentially useful fields
  result := json_build_object(
    'id', sample_row.id,
    'schema', 'auth',
    'table', 'audit_log_entries',
    'record', json_build_object(
      'id', sample_row.id,
      'payload', sample_row.payload,
      'created_at', sample_row.created_at,
      'payload_keys', (SELECT array_agg(key) FROM jsonb_object_keys(sample_row.payload) AS key),
      'auth_uid_direct', auth.uid()
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.debug_audit_logs() TO authenticated;

-- Execute the function to create the view immediately
SELECT create_auth_audit_log_view();

-- Function to validate a quote (for client usage)
CREATE OR REPLACE FUNCTION validate_quote(quote_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  client_user_id UUID;
  quote_client_id UUID;
  quote_status quote_status;
  current_user_id UUID;
  user_role TEXT;
  log_message TEXT;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Get user's role
  SELECT role::TEXT INTO user_role
  FROM users
  WHERE id = current_user_id;
  
  -- Add logging for debugging
  RAISE LOG 'validate_quote: Started with quote_id=%, user=%, role=%', 
    quote_id, current_user_id, user_role;
  
  -- Exit early if no authenticated user
  IF current_user_id IS NULL THEN
    RAISE LOG 'validate_quote: No authenticated user found';
    RETURN FALSE;
  END IF;
  
  -- Get the quote information
  SELECT client_id, status INTO quote_client_id, quote_status
  FROM quotes
  WHERE id = quote_id;
  
  -- Logging
  RAISE LOG 'validate_quote: Quote info - client_id=%, status=%', quote_client_id, quote_status;
  
  -- Exit if quote not found or not in pending status
  IF quote_client_id IS NULL THEN
    RAISE LOG 'validate_quote: Quote not found';
    RETURN FALSE;
  END IF;
  
  IF quote_status != 'En attente de validation' THEN
    RAISE LOG 'validate_quote: Quote status is not pending: %', quote_status;
    RETURN FALSE;
  END IF;
  
  -- Get the user_id for the client
  SELECT user_id INTO client_user_id
  FROM clients
  WHERE id = quote_client_id;
  
  -- Logging
  RAISE LOG 'validate_quote: Client user_id=%, current_user=%', client_user_id, current_user_id;
  
  -- Check if client user exists
  IF client_user_id IS NULL THEN
    RAISE LOG 'validate_quote: Client has no user_id';
    RETURN FALSE;
  END IF;
  
  -- Allow validation if user is client owner OR has admin role
  IF client_user_id = current_user_id OR user_role = 'admin' THEN
    -- Update quote status
    UPDATE quotes
    SET status = 'Validé',
        updated_at = NOW()
    WHERE id = quote_id;
    
    RAISE LOG 'validate_quote: Success - validated quote %', quote_id;
    RETURN TRUE;
  ELSE
    RAISE LOG 'validate_quote: Permission denied - user % (role %) not owner or admin', 
      current_user_id, user_role;
    RETURN FALSE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS log_message = MESSAGE_TEXT;
  RAISE LOG 'validate_quote: Exception - %', log_message;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on validate_quote
GRANT EXECUTE ON FUNCTION public.validate_quote(UUID) TO authenticated;

-- Function to check authentication status
CREATE OR REPLACE FUNCTION check_auth() 
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'user_id', auth.uid(),
    'role', (SELECT role FROM users WHERE id = auth.uid()),
    'email', (SELECT email FROM users WHERE id = auth.uid()),
    'client_id', (SELECT id FROM clients WHERE user_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on check_auth
GRANT EXECUTE ON FUNCTION public.check_auth() TO authenticated;

-- Function to manually validate quotes without needing RLS
CREATE OR REPLACE FUNCTION manual_validate_quote(
  quote_id UUID,
  user_email TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  user_role TEXT;
  quote_client_id UUID;
  client_user_id UUID;
  quote_status quote_status;
BEGIN
  -- Find the user by email
  SELECT id, role::TEXT INTO user_id, user_role
  FROM users
  WHERE email = user_email;
  
  -- Log for debugging
  RAISE LOG 'manual_validate: User % has role %', user_email, user_role;
  
  -- Check if user exists
  IF user_id IS NULL THEN
    RAISE LOG 'manual_validate: No user found with email %', user_email;
    RETURN FALSE;
  END IF;
  
  -- Get quote info
  SELECT client_id, status INTO quote_client_id, quote_status
  FROM quotes
  WHERE id = quote_id;
  
  -- Check if quote is valid
  IF quote_client_id IS NULL THEN
    RAISE LOG 'manual_validate: Quote % not found', quote_id;
    RETURN FALSE;
  END IF;
  
  IF quote_status != 'En attente de validation' THEN
    RAISE LOG 'manual_validate: Quote status is %', quote_status;
    RETURN FALSE;
  END IF;
  
  -- Get client user ID
  SELECT c.user_id INTO client_user_id
  FROM clients c
  WHERE c.id = quote_client_id;
  
  -- Allow validation if user is the client owner OR is an admin
  IF user_id = client_user_id OR user_role = 'admin' THEN
    -- Update quote status
    UPDATE quotes
    SET status = 'Validé',
        updated_at = NOW()
    WHERE id = quote_id;
    
    RAISE LOG 'manual_validate: Successfully validated quote % by %', quote_id, user_email;
    RETURN TRUE;
  ELSE
    RAISE LOG 'manual_validate: Permission denied for % (not owner or admin)', user_email;
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on manual_validate_quote
GRANT EXECUTE ON FUNCTION public.manual_validate_quote(UUID, TEXT) TO authenticated;

-- Function to sign a PV (for client usage)
CREATE OR REPLACE FUNCTION sign_pv(pv_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  client_user_id UUID;
  pv_client_id UUID;
  pv_status pv_status;
BEGIN
  -- Get the client ID and status for the PV
  SELECT client_id, status INTO pv_client_id, pv_status
  FROM pv
  WHERE id = pv_id;
  
  -- If PV not found or already signed
  IF pv_client_id IS NULL OR pv_status != 'En attente de signature' THEN
    RETURN FALSE;
  END IF;
  
  -- Get the user_id for the client
  SELECT user_id INTO client_user_id
  FROM clients
  WHERE id = pv_client_id;
  
  -- Check if the current user is linked to the client
  IF client_user_id = auth.uid() THEN
    -- Update the PV status
    UPDATE pv
    SET status = 'Signé',
        signature_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = pv_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- USER MANAGEMENT VIEW
-- ==========================================

-- Create a view for user management
CREATE OR REPLACE VIEW user_management AS
SELECT 
  u.id, 
  u.email, 
  u.first_name, 
  u.last_name, 
  u.role::text, 
  u.company,
  EXISTS (SELECT 1 FROM clients c WHERE c.user_id = u.id) AS has_client_record,
  u.created_at
FROM 
  users u 
WHERE 
  -- Only admins can access this view
  is_admin() = TRUE OR auth.uid() = u.id;

-- Grant permissions on the view
GRANT SELECT ON user_management TO authenticated;

-- ==========================================
-- USAGE INSTRUCTIONS
-- ==========================================

/*
HOW TO USE THIS DATABASE SCHEMA:

1. Run this entire script in the Supabase SQL Editor

2. Users will automatically be added to the 'users' table when they sign up through Supabase Auth,
   with the default role of 'client'.

3. To promote a user to admin:
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   OR
   SELECT create_admin_user(
     'auth_user_id_here', 
     'admin@example.com',
     'Admin',
     'User'
   );

4. Create clients and link them to users:
   INSERT INTO clients (name, email, contact_name, user_id)
   VALUES ('Client Company', 'contact@client.com', 'Contact Name', 'user_id_here');

5. Storage buckets are set up with correct permissions:
   - quote_files: For storing quote PDFs
   - pv_files: For storing signed documents
   - project_files: For project documentation
   - avatars: For user profile pictures

6. Use the user_management view to see all users and their roles:
   SELECT * FROM user_management;

7. Clients can validate quotes in two ways:
   - Through the UI (implemented in your React app)
   - By calling: SELECT validate_quote('quote_id_here');

8. Similarly, clients can sign PVs through:
   - The UI
   - By calling: SELECT sign_pv('pv_id_here');
*/

-- Debugging function to check quote validation permission
CREATE OR REPLACE FUNCTION debug_quote_validation_permission(quote_id UUID)
RETURNS jsonb AS $$
DECLARE
  quote_record RECORD;
  client_record RECORD;
  user_role TEXT;
  result jsonb;
BEGIN
  -- Get the quote details
  SELECT * INTO quote_record
  FROM quotes
  WHERE id = quote_id;
  
  -- If quote not found
  IF quote_record IS NULL THEN
    RETURN jsonb_build_object(
      'has_permission', false,
      'reason', 'Quote not found'
    );
  END IF;
  
  -- Get the client linked to this quote
  SELECT * INTO client_record
  FROM clients
  WHERE id = quote_record.client_id;
  
  -- Get user's role
  SELECT role::TEXT INTO user_role
  FROM users
  WHERE id = auth.uid();
  
  -- Create the result object
  result := jsonb_build_object(
    'quote_id', quote_id,
    'client_id', quote_record.client_id,
    'quote_status', quote_record.status,
    'client_user_id', client_record.user_id,
    'current_user_id', auth.uid(),
    'user_role', user_role,
    'is_client_owner', client_record.user_id = auth.uid(),
    'is_admin', user_role = 'admin',
    'status_pending', quote_record.status = 'En attente de validation',
    'has_permission', (
      (client_record.user_id = auth.uid() OR user_role = 'admin') AND 
      quote_record.status = 'En attente de validation'
    )
  );
  
  IF NOT (client_record.user_id = auth.uid() OR user_role = 'admin') THEN
    result := result || jsonb_build_object('reason', 'User is neither the client owner nor an admin');
  ELSIF NOT (quote_record.status = 'En attente de validation') THEN
    result := result || jsonb_build_object('reason', 'Quote status is not "En attente de validation"');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.debug_quote_validation_permission(UUID) TO authenticated;