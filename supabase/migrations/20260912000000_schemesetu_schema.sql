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

-- 11. USER ROLES TABLE (Authoritative RBAC: user, admin)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AGENCIES TABLE (Apex channelising corporations)
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.agencies (code, name, full_name, website, description)
VALUES 
  ('NSFDC', 'NSFDC', 'National Scheduled Castes Finance and Development Corporation', 'https://nsfdc.nic.in', 'Dedicated to socio-economic development and credit facilitation for Scheduled Caste entrepreneurs.'),
  ('NBCFDC', 'NBCFDC', 'National Backward Classes Finance and Development Corporation', 'https://nbcfdc.gov.in', 'Promotes economic empowerment and self-employment among Other Backward Classes (OBCs) and EBCs.'),
  ('NSKFDC', 'NSKFDC', 'National Safai Karamcharis Finance and Development Corporation', 'https://nskfdc.nic.in', 'Empowering Safai Karamcharis, manual scavengers, sanitation workers, and their dependents through concessional finance.')
ON CONFLICT (code) DO NOTHING;

-- 13. SCHEME SOURCES TABLE (Official government verification and gazette links)
CREATE TABLE IF NOT EXISTS public.scheme_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    official_url TEXT NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    last_verified_at DATE NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_scheme_sources_scheme ON public.scheme_sources(scheme_id);

-- =============================================================================
-- HELPER FUNCTIONS & RPC
-- =============================================================================

