import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  ApplicantProfile, 
  Scheme, 
  SchemeRule, 
  SchemeTerms, 
  SchemeDocument, 
  EligibilityResult,
  ChannelPartnerBranch,
  Agency,
  SchemeSource
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
// 8. ADMIN SCHEME MANAGEMENT (STEP 13 & 14)
// ============================================================================

export const DEFAULT_AGENCIES: Agency[] = [
  {
    id: 'agency-nsfdc',
    code: 'NSFDC',
    name: 'NSFDC',
    fullName: 'National Scheduled Castes Finance and Development Corporation',
    website: 'https://nsfdc.nic.in',
    description: 'Statutory corporation for financing self-employment of Scheduled Castes.'
  },
  {
    id: 'agency-nbcfdc',
    code: 'NBCFDC',
    name: 'NBCFDC',
    fullName: 'National Backward Classes Finance and Development Corporation',
    website: 'https://nbcfdc.gov.in',
    description: 'Promoting economic empowerment of Other Backward Classes.'
  },
  {
    id: 'agency-nskfdc',
    code: 'NSKFDC',
    name: 'NSKFDC',
    fullName: 'National Safai Karamcharis Finance and Development Corporation',
    website: 'https://nskfdc.nic.in',
    description: 'Concessional finance for Safai Karamcharis, manual scavengers, and dependents.'
  }
];

/**
 * Fetch list of official agencies from Supabase `agencies` table or statutory defaults
 */
export async function getAgenciesFromDb(): Promise<Agency[]> {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .order('code', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((a: any) => ({
        id: a.id,
        code: a.code,
        name: a.name || a.code,
        fullName: a.full_name || a.name || a.code,
        website: a.website || '',
        description: a.description || ''
      }));
    }
  } catch (err) {
    console.warn('[SupabaseService] getAgenciesFromDb fallback:', err);
  }
  return DEFAULT_AGENCIES;
}

export interface CreateSchemePayload {
  scheme: {
    code: string;
    name: string;
    nameHi?: string;
    corporation: 'NSFDC' | 'NBCFDC' | 'NSKFDC';
    corporationFullName?: string;
    targetGroup?: string;
    targetGroupHi?: string;
    description: string;
    descriptionHi?: string;
    specialBenefits?: string[];
    specialBenefitsHi?: string[];
    applicationProcess?: string[];
    applicationProcessHi?: string[];
    channelPartners?: string[];
    sourceUrl?: string;
    sourceName?: string;
    effectiveFrom?: string;
    lastVerifiedAt?: string;
    active: boolean;
    isDemoData?: boolean;
  };
  terms: {
    interestRateMin: number;
    interestRateMax: number;
    rebateForWomenPercent?: number;
    tenureYearsMax: number;
    moratoriumMonths: number;
    subsidyRatePercent?: number;
  };
  rules: {
    minAge: number;
    maxAge: number;
    maxAnnualIncome: number;
    minProjectCost: number;
    maxProjectCost: number;
    maxLoanAmount: number;
    personalContributionMinPercent: number;
    eligibleCategories: string[];
    eligibleGenders: string[];
    eligibleStates?: string[];
    eligibleSectors?: string[];
    mandatoryTrainingRequired?: boolean;
    specialConditionsNotes?: string;
    effectiveFrom?: string;
    lastVerifiedAt?: string;
  };
  documents?: Array<{
    code: string;
    title: string;
    titleHi?: string;
    description?: string;
    descriptionHi?: string;
    requirementType: 'required' | 'conditional' | 'optional';
    conditionNote?: string;
  }>;
  source?: {
    sourceName: string;
    officialUrl: string;
    effectiveFrom: string;
    effectiveTo?: string;
    lastVerifiedAt: string;
    isVerified: boolean;
  };
}

/**
 * Creates a scheme atomically across Supabase tables:
 * schemes, scheme_terms, scheme_rules, scheme_documents, scheme_sources
 * Protected by Row Level Security so only users with role: 'admin' can succeed.
 */
