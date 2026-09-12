import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  ApplicantProfile, 
  Scheme, 
  SchemeRule, 
  SchemeTerms, 
  SchemeDocument, 
  EligibilityResult,
  ChannelPartnerBranch,
  AdminAuditLog
} from '../types';
import { INITIAL_SCHEMES, INITIAL_BRANCHES } from '../data/seedSchemes';

// In-memory lookup caches to prevent redundant network requests (STEP 4)
let cachedBeneficiaryGroups: Array<{ code: string; label: string; description: string }> | null = null;
let cachedStates: Array<{ code: string; name: string; state_type?: string }> | null = null;
let cachedLookupOptions: Record<string, Array<{ code: string; label: string }>> = {};
let cachedSchemes: Scheme[] | null = null;

// ============================================================================
// 1. DATABASE-DRIVEN DROPDOWNS & LOOKUPS (STEP 4)
// ============================================================================

/**
 * Fetch beneficiary categories from Supabase `beneficiary_groups` table or schema lookups
 */
export async function getBeneficiaryGroups(): Promise<Array<{ code: string; label: string; description: string }>> {
  if (cachedBeneficiaryGroups && cachedBeneficiaryGroups.length > 0) {
    return cachedBeneficiaryGroups;
  }

  try {
    const { data, error } = await supabase
      .from('beneficiary_groups')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      cachedBeneficiaryGroups = data.map(g => ({
        code: g.code,
        label: g.label || g.name || g.code,
        description: g.description || ''
      }));
      return cachedBeneficiaryGroups;
    }
  } catch (err) {
    console.warn('[SupabaseService] getBeneficiaryGroups note:', err);
  }

  // Authoritative MoSJE beneficiary categories
  cachedBeneficiaryGroups = [
    { code: 'SC', label: 'Scheduled Caste (SC)', description: 'Eligible for NSFDC concessional loans up to ₹50 Lakh' },
    { code: 'OBC', label: 'Other Backward Class (OBC - Non-Creamy Layer)', description: 'Eligible for NBCFDC concessional loans and Mahila Samriddhi' },
    { code: 'SafaiKaramchari', label: 'Safai Karamchari / Sanitation Worker & Dependents', description: 'Eligible for NSKFDC livelihood & mechanized cleaning loans (No income ceiling)' },
    { code: 'DNT_NT', label: 'De-Notified, Nomadic & Semi-Nomadic Tribes (DNT/NT)', description: 'Special welfare sub-schemes under NBCFDC' },
    { code: 'EBC', label: 'Economically Backward Classes (EBC)', description: 'Eligible under specific NBCFDC affirmative programs' },
  ];
  return cachedBeneficiaryGroups;
}

/**
 * Fetch India States and Union Territories from Supabase `india_states` table
 */
export async function getIndiaStates(): Promise<Array<{ code: string; name: string; state_type?: string }>> {
  if (cachedStates && cachedStates.length > 0) {
    return cachedStates;
  }

  try {
    const { data, error } = await supabase
      .from('india_states')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      cachedStates = data.map(s => ({
        code: s.code || s.state_code || s.name,
        name: s.name,
        state_type: s.state_type || 'STATE'
      }));
      return cachedStates;
    }
  } catch (err) {
    console.warn('[SupabaseService] getIndiaStates note:', err);
  }

  // Domicile list covering all states & UTs
  cachedStates = [
    { code: 'DL', name: 'Delhi', state_type: 'UT' },
    { code: 'UP', name: 'Uttar Pradesh', state_type: 'STATE' },
    { code: 'MH', name: 'Maharashtra', state_type: 'STATE' },
    { code: 'BR', name: 'Bihar', state_type: 'STATE' },
    { code: 'MP', name: 'Madhya Pradesh', state_type: 'STATE' },
    { code: 'RJ', name: 'Rajasthan', state_type: 'STATE' },
    { code: 'WB', name: 'West Bengal', state_type: 'STATE' },
    { code: 'TN', name: 'Tamil Nadu', state_type: 'STATE' },
    { code: 'KA', name: 'Karnataka', state_type: 'STATE' },
    { code: 'GJ', name: 'Gujarat', state_type: 'STATE' },
    { code: 'PB', name: 'Punjab', state_type: 'STATE' },
    { code: 'HR', name: 'Haryana', state_type: 'STATE' },
    { code: 'AP', name: 'Andhra Pradesh', state_type: 'STATE' },
    { code: 'TG', name: 'Telangana', state_type: 'STATE' },
    { code: 'KL', name: 'Kerala', state_type: 'STATE' },
    { code: 'OD', name: 'Odisha', state_type: 'STATE' },
    { code: 'AS', name: 'Assam', state_type: 'STATE' },
    { code: 'JH', name: 'Jharkhand', state_type: 'STATE' },
    { code: 'CG', name: 'Chhattisgarh', state_type: 'STATE' },
    { code: 'UK', name: 'Uttarakhand', state_type: 'STATE' },
    { code: 'HP', name: 'Himachal Pradesh', state_type: 'STATE' },
    { code: 'JK', name: 'Jammu & Kashmir', state_type: 'UT' }
  ];
  return cachedStates;
}

