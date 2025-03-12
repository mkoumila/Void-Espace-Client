-- Script de création des tables pour Supabase
-- Basé sur le modèle de données de l'application

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs (extension de auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    department TEXT,
    position TEXT,
    role TEXT NOT NULL DEFAULT 'Client',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des adresses des utilisateurs
CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    street TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des projets
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'planning',
    progress INTEGER NOT NULL DEFAULT 0,
    budget NUMERIC(10,2),
    manager TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT progress_range CHECK (progress >= 0 AND progress <= 100)
);

-- Table de liaison entre projets et utilisateurs
CREATE TABLE project_users (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT project_user_unique UNIQUE (project_id, user_id)
);

-- Table des documents et PVs
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    project TEXT, -- Nom du projet (champ texte, pas de relation)
    project_id INTEGER, -- Identifiant du projet (pour référence uniquement, pas de contrainte)
    assigned_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    signed_at TIMESTAMPTZ,
    file_path TEXT, -- Chemin du fichier dans le bucket Supabase Storage
    signed_file_path TEXT, -- Chemin du fichier signé dans le bucket Supabase Storage
    transferred_to_name TEXT,
    transferred_to_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des rappels
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des paiements et factures
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    project TEXT, -- Nom du projet (champ texte, pas de relation)
    project_id INTEGER, -- Identifiant du projet (pour référence uniquement, pas de contrainte)
    assigned_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    file_path TEXT, -- Chemin du fichier de facture dans le bucket Supabase Storage
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des devis
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    reference TEXT NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    valid_until DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    file_path TEXT, -- Chemin du fichier de devis dans le bucket Supabase Storage
    project TEXT, -- Nom du projet (champ texte, pas de relation)
    project_id INTEGER, -- Identifiant du projet (pour référence uniquement, pas de contrainte)
    assigned_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des paramètres
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des modèles d'emails
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Création des index
CREATE INDEX idx_user_profiles_id ON user_profiles(id);
CREATE INDEX idx_documents_assigned_user ON documents(assigned_user);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(type);

CREATE INDEX idx_payments_assigned_user ON payments(assigned_user);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_quotes_assigned_user ON quotes(assigned_user);
CREATE INDEX idx_quotes_status ON quotes(status);

CREATE INDEX idx_reminders_document_id ON reminders(document_id);

-- Fonctions pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheurs pour mettre à jour automatiquement le champ updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON quotes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON email_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Exemple de politique pour les administrateurs
CREATE POLICY admin_all_access ON user_profiles
    FOR ALL
    TO authenticated
    USING (
        (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'Administrateur'
    );

-- Exemple de politique pour les utilisateurs (accès à leur propre profil)
CREATE POLICY users_read_own_profile ON user_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Exemple de politique pour les utilisateurs (accès à leurs propres adresses)
CREATE POLICY users_manage_own_addresses ON user_addresses
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Exemple de politique pour les documents assignés à l'utilisateur
CREATE POLICY users_access_own_documents ON documents
    FOR ALL
    TO authenticated
    USING (
        assigned_user = auth.uid() OR
        (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'Administrateur'
    );

-- Note: Vous devrez créer des politiques similaires pour toutes les tables
-- en fonction des exigences de sécurité de votre application

-- Création des buckets de stockage (à exécuter via l'interface Supabase ou l'API)
-- Ces commandes sont fournies à titre indicatif et doivent être adaptées
/*
-- Créer un bucket pour les documents
SELECT storage.create_bucket('documents', 'Documents et PVs');

-- Créer un bucket pour les factures
SELECT storage.create_bucket('invoices', 'Factures');

-- Créer un bucket pour les devis
SELECT storage.create_bucket('quotes', 'Devis');

-- Configurer les politiques d'accès aux buckets
-- Par exemple, permettre aux utilisateurs authentifiés de lire leurs propres documents
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
    'Authenticated users can read their own documents',
    '(auth.uid() = (SELECT assigned_user FROM documents WHERE file_path = storage.filename(bucket_id, name)))',
    'documents'
);
*/ 