-- Deterministic check for admin privilege
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic transaction for creating a complete scheme across all tables
CREATE OR REPLACE FUNCTION public.create_scheme_atomic(
    p_scheme JSONB,
    p_terms JSONB,
    p_rules JSONB,
    p_documents JSONB,
    p_source JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_scheme_id UUID;
    v_doc JSONB;
BEGIN
    -- 1. Verify caller has admin privilege
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: only admin users can create schemes.';
    END IF;

    -- 2. Insert into schemes table
    INSERT INTO public.schemes (
        code,
        name,
        name_hi,
        corporation,
        corporation_full_name,
        target_group,
        target_group_hi,
        description,
        description_hi,
        special_benefits,
        special_benefits_hi,
        application_process,
        application_process_hi,
        channel_partners,
        source_url,
        source_name,
        effective_from,
        last_verified_at,
        active,
        is_demo_data
    ) VALUES (
        p_scheme->>'code',
        p_scheme->>'name',
        COALESCE(p_scheme->>'name_hi', p_scheme->>'name'),
        p_scheme->>'corporation',
        COALESCE(p_scheme->>'corporation_full_name', p_scheme->>'corporation'),
        COALESCE(p_scheme->>'target_group', 'Affirmative Beneficiaries'),
        COALESCE(p_scheme->>'target_group_hi', 'लक्षित लाभार्थी'),
        p_scheme->>'description',
        COALESCE(p_scheme->>'description_hi', p_scheme->>'description'),
        COALESCE(p_scheme->'special_benefits', '[]'::JSONB),
        COALESCE(p_scheme->'special_benefits_hi', '[]'::JSONB),
        COALESCE(p_scheme->'application_process', '[]'::JSONB),
        COALESCE(p_scheme->'application_process_hi', '[]'::JSONB),
        COALESCE(p_scheme->'channel_partners', '["State Channelising Agencies (SCAs)", "Public Sector Banks"]'::JSONB),
        COALESCE(p_source->>'official_url', p_scheme->>'source_url'),
        COALESCE(p_source->>'source_name', p_scheme->>'source_name'),
        (COALESCE(p_source->>'effective_from', p_scheme->>'effective_from', CURRENT_DATE::TEXT))::DATE,
        (COALESCE(p_source->>'last_verified_at', CURRENT_DATE::TEXT))::DATE,
        COALESCE((p_scheme->>'active')::BOOLEAN, TRUE),
        COALESCE((p_scheme->>'is_demo_data')::BOOLEAN, FALSE)
    ) RETURNING id INTO v_scheme_id;

    -- 3. Insert into scheme_terms
    INSERT INTO public.scheme_terms (
        scheme_id,
        interest_rate_min,
        interest_rate_max,
        rebate_for_women_percent,
        tenure_years_max,
        moratorium_months,
        subsidy_rate_percent
    ) VALUES (
        v_scheme_id,
        (p_terms->>'interest_rate_min')::NUMERIC,
        (p_terms->>'interest_rate_max')::NUMERIC,
        COALESCE((p_terms->>'rebate_for_women_percent')::NUMERIC, 1.0),
        COALESCE((p_terms->>'tenure_years_max')::INTEGER, 5),
        COALESCE((p_terms->>'moratorium_months')::INTEGER, 6),
        COALESCE((p_terms->>'subsidy_rate_percent')::NUMERIC, 0)
    );

    -- 4. Insert into scheme_rules
    INSERT INTO public.scheme_rules (
        scheme_id,
        min_age,
        max_age,
        max_annual_income,
        min_project_cost,
        max_project_cost,
        max_loan_amount,
        personal_contribution_min_percent,
        eligible_categories,
        eligible_genders,
        eligible_states,
        eligible_sectors,
        mandatory_training_required,
        special_conditions_notes,
        effective_from,
        last_verified_at
    ) VALUES (
        v_scheme_id,
        COALESCE((p_rules->>'min_age')::INTEGER, 18),
        COALESCE((p_rules->>'max_age')::INTEGER, 60),
        COALESCE((p_rules->>'max_annual_income')::NUMERIC, 300000),
        COALESCE((p_rules->>'min_project_cost')::NUMERIC, 10000),
        COALESCE((p_rules->>'max_project_cost')::NUMERIC, 5000000),
        (p_rules->>'max_loan_amount')::NUMERIC,
        COALESCE((p_rules->>'personal_contribution_min_percent')::NUMERIC, 5.0),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_rules->'eligible_categories', '["SC"]'::JSONB))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_rules->'eligible_genders', '["male", "female", "other"]'::JSONB))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_rules->'eligible_states', '[]'::JSONB))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_rules->'eligible_sectors', '[]'::JSONB))),
        COALESCE((p_rules->>'mandatory_training_required')::BOOLEAN, FALSE),
        p_rules->>'special_conditions_notes',
        (COALESCE(p_rules->>'effective_from', CURRENT_DATE::TEXT))::DATE,
        (COALESCE(p_rules->>'last_verified_at', CURRENT_DATE::TEXT))::DATE
    );

    -- 5. Insert documents if provided
    IF p_documents IS NOT NULL AND jsonb_array_length(p_documents) > 0 THEN
        FOR v_doc IN SELECT * FROM jsonb_array_elements(p_documents)
        LOOP
            INSERT INTO public.scheme_documents (
                scheme_id,
                code,
                title,
                title_hi,
                description,
                description_hi,
                requirement_type,
                condition_note
            ) VALUES (
                v_scheme_id,
                COALESCE(v_doc->>'code', 'DOC_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
                v_doc->>'title',
                COALESCE(v_doc->>'title_hi', v_doc->>'title'),
                v_doc->>'description',
                v_doc->>'description_hi',
                COALESCE(v_doc->>'requirement_type', 'required'),
                v_doc->>'condition_note'
            );
        END LOOP;
    END IF;

    -- 6. Insert scheme source
    IF p_source IS NOT NULL THEN
        INSERT INTO public.scheme_sources (
            scheme_id,
            source_name,
            official_url,
            effective_from,
            effective_to,
            last_verified_at,
            is_verified
        ) VALUES (
            v_scheme_id,
            p_source->>'source_name',
            p_source->>'official_url',
            (COALESCE(p_source->>'effective_from', CURRENT_DATE::TEXT))::DATE,
            CASE WHEN p_source->>'effective_to' IS NOT NULL THEN (p_source->>'effective_to')::DATE ELSE NULL END,
            (COALESCE(p_source->>'last_verified_at', CURRENT_DATE::TEXT))::DATE,
            COALESCE((p_source->>'is_verified')::BOOLEAN, TRUE)
        );
    END IF;

    RETURN jsonb_build_object('success', true, 'scheme_id', v_scheme_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. User Roles:
-- Users can view their own role; only admins can view or change any user role
CREATE POLICY "Users can read own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles FOR ALL 
USING (public.is_admin());

-- 2. Agencies: Public read, Admin write
CREATE POLICY "Public agencies viewable by everyone" 
ON public.agencies FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage agencies" 
ON public.agencies FOR ALL 
USING (public.is_admin());

-- 3. Schemes: Public read active schemes, Admin full management
CREATE POLICY "Public schemes viewable by everyone" 
ON public.schemes FOR SELECT 
USING (active = true OR public.is_admin());

CREATE POLICY "Admins can insert schemes" 
ON public.schemes FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update schemes" 
ON public.schemes FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete schemes" 
ON public.schemes FOR DELETE 
USING (public.is_admin());

-- 4. Scheme Rules: Public read, Admin write
CREATE POLICY "Public scheme rules viewable by everyone" 
ON public.scheme_rules FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert scheme rules" 
ON public.scheme_rules FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update scheme rules" 
ON public.scheme_rules FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete scheme rules" 
ON public.scheme_rules FOR DELETE 
USING (public.is_admin());

-- 5. Scheme Terms: Public read, Admin write
CREATE POLICY "Public scheme terms viewable by everyone" 
ON public.scheme_terms FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert scheme terms" 
ON public.scheme_terms FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update scheme terms" 
ON public.scheme_terms FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete scheme terms" 
ON public.scheme_terms FOR DELETE 
USING (public.is_admin());

-- 6. Scheme Documents: Public read, Admin write
CREATE POLICY "Public scheme documents viewable by everyone" 
ON public.scheme_documents FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert scheme documents" 
ON public.scheme_documents FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update scheme documents" 
ON public.scheme_documents FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete scheme documents" 
ON public.scheme_documents FOR DELETE 
USING (public.is_admin());

-- 7. Scheme Sources: Public read, Admin write
CREATE POLICY "Public scheme sources viewable by everyone" 
ON public.scheme_sources FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert scheme sources" 
ON public.scheme_sources FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update scheme sources" 
ON public.scheme_sources FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete scheme sources" 
ON public.scheme_sources FOR DELETE 
USING (public.is_admin());

-- 8. Branches: Public read
CREATE POLICY "Public branches viewable by everyone" 
ON public.branches FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage branches" 
ON public.branches FOR ALL 
USING (public.is_admin());

-- 9. User-specific private tables:
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

CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_logs FOR SELECT 
USING (public.is_admin());