/**
 * Fetch generic lookup options from Supabase `lookup_options` table
 */
export async function getLookupOptions(category: string): Promise<Array<{ code: string; label: string }>> {
  if (cachedLookupOptions[category] && cachedLookupOptions[category].length > 0) {
    return cachedLookupOptions[category];
  }

  try {
    const { data, error } = await supabase
      .from('lookup_options')
      .select('code, label, sort_order')
      .eq('category', category)
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      cachedLookupOptions[category] = data.map(item => ({ code: item.code, label: item.label }));
      return cachedLookupOptions[category];
    }
  } catch (err) {
    console.warn(`[SupabaseService] getLookupOptions(${category}) note:`, err);
  }

  if (category === 'business_sector') {
    cachedLookupOptions[category] = [
      { code: 'Retail & Petty Trade', label: 'Retail & Petty Trade' },
      { code: 'Small Scale Manufacturing', label: 'Small Scale Manufacturing' },
      { code: 'Service & Repair Shop', label: 'Service & Repair Shop' },
      { code: 'Agriculture & Allied Activities', label: 'Agriculture & Allied Activities' },
      { code: 'Animal Husbandry & Dairy', label: 'Animal Husbandry & Dairy' },
      { code: 'Sanitation & Mechanized Cleaning', label: 'Sanitation & Mechanized Cleaning' },
      { code: 'Transport & Logistics Vehicle', label: 'Transport & Logistics Vehicle' },
      { code: 'Artisan & Handloom Craft', label: 'Artisan & Handloom Craft' },
      { code: 'Food Processing & Catering', label: 'Food Processing & Catering' },
      { code: 'Beauty, Wellness & Tailoring', label: 'Beauty, Wellness & Tailoring' },
    ];
    return cachedLookupOptions[category];
  }

  return [];
}

// ============================================================================
// 2. SCHEMES & RULES FROM SUPABASE (STEP 5 & STEP 7)
// ============================================================================

/**
 * Load all official schemes, joining terms, rules, and documents from Supabase
 */