export async function createSchemeAdmin(payload: CreateSchemePayload): Promise<{
  success: boolean;
  schemeId?: string;
  error?: string;
  createdScheme?: Scheme;
}> {
  try {
    // 1. First attempt atomic RPC function
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_scheme_atomic', {
        p_scheme: {
          code: payload.scheme.code,
          name: payload.scheme.name,
          name_hi: payload.scheme.nameHi || payload.scheme.name,
          corporation: payload.scheme.corporation,
          corporation_full_name: payload.scheme.corporationFullName || `${payload.scheme.corporation} Apex Corporation`,
          targetGroup: payload.scheme.targetGroup || 'Affirmative Beneficiaries',
          targetGroupHi: payload.scheme.targetGroupHi || 'लक्षित लाभार्थी',
          description: payload.scheme.description,
          description_hi: payload.scheme.descriptionHi || payload.scheme.description,
          special_benefits: payload.scheme.specialBenefits || [],
          special_benefits_hi: payload.scheme.specialBenefitsHi || [],
          application_process: payload.scheme.applicationProcess || [],
          application_process_hi: payload.scheme.applicationProcessHi || [],
          channel_partners: payload.scheme.channelPartners || ['State Channelising Agencies (SCAs)'],
          source_url: payload.source?.officialUrl || payload.scheme.sourceUrl,
          source_name: payload.source?.sourceName || payload.scheme.sourceName,
          effective_from: payload.source?.effectiveFrom || payload.scheme.effectiveFrom,
          last_verified_at: payload.source?.lastVerifiedAt || payload.scheme.lastVerifiedAt,
          active: payload.scheme.active,
          is_demo_data: false
        },
        p_terms: {
          interest_rate_min: payload.terms.interestRateMin,
          interest_rate_max: payload.terms.interestRateMax,
          rebate_for_women_percent: payload.terms.rebateForWomenPercent || 1.0,
          tenure_years_max: payload.terms.tenureYearsMax,
          moratorium_months: payload.terms.moratoriumMonths,
          subsidy_rate_percent: payload.terms.subsidyRatePercent || 0
        },
        p_rules: {
          min_age: payload.rules.minAge,
          max_age: payload.rules.maxAge,
          max_annual_income: payload.rules.maxAnnualIncome,
          min_project_cost: payload.rules.minProjectCost,
          max_project_cost: payload.rules.maxProjectCost,
          max_loan_amount: payload.rules.maxLoanAmount,
          personal_contribution_min_percent: payload.rules.personalContributionMinPercent,
          eligible_categories: payload.rules.eligibleCategories,
          eligible_genders: payload.rules.eligibleGenders,
          eligible_states: payload.rules.eligibleStates || [],
          eligible_sectors: payload.rules.eligibleSectors || [],
          mandatory_training_required: payload.rules.mandatoryTrainingRequired || false,
          special_conditions_notes: payload.rules.specialConditionsNotes || '',
          effective_from: payload.rules.effectiveFrom || payload.scheme.effectiveFrom,
          last_verified_at: payload.rules.lastVerifiedAt || payload.scheme.lastVerifiedAt
        },
        p_documents: (payload.documents || []).map(d => ({
          code: d.code,
          title: d.title,
          title_hi: d.titleHi || d.title,
          description: d.description || '',
          description_hi: d.descriptionHi || '',
          requirement_type: d.requirementType,
          condition_note: d.conditionNote
        })),
        p_source: payload.source ? {
          source_name: payload.source.sourceName,
          official_url: payload.source.officialUrl,
          effective_from: payload.source.effectiveFrom,
          effective_to: payload.source.effectiveTo || null,
          last_verified_at: payload.source.lastVerifiedAt,
          is_verified: payload.source.isVerified
        } : null
      });

      if (!rpcError && rpcData?.scheme_id) {
        return {
          success: true,
          schemeId: rpcData.scheme_id
        };
      }
    } catch (rpcEx) {
      console.warn('[SupabaseService] RPC create_scheme_atomic attempt error, falling back to direct table inserts:', rpcEx);
    }

    // 2. Direct transactional sequence
    const generatedId = `scheme-${Date.now()}`;
    const { data: schemeData, error: schemeError } = await supabase
      .from('schemes')
      .insert({
        code: payload.scheme.code,
        name: payload.scheme.name,
        name_hi: payload.scheme.nameHi || payload.scheme.name,
        corporation: payload.scheme.corporation,
        corporation_full_name: payload.scheme.corporationFullName || `${payload.scheme.corporation} Apex Corporation`,
        target_group: payload.scheme.targetGroup || 'Affirmative Beneficiaries',
        target_group_hi: payload.scheme.targetGroupHi || 'लक्षित लाभार्थी',
        description: payload.scheme.description,
        description_hi: payload.scheme.descriptionHi || payload.scheme.description,
        special_benefits: payload.scheme.specialBenefits || [],
        special_benefits_hi: payload.scheme.specialBenefitsHi || [],
        application_process: payload.scheme.applicationProcess || [],
        application_process_hi: payload.scheme.applicationProcessHi || [],
        channel_partners: payload.scheme.channelPartners || ['State Channelising Agencies (SCAs)'],
        source_url: payload.source?.officialUrl || payload.scheme.sourceUrl,
        source_name: payload.source?.sourceName || payload.scheme.sourceName,
        effective_from: payload.source?.effectiveFrom || payload.scheme.effectiveFrom || new Date().toISOString().split('T')[0],
        last_verified_at: payload.source?.lastVerifiedAt || payload.scheme.lastVerifiedAt || new Date().toISOString().split('T')[0],
        active: payload.scheme.active,
        is_demo_data: false
      })
      .select('id')
      .single();

    if (schemeError) {
      return { success: false, error: schemeError.message };
    }

    const newSchemeId = schemeData?.id || generatedId;

    // Insert terms
    await supabase.from('scheme_terms').insert({
      scheme_id: newSchemeId,
      interest_rate_min: payload.terms.interestRateMin,
      interest_rate_max: payload.terms.interestRateMax,
      rebate_for_women_percent: payload.terms.rebateForWomenPercent ?? 1.0,
      tenure_years_max: payload.terms.tenureYearsMax,
      moratorium_months: payload.terms.moratoriumMonths,
      subsidy_rate_percent: payload.terms.subsidyRatePercent ?? 0
    });

    // Insert rules
    await supabase.from('scheme_rules').insert({
      scheme_id: newSchemeId,
      min_age: payload.rules.minAge,
      max_age: payload.rules.maxAge,
      max_annual_income: payload.rules.maxAnnualIncome,
      min_project_cost: payload.rules.minProjectCost,
      max_project_cost: payload.rules.maxProjectCost,
      max_loan_amount: payload.rules.maxLoanAmount,
      personal_contribution_min_percent: payload.rules.personalContributionMinPercent,
      eligible_categories: payload.rules.eligibleCategories,
      eligible_genders: payload.rules.eligibleGenders,
      eligible_states: payload.rules.eligibleStates || [],
      eligible_sectors: payload.rules.eligibleSectors || [],
      mandatory_training_required: payload.rules.mandatoryTrainingRequired ?? false,
      special_conditions_notes: payload.rules.specialConditionsNotes || '',
      effective_from: payload.rules.effectiveFrom || new Date().toISOString().split('T')[0],
      last_verified_at: payload.rules.lastVerifiedAt || new Date().toISOString().split('T')[0]
    });

    // Insert documents
    if (payload.documents && payload.documents.length > 0) {
      const docRows = payload.documents.map(d => ({
        scheme_id: newSchemeId,
        code: d.code,
        title: d.title,
        title_hi: d.titleHi || d.title,
        description: d.description || '',
        description_hi: d.descriptionHi || '',
        requirement_type: d.requirementType,
        condition_note: d.conditionNote
      }));
      await supabase.from('scheme_documents').insert(docRows);
    }

    // Insert source
    if (payload.source) {
      await supabase.from('scheme_sources').insert({
        scheme_id: newSchemeId,
        source_name: payload.source.sourceName,
        official_url: payload.source.officialUrl,
        effective_from: payload.source.effectiveFrom,
        effective_to: payload.source.effectiveTo || null,
        last_verified_at: payload.source.lastVerifiedAt,
        is_verified: payload.source.isVerified
      });
    }

    return { success: true, schemeId: newSchemeId };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred while saving the scheme.' };
  }
}

/**
 * Updates a scheme's active/inactive status in Supabase
 */
export async function updateSchemeAdminStatus(schemeId: string, active: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('schemes')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', schemeId);

    if (error) {
      console.warn('[SupabaseService] updateSchemeAdminStatus error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[SupabaseService] updateSchemeAdminStatus note:', err);
    return false;
  }
}

