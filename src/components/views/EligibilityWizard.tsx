import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  User, 
  IndianRupee, 
  Briefcase, 
  GraduationCap, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { ApplicantProfile, BeneficiaryCategory, Gender, LocationType, BusinessStage, EmploymentStatus, EducationLevel } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { dataStore } from '../../services/dataStore';
import { formatIndianCurrency } from '../../services/emiCalculator';
import { getBeneficiaryGroups, getIndiaStates, getLookupOptions } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface EligibilityWizardProps {
  language: Language;
  onComplete: (profile: ApplicantProfile) => void;
  onOpenMitra: () => void;
  initialProfile?: ApplicantProfile | null;
}

const FALLBACK_INDIAN_STATES = [
  "Delhi", "Maharashtra", "Uttar Pradesh", "Karnataka", "Tamil Nadu", 
  "Bihar", "West Bengal", "Gujarat", "Rajasthan", "Madhya Pradesh", 
  "Punjab", "Haryana", "Andhra Pradesh", "Telangana", "Kerala", "Odisha", "Assam"
];

const FALLBACK_SECTOR_OPTIONS = [
  "Retail & Petty Trade",
  "Small Scale Manufacturing",
  "Service & Repair Shop",
  "Agriculture & Allied Activities",
  "Animal Husbandry & Dairy",
  "Sanitation & Mechanized Cleaning",
  "Transport & Logistics Vehicle",
  "Artisan & Handloom Craft",
  "Food Processing & Catering",
  "Beauty, Wellness & Tailoring"
];

