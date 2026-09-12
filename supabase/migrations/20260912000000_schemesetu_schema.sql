-- =============================================================================
-- SchemeSetu — Supabase Database Migration & Schema Definition
-- Ministry of Social Justice and Empowerment, Government of India (SIH26092)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User profiles & authenticated entrepreneurs/admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'entrepreneur' CHECK (role IN ('entrepreneur', 'admin', 'officer')),
    
    -- Beneficiary Attributes
    age INTEGER CHECK (age >= 18 AND age <= 100),
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    state TEXT,
    district TEXT,
    location_type TEXT CHECK (location_type IN ('rural', 'urban', 'semi-urban')),
    category TEXT CHECK (category IN ('SC', 'OBC', 'SafaiKaramchari', 'DNT_NT', 'EBC', 'General')),
    
    -- Financial profile
    annual_family_income NUMERIC(12, 2) DEFAULT 0,
    project_cost NUMERIC(12, 2) DEFAULT 0,
    requested_loan_amount NUMERIC(12, 2) DEFAULT 0,
    personal_contribution NUMERIC(12, 2) DEFAULT 0,
    
    -- Business profile
    business_sector TEXT,
    business_stage TEXT CHECK (business_stage IN ('idea', 'starting', 'existing')),
    business_description TEXT,
    employment_status TEXT CHECK (employment_status IN ('unemployed', 'self_employed', 'wage_worker', 'student')),
    
    -- Skills & Education
    education_level TEXT,
    technical_training BOOLEAN DEFAULT FALSE,
    technical_training_details TEXT,
    vocational_certification BOOLEAN DEFAULT FALSE,
    experience_years INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHEMES TABLE (Official schemes under MoSJE corporations)
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    corporation TEXT NOT NULL CHECK (corporation IN ('NSFDC', 'NBCFDC', 'NSKFDC')),
    corporation_full_name TEXT NOT NULL,
    target_group TEXT NOT NULL,
    target_group_hi TEXT NOT NULL,
    description TEXT NOT NULL,
    description_hi TEXT NOT NULL,
    
    special_benefits JSONB DEFAULT '[]'::JSONB,
    special_benefits_hi JSONB DEFAULT '[]'::JSONB,
    application_process JSONB DEFAULT '[]'::JSONB,
    application_process_hi JSONB DEFAULT '[]'::JSONB,
    channel_partners JSONB DEFAULT '[]'::JSONB,
    
    source_url TEXT NOT NULL,
    source_name TEXT NOT NULL,
    effective_from DATE NOT NULL,
    last_verified_at DATE NOT NULL,
    
    active BOOLEAN DEFAULT TRUE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SCHEME RULES TABLE (Deterministic eligibility parameters)
CREATE TABLE IF NOT EXISTS public.scheme_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 60,
    max_annual_income NUMERIC(12, 2) DEFAULT 300000, -- 0 means no income ceiling
    min_project_cost NUMERIC(12, 2) DEFAULT 10000,
    max_project_cost NUMERIC(12, 2) DEFAULT 5000000,
    max_loan_amount NUMERIC(12, 2) DEFAULT 4500000,
    personal_contribution_min_percent NUMERIC(5, 2) DEFAULT 5.0,
    
    eligible_categories TEXT[] NOT NULL, -- e.g. ARRAY['SC']
    eligible_genders TEXT[] NOT NULL, -- e.g. ARRAY['male', 'female', 'other']
    eligible_states TEXT[] DEFAULT ARRAY[]::TEXT[],
    eligible_sectors TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    mandatory_training_required BOOLEAN DEFAULT FALSE,
    special_conditions_notes TEXT,
    
    effective_from DATE DEFAULT CURRENT_DATE,
    last_verified_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCHEME TERMS TABLE (Financial terms, interest rates, tenure)