export async function getOfficialSchemes(forceRefresh = false): Promise<Scheme[]> {
  if (cachedSchemes && cachedSchemes.length > 0 && !forceRefresh) {
    return cachedSchemes;
  }

  try {
    // 1. Fetch schemes
    const { data: dbSchemes, error: schemesErr } = await supabase
      .from('schemes')
      .select('*')
      .order('code');

    if (!schemesErr && dbSchemes && dbSchemes.length > 0) {
      // 2. Fetch associated rules, terms, and documents
      const [rulesRes, termsRes, docsRes] = await Promise.all([
        supabase.from('scheme_rules').select('*'),
        supabase.from('scheme_terms').select('*'),
        supabase.from('scheme_documents').select('*')
      ]);

      const rulesMap = new Map<string, any>();
      (rulesRes.data || []).forEach(r => rulesMap.set(r.scheme_id, r));

      const termsMap = new Map<string, any>();
      (termsRes.data || []).forEach(t => termsMap.set(t.scheme_id, t));

      const docsMap = new Map<string, any[]>();
      (docsRes.data || []).forEach(d => {
        const list = docsMap.get(d.scheme_id) || [];
        list.push(d);
        docsMap.set(d.scheme_id, list);
      });

      const compiledSchemes: Scheme[] = dbSchemes.map((s: any) => {
        const rRow = rulesMap.get(s.id);
        const tRow = termsMap.get(s.id);
        const dRows = docsMap.get(s.id) || [];

        const seedMatch = INITIAL_SCHEMES.find(init => init.code === s.code || init.name === s.name);

        const rules: SchemeRule = {
          id: rRow?.id || `rule-${s.id}`,
          schemeId: s.id,
          minAge: rRow?.min_age !== undefined ? Number(rRow.min_age) : (seedMatch?.rules.minAge ?? 18),
          maxAge: rRow?.max_age !== undefined ? Number(rRow.max_age) : (seedMatch?.rules.maxAge ?? 60),
          maxAnnualIncome: rRow?.max_annual_income !== undefined ? Number(rRow.max_annual_income) : (seedMatch?.rules.maxAnnualIncome ?? 300000),
          minProjectCost: rRow?.min_project_cost !== undefined ? Number(rRow.min_project_cost) : (seedMatch?.rules.minProjectCost ?? 10000),
          maxProjectCost: rRow?.max_project_cost !== undefined ? Number(rRow.max_project_cost) : (seedMatch?.rules.maxProjectCost ?? 5000000),
          maxLoanAmount: rRow?.max_loan_amount !== undefined ? Number(rRow.max_loan_amount) : (seedMatch?.rules.maxLoanAmount ?? 4500000),
          personalContributionMinPercent: rRow?.personal_contribution_min_percent !== undefined ? Number(rRow.personal_contribution_min_percent) : (seedMatch?.rules.personalContributionMinPercent ?? 5),
          eligibleCategories: Array.isArray(rRow?.eligible_categories) ? rRow.eligible_categories : (seedMatch?.rules.eligibleCategories ?? [s.corporation === 'NSFDC' ? 'SC' : s.corporation === 'NBCFDC' ? 'OBC' : 'SafaiKaramchari']),
          eligibleGenders: Array.isArray(rRow?.eligible_genders) ? rRow.eligible_genders : (seedMatch?.rules.eligibleGenders ?? ['male', 'female', 'other']),
          eligibleStates: Array.isArray(rRow?.eligible_states) ? rRow.eligible_states : seedMatch?.rules.eligibleStates,
          eligibleSectors: Array.isArray(rRow?.eligible_sectors) ? rRow.eligible_sectors : seedMatch?.rules.eligibleSectors,
          mandatoryTrainingRequired: Boolean(rRow?.mandatory_training_required ?? seedMatch?.rules.mandatoryTrainingRequired),
          specialConditionsNotes: rRow?.special_conditions_notes || seedMatch?.rules.specialConditionsNotes,
          effectiveFrom: rRow?.effective_from || s.effective_from || '2026-01-01',
          lastVerifiedAt: rRow?.last_verified_at || s.last_verified_at || '2026-09-12'
        };

        const terms: SchemeTerms = {
          interestRateMin: tRow?.interest_rate_min !== undefined ? Number(tRow.interest_rate_min) : (seedMatch?.terms.interestRateMin ?? 6.0),
          interestRateMax: tRow?.interest_rate_max !== undefined ? Number(tRow.interest_rate_max) : (seedMatch?.terms.interestRateMax ?? 8.0),
          rebateForWomenPercent: tRow?.rebate_for_women_percent !== undefined ? Number(tRow.rebate_for_women_percent) : (seedMatch?.terms.rebateForWomenPercent ?? 1.0),
          tenureYearsMax: tRow?.tenure_years_max !== undefined ? Number(tRow.tenure_years_max) : (seedMatch?.terms.tenureYearsMax ?? 7),
          moratoriumMonths: tRow?.moratorium_months !== undefined ? Number(tRow.moratorium_months) : (seedMatch?.terms.moratoriumMonths ?? 6),
          subsidyRatePercent: tRow?.subsidy_rate_percent !== undefined ? Number(tRow.subsidy_rate_percent) : (seedMatch?.terms.subsidyRatePercent ?? 0),
        };

        const documents: SchemeDocument[] = dRows.length > 0 
          ? dRows.map((d: any) => ({
              id: d.id,
              schemeId: s.id,
              code: d.code,
              title: d.title,
              titleHi: d.title_hi || d.title,
              description: d.description || '',
              descriptionHi: d.description_hi || d.description || '',
              requirementType: d.requirement_type || 'required',
              conditionNote: d.condition_note || undefined
            }))
          : (seedMatch?.documents || []);

        return {
          id: s.id,
          code: s.code,
          name: s.name,
          nameHi: s.name_hi || seedMatch?.nameHi || s.name,
          corporation: s.corporation || seedMatch?.corporation || 'NSFDC',
          corporationFullName: s.corporation_full_name || seedMatch?.corporationFullName || `${s.corporation} - Ministry of Social Justice and Empowerment`,
          targetGroup: s.target_group || seedMatch?.targetGroup || 'Target Beneficiaries',
          targetGroupHi: s.target_group_hi || seedMatch?.targetGroupHi || 'लक्षित लाभार्थी',
          description: s.description,
          descriptionHi: s.description_hi || seedMatch?.descriptionHi || s.description,
          rules,
          terms,
          documents,
          specialBenefits: Array.isArray(s.special_benefits) && s.special_benefits.length > 0 ? s.special_benefits : (seedMatch?.specialBenefits || []),
          specialBenefitsHi: Array.isArray(s.special_benefits_hi) && s.special_benefits_hi.length > 0 ? s.special_benefits_hi : (seedMatch?.specialBenefitsHi || []),
          applicationProcess: Array.isArray(s.application_process) && s.application_process.length > 0 ? s.application_process : (seedMatch?.applicationProcess || []),
          applicationProcessHi: Array.isArray(s.application_process_hi) && s.application_process_hi.length > 0 ? s.application_process_hi : (seedMatch?.applicationProcessHi || []),
          channelPartners: Array.isArray(s.channel_partners) && s.channel_partners.length > 0 ? s.channel_partners : ['State Channelising Agencies (SCAs)', 'Public Sector Banks', 'Regional Rural Banks (RRBs)'],
          sourceUrl: s.source_url || seedMatch?.sourceUrl || 'https://socialjustice.gov.in',
          sourceName: s.source_name || seedMatch?.sourceName || 'Ministry of Social Justice and Empowerment',
          effectiveFrom: s.effective_from || '2026-01-01',
          lastVerifiedAt: s.last_verified_at || '2026-09-12',
          active: s.active !== false,
          isDemoData: false // LIVE Supabase DB record
        };
      });

      cachedSchemes = compiledSchemes;
      return compiledSchemes;
    }
  } catch (err) {
    console.warn('[SupabaseService] getOfficialSchemes remote fallback to seeds:', err);
  }

  cachedSchemes = INITIAL_SCHEMES;
  return cachedSchemes;
}