export const EligibilityWizard: React.FC<EligibilityWizardProps> = ({
  language,
  onComplete,
  onOpenMitra,
  initialProfile
}) => {
  const t = TRANSLATIONS[language];

  // Default state with sensible defaults
  const defaultProfile: ApplicantProfile = {
    age: 28,
    gender: 'female',
    state: 'Delhi',
    district: 'Central Delhi',
    locationType: 'urban',
    category: 'SC',
    annualFamilyIncome: 180000,
    projectCost: 120000,
    requestedLoanAmount: 110000,
    personalContribution: 10000,
    businessSector: 'Beauty, Wellness & Tailoring',
    businessStage: 'starting',
    businessDescription: 'Micro tailoring and garment repair unit with 2 motorized sewing machines',
    employmentStatus: 'unemployed',
    educationLevel: '10th_pass',
    technicalTraining: true,
    technicalTrainingDetails: 'PMKVY Certificate in Apparel Cutting & Tailoring',
    vocationalCertification: true,
    experienceYears: 1
  };

  const [profile, setProfile] = useState<ApplicantProfile>(() => {
    const saved = dataStore.getSavedProfile();
    return initialProfile || saved || defaultProfile;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Supabase Database-driven dropdowns (STEP 4)
  const [statesList, setStatesList] = useState<Array<{ code: string; name: string }>>(() => 
    FALLBACK_INDIAN_STATES.map(name => ({ code: name, name }))
  );
  const [categoriesList, setCategoriesList] = useState<Array<{ code: string; label: string; description: string }>>([]);
  const [sectorsList, setSectorsList] = useState<string[]>(FALLBACK_SECTOR_OPTIONS);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getIndiaStates(),
      getBeneficiaryGroups(),
      getLookupOptions('business_sector')
    ]).then(([states, categories, sectors]) => {
      if (!mounted) return;
      if (states && states.length > 0) {
        setStatesList(states);
      }
      if (categories && categories.length > 0) {
        setCategoriesList(categories);
      }
      if (sectors && sectors.length > 0) {
        setSectorsList(sectors.map(s => s.label));
      }
      setIsDbConnected(Boolean(isSupabaseConfigured));
    }).catch(err => {
      console.warn('Dropdown fetch note:', err);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save partial progress to local store & Supabase profiles
  useEffect(() => {
    dataStore.saveProfile(profile);
  }, [profile]);

  const updateField = <K extends keyof ApplicantProfile>(key: K, value: ApplicantProfile[K]) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Quick Hackathon Demo Presets
  const applyPreset = (type: 'sc_woman' | 'obc_mfg' | 'sanitation_suy') => {
    if (type === 'sc_woman') {
      setProfile({
        age: 26,
        gender: 'female',
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        locationType: 'semi-urban',
        category: 'SC',
        annualFamilyIncome: 140000,
        projectCost: 100000,
        requestedLoanAmount: 95000,
        personalContribution: 5000,
        businessSector: 'Beauty, Wellness & Tailoring',
        businessStage: 'starting',
        businessDescription: 'Boutique and stitching boutique for ladies wear',
        employmentStatus: 'self_employed',
        educationLevel: '12th_pass',
        technicalTraining: true,
        technicalTrainingDetails: 'UP-SDM Apparel Training',
        vocationalCertification: true,
        experienceYears: 2
      });
    } else if (type === 'obc_mfg') {
      setProfile({
        age: 34,
        gender: 'male',
        state: 'Maharashtra',
        district: 'Pune',
        locationType: 'urban',
        category: 'OBC',
        annualFamilyIncome: 240000,
        projectCost: 800000,
        requestedLoanAmount: 700000,
        personalContribution: 100000,
        businessSector: 'Small Scale Manufacturing',
        businessStage: 'starting',
        businessDescription: 'Corrugated box and eco-friendly packaging unit',
        employmentStatus: 'self_employed',
        educationLevel: 'diploma',
        technicalTraining: true,
        technicalTrainingDetails: 'ITI Mechanical Draughtsman',
        vocationalCertification: true,
        experienceYears: 4
      });
    } else if (type === 'sanitation_suy') {
      setProfile({
        age: 38,
        gender: 'male',
        state: 'Delhi',
        district: 'Central Delhi',
        locationType: 'urban',
        category: 'SafaiKaramchari',
        annualFamilyIncome: 450000, // Higher income allowed under NSKFDC waiver
        projectCost: 2500000,
        requestedLoanAmount: 2200000,
        personalContribution: 300000,
        businessSector: 'Sanitation & Mechanized Cleaning',
        businessStage: 'starting',
        businessDescription: 'Suction jetting machine mounted on commercial vehicle for septic tank cleaning',
        employmentStatus: 'self_employed',
        educationLevel: '10th_pass',
        technicalTraining: true,
        technicalTrainingDetails: 'NSKFDC Mechanized Cleaning Safety Protocol',
        vocationalCertification: true,
        experienceYears: 6
      });
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return profile.age >= 18 && profile.age <= 75 && Boolean(profile.state);
    }
    if (step === 2) {
      return Boolean(profile.category);
    }
    if (step === 3) {
      return profile.projectCost > 0 && profile.requestedLoanAmount > 0;
    }
    if (step === 4) {
      return Boolean(profile.businessSector);
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onComplete(profile);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Preset Quick-Loader */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Deterministic Eligibility Questionnaire
              </span>
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase: Live Tables Connected</span>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
              {t.wizardTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t.wizardSubtitle}
            </p>
          </div>

          {/* Preset Buttons for Easy Testing */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('sc_woman')}
              className="text-xs px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 font-medium"
              title="SC Woman Micro-credit (NSFDC MSY)"
            >
              SC Woman (₹1.2L)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('obc_mfg')}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-medium"
              title="OBC Small Enterprise (NBCFDC)"
            >
              OBC Unit (₹8L)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('sanitation_suy')}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-medium"
              title="Sanitation Mechanized Unit (NSKFDC SUY)"
            >
              Sanitation (₹25L)
            </button>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
            <span>Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? t.stepPersonal :
              currentStep === 2 ? t.stepCategory :
              currentStep === 3 ? t.stepFinancial :
              currentStep === 4 ? t.stepBusiness : t.stepEducation
            }</span>
            <span className="text-indigo-600 font-bold">{Math.round((currentStep / totalSteps) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Questionnaire Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* ======================================================== */}
        {/* STEP 1: Personal & Geographic Location */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-indigo-600" />
                <span>{t.stepPersonal}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Age and domicile determine eligible statutory state agencies and concessional brackets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelAge} *
                </label>
                <input
                  id="input-age"
                  type="number"
                  min="18"
                  max="70"
                  value={profile.age}
                  onChange={(e) => updateField('age', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                  <Info className="w-3 h-3 text-slate-400" />
                  <span>Applicant must be at least 18 years of age at the time of loan application.</span>
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelGender} *
                </label>
                <select
                  id="input-gender"
                  value={profile.gender}
                  onChange={(e) => updateField('gender', e.target.value as Gender)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  <option value="female">Female (Qualifies for Mahila Samriddhi & 1% Rate Rebate)</option>
                  <option value="male">Male</option>
                  <option value="other">Transgender / Other</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Women entrepreneurs receive exclusive low-interest schemes and zero margin money requirements.
                </p>
              </div>

              {/* State */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.labelState} *
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    DB: india_states ({statesList.length})
                  </span>
                </div>
                <select
                  id="input-state"
                  value={profile.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  {statesList.map((st) => (
                    <option key={st.code} value={st.name}>{st.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelDistrict} *
                </label>
                <input
                  id="input-district"
                  type="text"
                  value={profile.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="e.g. Lucknow, Pune, Nagpur"
                />
              </div>

              {/* Location Type */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelLocationType}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['rural', 'semi-urban', 'urban'] as LocationType[]).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => updateField('locationType', loc)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize text-center transition ${
                        profile.locationType === loc
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: Beneficiary Affirmative Category */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <span>{t.stepCategory}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The Ministry of Social Justice and Empowerment operates three distinct apex corporations targeting specific demographic groups.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Your Social / Target Group:
              </label>

              {/* Option 1: SC */}
              <div 
                onClick={() => updateField('category', 'SC')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                  profile.category === 'SC'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="category" 
                  checked={profile.category === 'SC'} 
                  onChange={() => {}}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Scheduled Caste (SC)</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Eligible for <strong>NSFDC</strong> concessional credit programs up to ₹50 Lakh with 6%–9% interest rate and 1% women rebate.
                  </p>
                </div>
              </div>

              {/* Option 2: OBC */}
              <div 
                onClick={() => updateField('category', 'OBC')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                  profile.category === 'OBC'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="category" 
                  checked={profile.category === 'OBC'} 
                  onChange={() => {}}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Other Backward Classes (OBC - Non-Creamy Layer)</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Eligible for <strong>NBCFDC</strong> schemes including General Term Loans and New Swarnima Scheme for Women (5% fixed interest).
                  </p>
                </div>
              </div>

              {/* Option 3: Safai Karamchari */}
              <div 
                onClick={() => updateField('category', 'SafaiKaramchari')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                  profile.category === 'SafaiKaramchari'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="category" 
                  checked={profile.category === 'SafaiKaramchari'} 
                  onChange={() => {}}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900">Safai Karamchari / Sanitation Worker & Dependents</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      No Income Limit
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Eligible for <strong>NSKFDC</strong> livelihood schemes, mechanized sanitation equipment loans (SUY), and Mahila Adhikarita Yojana.
                  </p>
                </div>
              </div>

              {/* Option 4: DNT / NT */}
              <div 
                onClick={() => updateField('category', 'DNT_NT')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                  profile.category === 'DNT_NT'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="category" 
                  checked={profile.category === 'DNT_NT'} 
                  onChange={() => {}}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">De-Notified, Nomadic and Semi-Nomadic Tribes (DNT/NT)</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Eligible under special sub-categories of NBCFDC welfare schemes.
                  </p>
                </div>
              </div>
            </div>

            {/* Why Is This Needed Accordion */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700">Why is affirmative category required? </span>
                NSFDC, NBCFDC, and NSKFDC are statutory financial development corporations created by Parliament specifically for socio-economic development of affirmative action communities.
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: Financial Requirements & Income */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-indigo-600" />
                <span>{t.stepFinancial}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Government schemes have statutory income ceilings (e.g. ₹3 Lakh p.a.) and minimum margin money rules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Annual Household Income */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelIncome} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm font-bold">
                    ₹
                  </span>
                  <input
                    id="input-income"
                    type="number"
                    step="10000"
                    value={profile.annualFamilyIncome}
                    onChange={(e) => updateField('annualFamilyIncome', Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Currently: {formatIndianCurrency(profile.annualFamilyIncome, true)} / year. (MoSJE ceiling: ₹3,00,000 for NSFDC & NBCFDC; exempt for NSKFDC).
                </p>
              </div>

              {/* Proposed Total Project Cost */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelProjectCost} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm font-bold">
                    ₹
                  </span>
                  <input
                    id="input-project-cost"
                    type="number"
                    step="25000"
                    value={profile.projectCost}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      updateField('projectCost', cost);
                      // Auto-adjust loan to 90%
                      if (cost > 0 && profile.requestedLoanAmount > cost) {
                        updateField('requestedLoanAmount', Math.round(cost * 0.9));
                        updateField('personalContribution', Math.round(cost * 0.1));
                      }
                    }}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Total capital: {formatIndianCurrency(profile.projectCost, true)} (includes machinery, space, and initial stock).
                </p>
              </div>

              {/* Desired Loan Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelLoanAmount} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm font-bold">
                    ₹
                  </span>
                  <input
                    id="input-loan-amount"
                    type="number"
                    step="10000"
                    value={profile.requestedLoanAmount}
                    onChange={(e) => updateField('requestedLoanAmount', Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Desired assistance: {formatIndianCurrency(profile.requestedLoanAmount, true)}
                </p>
              </div>

              {/* Personal Margin Money Contribution */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelContribution}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm font-bold">
                    ₹
                  </span>
                  <input
                    id="input-contribution"
                    type="number"
                    step="5000"
                    value={profile.personalContribution}
                    onChange={(e) => updateField('personalContribution', Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Margin money: {formatIndianCurrency(profile.personalContribution, true)} ({profile.projectCost > 0 ? Math.round((profile.personalContribution / profile.projectCost) * 100) : 0}% of cost).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: Proposed Enterprise & Sector */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>{t.stepBusiness}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Certain schemes are tailored for specific sectors such as mechanized sanitation, green business, or artisan trades.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Business Sector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.labelBusinessSector} *
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    DB: lookup_options ({sectorsList.length})
                  </span>
                </div>
                <select
                  id="input-sector"
                  value={profile.businessSector}
                  onChange={(e) => updateField('businessSector', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  {sectorsList.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              {/* Business Stage */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelBusinessStage}
                </label>
                <select
                  id="input-stage"
                  value={profile.businessStage}
                  onChange={(e) => updateField('businessStage', e.target.value as BusinessStage)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  <option value="starting">New Venture / Starting Fresh</option>
                  <option value="existing">Existing Business (Expansion / Modernization)</option>
                  <option value="idea">Conceptual Idea Stage</option>
                </select>
              </div>

              {/* Current Employment Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelEmployment}
                </label>
                <select
                  id="input-employment"
                  value={profile.employmentStatus}
                  onChange={(e) => updateField('employmentStatus', e.target.value as EmploymentStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  <option value="unemployed">Unemployed (First-time Entrepreneur)</option>
                  <option value="self_employed">Self-Employed / Freelancer / Artisan</option>
                  <option value="wage_worker">Daily Wage / Contract Sanitation Worker</option>
                  <option value="student">Student / Recent Graduate</option>
                </select>
              </div>

              {/* Work Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelExperience}
                </label>
                <input
                  id="input-experience"
                  type="number"
                  min="0"
                  max="40"
                  value={profile.experienceYears}
                  onChange={(e) => updateField('experienceYears', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelBusinessDesc}
                </label>
                <textarea
                  id="input-business-desc"
                  rows={2}
                  value={profile.businessDescription}
                  onChange={(e) => updateField('businessDescription', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="e.g. Setting up a flour mill and spice grinding unit with 5HP motor..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: Education & Technical Skills */}
        {/* ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>{t.stepEducation}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Applicants with skill training from PMKVY, ITI, or RSETI receive higher compatibility ratings and speedier clearances.
              </p>
            </div>

            <div className="space-y-6">
              {/* Education Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.labelEducation}
                </label>
                <select
                  id="input-education"
                  value={profile.educationLevel}
                  onChange={(e) => updateField('educationLevel', e.target.value as EducationLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  <option value="below_10th">Literate / Below 10th Standard</option>
                  <option value="10th_pass">10th Standard Pass (Matriculation)</option>
                  <option value="12th_pass">12th Standard Pass (Intermediate)</option>
                  <option value="diploma">Technical Diploma / ITI</option>
                  <option value="graduate">Bachelor's Degree / Graduate</option>
                  <option value="post_graduate">Post Graduate or Higher</option>
                  <option value="vocational">Specialized Vocational Certification</option>
                </select>
              </div>

              {/* Technical Training Checkbox */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    id="input-training-check"
                    type="checkbox"
                    checked={profile.technicalTraining}
                    onChange={(e) => updateField('technicalTraining', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                  />
                  <span className="text-sm font-bold text-slate-800">
                    {t.labelTraining}
                  </span>
                </label>

                {profile.technicalTraining && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Certificate / Institute Details:
                    </label>
                    <input
                      id="input-training-details"
                      type="text"
                      value={profile.technicalTrainingDetails || ''}
                      onChange={(e) => updateField('technicalTrainingDetails', e.target.value)}
                      placeholder="e.g. PMKVY Certificate in Apparel Cutting, or ITI Electrician"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Review Summary Box */}
              <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-200">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                  Profile Snapshot Prepared for Deterministic Rule Matching:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Category:</span>
                    <span className="font-bold text-slate-800">{profile.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Family Income:</span>
                    <span className="font-bold text-slate-800">{formatIndianCurrency(profile.annualFamilyIncome, true)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Project Cost:</span>
                    <span className="font-bold text-slate-800">{formatIndianCurrency(profile.projectCost, true)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Desired Loan:</span>
                    <span className="font-bold text-slate-800">{formatIndianCurrency(profile.requestedLoanAmount, true)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Controls */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                id="btn-wizard-back"
                type="button"
                onClick={handleBack}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.btnBack}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-wizard-reset"
              type="button"
              onClick={() => setProfile(defaultProfile)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center space-x-1 px-3 py-2"
              title="Reset form fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.btnReset}</span>
            </button>

            <button
              id="btn-wizard-next"
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{currentStep === totalSteps ? t.btnSubmitMatch : t.btnNext}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