CREATE TABLE IF NOT EXISTS public.scheme_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    
    interest_rate_min NUMERIC(5, 2) NOT NULL,
    interest_rate_max NUMERIC(5, 2) NOT NULL,
    rebate_for_women_percent NUMERIC(5, 2) DEFAULT 1.0,
    tenure_years_max INTEGER DEFAULT 7,
    moratorium_months INTEGER DEFAULT 6,
    subsidy_rate_percent NUMERIC(5, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SCHEME DOCUMENTS TABLE (Mandatory & conditional documents required)
CREATE TABLE IF NOT EXISTS public.scheme_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    title_hi TEXT NOT NULL,
    description TEXT,
    description_hi TEXT,
    requirement_type TEXT CHECK (requirement_type IN ('required', 'conditional', 'optional')),
    condition_note TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CHANNEL PARTNERS & BRANCHES TABLE (State Channelising Agencies, Banks, RRBs)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_hi TEXT,
    corporation TEXT NOT NULL,
    agency_type TEXT CHECK (agency_type IN ('SCA', 'PSB', 'RRB', 'Channel Partner')),
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    pincode TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    phone TEXT,
    email TEXT,
    operating_hours TEXT,
    website TEXT,
    is_demo_data BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MATCH RUNS TABLE (Audit log of questionnaire submissions)
CREATE TABLE IF NOT EXISTS public.match_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    profile_snapshot JSONB NOT NULL,
    total_eligible INTEGER DEFAULT 0,
    best_match_scheme_id UUID REFERENCES public.schemes(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MATCH RESULTS TABLE (Individual scheme evaluations per match run)
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_run_id UUID NOT NULL REFERENCES public.match_runs(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    
    status TEXT CHECK (status IN ('eligible', 'possibly_eligible', 'not_eligible')),
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    reasons_eligible JSONB DEFAULT '[]'::JSONB,
    reasons_not_eligible JSONB DEFAULT '[]'::JSONB,
    potential_blockers JSONB DEFAULT '[]'::JSONB,
    financial_estimate JSONB NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DOCUMENT CHECKLISTS (Applicant's tracked checklist status)
CREATE TABLE IF NOT EXISTS public.document_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    document_code TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    uploaded_file_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, scheme_id, document_code)
);

-- 10. ADMIN AUDIT LOGS (Record of all eligibility rule updates)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user TEXT NOT NULL,
    action TEXT NOT NULL,
    target_scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
    scheme_name TEXT NOT NULL,
    field_changed TEXT NOT NULL,
    previous_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_schemes_active ON public.schemes(active);
CREATE INDEX IF NOT EXISTS idx_schemes_corp ON public.schemes(corporation);
CREATE INDEX IF NOT EXISTS idx_scheme_rules_scheme ON public.scheme_rules(scheme_id);
CREATE INDEX IF NOT EXISTS idx_branches_state_dist ON public.branches(state, district);
CREATE INDEX IF NOT EXISTS idx_branches_geo ON public.branches(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_match_runs_user ON public.match_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_match_results_run ON public.match_results(match_run_id);
CREATE INDEX IF NOT EXISTS idx_checklists_user_scheme ON public.document_checklists(user_id, scheme_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Schemes & Rules: Public read, Admin write
CREATE POLICY "Public schemes viewable by everyone" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Public scheme rules viewable by everyone" ON public.scheme_rules FOR SELECT USING (true);
CREATE POLICY "Public scheme terms viewable by everyone" ON public.scheme_terms FOR SELECT USING (true);
CREATE POLICY "Public scheme documents viewable by everyone" ON public.scheme_documents FOR SELECT USING (true);
CREATE POLICY "Public branches viewable by everyone" ON public.branches FOR SELECT USING (true);

-- User-specific private tables:
CREATE POLICY "Users can view and edit own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);

CREATE POLICY "Users can view own match runs" 
ON public.match_runs FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert match runs" 
ON public.match_runs FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own checklists" 
ON public.document_checklists FOR ALL 
USING (auth.uid() = user_id);

-- Admin policies:
CREATE POLICY "Admins can update scheme rules" 
ON public.scheme_rules FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