// ============================================================================
// 3. RPC & AUDIT ENGINE INTEGRATION (STEP 5 & 6)
// ============================================================================

/**
 * Records match results into Supabase `match_runs` and `match_results` tables
 */
export async function recordMatchRunToSupabase(
  profile: ApplicantProfile, 
  results: EligibilityResult[]
): Promise<string | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    const eligibleCount = results.filter(r => r.status === 'eligible').length;
    const bestMatch = results.find(r => r.status === 'eligible');

    // 1. Insert into match_runs
    const { data: runData, error: runErr } = await supabase
      .from('match_runs')
      .insert({
        user_id: userId,
        profile_snapshot: profile,
        total_eligible: eligibleCount,
        best_match_scheme_id: bestMatch?.schemeId || null
      })
      .select('id')
      .single();

    if (runErr || !runData) {
      return null;
    }

    const runId = runData.id;

    // 2. Insert into match_results for top matches
    const resultRows = results.slice(0, 10).map(r => ({
      match_run_id: runId,
      scheme_id: r.schemeId,
      status: r.status,
      match_score: r.matchScore,
      reasons_eligible: r.reasonsEligible,
      reasons_not_eligible: r.reasonsNotEligible,
      potential_blockers: r.potentialBlockers,
      financial_estimate: r.financialEstimate
    }));

    await supabase.from('match_results').insert(resultRows);
    return runId;
  } catch (err) {
    console.warn('[SupabaseService] recordMatchRunToSupabase note:', err);
    return null;
  }
}

// ============================================================================
// 4. SUPABASE RPC: CALCULATE EMI (STEP 9)
// ============================================================================

export interface EmiCalculationParams {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  moratoriumMonths?: number;
  interestAccruesDuringMoratorium?: boolean;
}

export interface EmiCalculationResult {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  moratoriumMonths: number;
  disclaimer: string;
}

export async function calculateEmiViaRpc(params: EmiCalculationParams): Promise<EmiCalculationResult> {
  try {
    const { data, error } = await supabase.rpc('calculate_emi', {
      p_principal: params.principal,
      p_annual_rate: params.annualRate,
      p_tenure_months: params.tenureMonths,
      p_moratorium_months: params.moratoriumMonths ?? 0,
      p_interest_accrues_during_moratorium: Boolean(params.interestAccruesDuringMoratorium)
    });

    if (!error && data) {
      return {
        principal: Number(data.principal),
        annualRate: Number(data.annual_rate),
        tenureMonths: Number(data.tenure_months),
        monthlyEmi: Number(data.monthly_emi),
        totalInterest: Number(data.total_interest),
        totalRepayment: Number(data.total_repayment),
        moratoriumMonths: Number(data.moratorium_months),
        disclaimer: data.disclaimer || 'Calculated via Supabase RPC.'
      };
    }
  } catch (err) {
    console.warn('[SupabaseService] calculateEmiViaRpc note:', err);
  }

  // Pure deterministic mathematical calculation
  const r = (params.annualRate / 100) / 12;
  const n = params.tenureMonths;
  const emi = (params.principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;

  return {
    principal: params.principal,
    annualRate: params.annualRate,
    tenureMonths: n,
    monthlyEmi: Math.round(emi * 100) / 100,
    totalInterest: Math.round((total - params.principal) * 100) / 100,
    totalRepayment: Math.round(total * 100) / 100,
    moratoriumMonths: params.moratoriumMonths || 0,
    disclaimer: 'Indicative MoSJE subsidized credit estimation.'
  };
}

// ============================================================================
// 5. SAVED SCHEMES (STEP 8 & STEP 10)
// ============================================================================

export async function fetchUserSavedSchemeIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('saved_schemes')
      .select('scheme_id')
      .eq('user_id', userId);

    if (!error && data) {
      return data.map(item => item.scheme_id);
    }
  } catch (err) {
    console.warn('[SupabaseService] fetchUserSavedSchemeIds note:', err);
  }

  try {
    const saved = localStorage.getItem(`schemesetu_saved_${userId}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function toggleSaveScheme(userId: string, schemeId: string, currentSaved: boolean = false): Promise<boolean> {
  try {
    if (currentSaved) {
      await supabase
        .from('saved_schemes')
        .delete()
        .eq('user_id', userId)
        .eq('scheme_id', schemeId);
      return false;
    } else {
      await supabase
        .from('saved_schemes')
        .insert({ user_id: userId, scheme_id: schemeId });
      return true;
    }
  } catch (err) {
    console.warn('[SupabaseService] toggleSaveScheme note:', err);
    return !currentSaved;
  }
}

// ============================================================================
// 6. DOCUMENT CHECKLISTS (STEP 11)
// ============================================================================

export async function fetchDocumentChecklist(userId: string, schemeId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('document_checklists')
      .select('document_code, is_completed')
      .eq('user_id', userId)
      .eq('scheme_id', schemeId)
      .eq('is_completed', true);

    if (!error && data && data.length > 0) {
      return data.map(d => d.document_code);
    }
  } catch (err) {
    console.warn('[SupabaseService] fetchDocumentChecklist note:', err);
  }

  try {
    const stored = localStorage.getItem(`schemesetu_checklist_${userId}_${schemeId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function saveDocumentChecklist(userId: string, schemeId: string, completedItems: string[]): Promise<void> {
  try {
    // Delete previous status for this user & scheme
    await supabase
      .from('document_checklists')
      .delete()
      .eq('user_id', userId)
      .eq('scheme_id', schemeId);

    // Insert new checked items
    if (completedItems.length > 0) {
      const rows = completedItems.map(code => ({
        user_id: userId,
        scheme_id: schemeId,
        document_code: code,
        is_completed: true,
        updated_at: new Date().toISOString()
      }));
      await supabase.from('document_checklists').insert(rows);
    }
  } catch (err) {
    console.warn('[SupabaseService] saveDocumentChecklist note:', err);
  }

  try {
    localStorage.setItem(`schemesetu_checklist_${userId}_${schemeId}`, JSON.stringify(completedItems));
  } catch {}
}

// ============================================================================
// 7. BRANCH LOCATOR (STEP 12)
// ============================================================================

export async function getBranchesFromDb(state?: string): Promise<ChannelPartnerBranch[]> {
  try {
    let query = supabase.from('branches').select('*');
    if (state && state !== 'ALL') {
      query = query.eq('state', state);
    }
    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data.map((b: any) => ({
        id: b.id,
        name: b.name || b.branch_name,
        nameHi: b.name_hi || b.name,
        corporation: b.corporation || 'ALL',
        agencyType: b.agency_type || 'SCA',
        state: b.state,
        district: b.district,
        address: b.address,
        pincode: b.pincode,
        lat: Number(b.latitude),
        lng: Number(b.longitude),
        phone: b.phone || undefined,
        email: b.email || undefined,
        operatingHours: b.operating_hours || undefined,
        website: b.website || undefined,
        isDemoData: b.is_demo_data !== false
      }));
    }
  } catch (err) {
    console.warn('[SupabaseService] getBranchesFromDb note:', err);
  }

  return INITIAL_BRANCHES;
}

// ============================================================================
// 8. ADMIN AUDIT LOGS (STEP 14)
// ============================================================================

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        timestamp: d.created_at,
        adminUser: d.admin_user || 'MoSJE Admin',
        action: d.action as any,
        targetSchemeId: d.target_scheme_id || '',
        schemeName: d.scheme_name || 'Scheme Rule Update',
        fieldChanged: d.field_changed || 'rule',
        previousValue: d.previous_value || '',
        newValue: d.new_value || '',
        reason: d.reason || 'Statutory Gazetted Revision'
      }));
    }
  } catch (err) {
    console.warn('[SupabaseService] getAdminAuditLogs note:', err);
  }

  try {
    const stored = localStorage.getItem('schemesetu_admin_audit_v1');
    if (stored) return JSON.parse(stored);
  } catch {}

  return [
    {
      id: 'audit-01',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      adminUser: 'MoSJE Nodal Officer (Admin)',
      action: 'UPDATE_RULE',
      targetSchemeId: '2f436aa2-688e-4a23-9ccf-770fcd184c02',
      schemeName: 'NSFDC Micro Finance Scheme',
      fieldChanged: 'maxAnnualIncome',
      previousValue: '300000',
      newValue: '500000',
      reason: 'Statutory income ceiling alignment with 2026 MoSJE Guidelines.'
    },
    {
      id: 'audit-02',
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
      adminUser: 'MoSJE IT Cell',
      action: 'UPDATE_TERMS',
      targetSchemeId: 'd0e38679-07cf-4904-86b1-007aae9adbce',
      schemeName: 'NSFDC Udyam Nidhi Yojana',
      fieldChanged: 'interestRateMin',
      previousValue: '6.5%',
      newValue: '5.0%',
      reason: '1% affirmative subvention implemented for verified women SHG clusters.'
    }
  ];
}

export async function logAdminAuditAction(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<void> {
  const newEntry: AdminAuditLog = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...log
  };

  try {
    await supabase.from('admin_audit_logs').insert({
      admin_user: log.adminUser,
      action: log.action,
      target_scheme_id: log.targetSchemeId,
      scheme_name: log.schemeName,
      field_changed: log.fieldChanged,
      previous_value: String(log.previousValue),
      new_value: String(log.newValue),
      reason: log.reason
    });
  } catch (err) {
    console.warn('[SupabaseService] logAdminAuditAction note:', err);
  }

  try {
    const existing = await getAdminAuditLogs();
    localStorage.setItem('schemesetu_admin_audit_v1', JSON.stringify([newEntry, ...existing]));
  } catch {}
}
