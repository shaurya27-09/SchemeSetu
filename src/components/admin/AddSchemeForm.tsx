import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Percent, 
  FileText, 
  HelpCircle,
  ShieldCheck,
  Calendar,
  Loader2
} from 'lucide-react';
import { 
  createSchemeAdmin, 
  getAgenciesFromDb, 
  CreateSchemePayload 
} from '../../services/supabaseService';
import { DataStore } from '../../services/dataStore';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { Agency, Scheme, SchemeRule, SchemeTerms, SchemeDocument, BeneficiaryCategory, Gender } from '../../types';

interface AddSchemeFormProps {
  language: Language;
  onBackToDashboard: () => void;
  onSchemeCreated?: (newScheme: Scheme) => void;
}

interface DocumentItem {
  code: string;
  title: string;
  titleHi: string;
  requirementType: 'required' | 'conditional' | 'optional';
  conditionNote?: string;
}

export const AddSchemeForm: React.FC<AddSchemeFormProps> = ({
  language,
  onBackToDashboard,
  onSchemeCreated,
}) => {
  const t = TRANSLATIONS[language];
  const dataStore = DataStore.getInstance();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Identification
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [corporation, setCorporation] = useState<'NSFDC' | 'NBCFDC' | 'NSKFDC'>('NSFDC');
  const [targetGroup, setTargetGroup] = useState('Scheduled Caste Entrepreneurs');
  const [targetGroupHi, setTargetGroupHi] = useState('अनुसूचित जाति उद्यमी');
  const [description, setDescription] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');

  // 2. Financial Terms
  const [interestRateMin, setInterestRateMin] = useState<number>(4.0);
  const [interestRateMax, setInterestRateMax] = useState<number>(7.0);
  const [rebateForWomenPercent, setRebateForWomenPercent] = useState<number>(1.0);
  const [tenureYearsMax, setTenureYearsMax] = useState<number>(7);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(6);
  const [subsidyRatePercent, setSubsidyRatePercent] = useState<number>(0);

  // 3. Eligibility Rules
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(60);
  const [maxAnnualIncome, setMaxAnnualIncome] = useState<number>(300000);
  const [minProjectCost, setMinProjectCost] = useState<number>(50000);
  const [maxProjectCost, setMaxProjectCost] = useState<number>(1500000);
  const [maxLoanAmount, setMaxLoanAmount] = useState<number>(1200000);
  const [personalContributionMinPercent, setPersonalContributionMinPercent] = useState<number>(5);
  const [eligibleCategories, setEligibleCategories] = useState<string[]>(['SC']);
  const [eligibleGenders, setEligibleGenders] = useState<string[]>(['male', 'female', 'other']);
  const [mandatoryTrainingRequired, setMandatoryTrainingRequired] = useState(false);
  const [specialConditionsNotes, setSpecialConditionsNotes] = useState('');

  // 4. Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { code: 'caste_cert', title: 'Caste / Affirmative Group Certificate', titleHi: 'जाति प्रमाण पत्र', requirementType: 'required' },
    { code: 'income_cert', title: 'Income Certificate issued by Competent Authority', titleHi: 'सक्षम प्राधिकारी द्वारा जारी आय प्रमाण पत्र', requirementType: 'required' },
    { code: 'project_report', title: 'Detailed Project Report (DPR) / Quotation', titleHi: 'विस्तृत परियोजना रिपोर्ट (डीपीआर)', requirementType: 'required' },
  ]);

  // 5. Official Source
  const [sourceName, setSourceName] = useState('NSFDC Operational Lending Guidelines 2026');
  const [sourceUrl, setSourceUrl] = useState('https://nsfdc.nic.in/schemes');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);

  // Load agencies on mount
  useEffect(() => {
    async function loadAgencies() {
      try {
        const list = await getAgenciesFromDb();
        setAgencies(list);
      } catch (err) {
        console.warn('Could not load agencies:', err);
      } finally {
        setLoadingAgencies(false);
      }
    }
    loadAgencies();
  }, []);

  // Update target group suggestion on corporation change
  const handleCorporationChange = (newCorp: 'NSFDC' | 'NBCFDC' | 'NSKFDC') => {
    setCorporation(newCorp);
    if (newCorp === 'NSFDC') {
      setTargetGroup('Scheduled Caste Entrepreneurs');
      setTargetGroupHi('अनुसूचित जाति उद्यमी');
      setEligibleCategories(['SC']);
      setSourceName('NSFDC Operational Lending Guidelines 2026');
      setSourceUrl('https://nsfdc.nic.in/schemes');
    } else if (newCorp === 'NBCFDC') {
      setTargetGroup('Other Backward Classes (OBC - Non Creamy Layer)');
      setTargetGroupHi('अन्य पिछड़ा वर्ग (ओबीसी - गैर क्रीमी लेयर)');
      setEligibleCategories(['OBC']);
      setSourceName('NBCFDC Operational Lending Guidelines 2026');
      setSourceUrl('https://nbcfdc.gov.in/schemes');
    } else if (newCorp === 'NSKFDC') {
      setTargetGroup('Safai Karamcharis, Manual Scavengers & Dependents');
      setTargetGroupHi('सफाई कर्मचारी व उनके आश्रित');
      setEligibleCategories(['SafaiKaramchari']);
      setMaxAnnualIncome(0); // No income ceiling for NSKFDC
      setSourceName('NSKFDC Operational Lending Guidelines 2026');
      setSourceUrl('https://nskfdc.nic.in/schemes');
    }
  };

  // Toggle category
  const toggleCategory = (cat: string) => {
    if (eligibleCategories.includes(cat)) {
      if (eligibleCategories.length > 1) {
        setEligibleCategories(eligibleCategories.filter(c => c !== cat));
      }
    } else {
      setEligibleCategories([...eligibleCategories, cat]);
    }
  };

  // Toggle gender
  const toggleGender = (g: string) => {
    if (eligibleGenders.includes(g)) {
      if (eligibleGenders.length > 1) {
        setEligibleGenders(eligibleGenders.filter(item => item !== g));
      }
    } else {
      setEligibleGenders([...eligibleGenders, g]);
    }
  };

  // Add document row
  const addDocumentRow = () => {
    setDocuments([
      ...documents,
      {
        code: `doc_${Date.now().toString().slice(-4)}`,
        title: '',
        titleHi: '',
        requirementType: 'required'
      }
    ]);
  };

  // Remove document row
  const removeDocumentRow = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  // Update document field
  const updateDocumentField = (index: number, field: keyof DocumentItem, value: any) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], [field]: value };
    setDocuments(updated);
  };

  // Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!code.trim()) {
      errors.code = 'Scheme code is required (e.g., NSFDC-TL-02)';
    } else if (!/^[A-Z0-9_-]+$/i.test(code.trim())) {
      errors.code = 'Scheme code can only contain letters, numbers, hyphens, and underscores';
    }

    if (!name.trim()) {
      errors.name = 'Scheme title in English is required';
    }

    if (!description.trim()) {
      errors.description = 'Please provide a descriptive explanation of the scheme';
    }

    if (interestRateMin < 0 || interestRateMin > 100) {
      errors.interestRateMin = 'Min interest rate must be between 0% and 100%';
    }

    if (interestRateMax < interestRateMin) {
      errors.interestRateMax = 'Max interest rate cannot be lower than min interest rate';
    }

    if (minAge < 18) {
      errors.minAge = 'Statutory min age is 18 years';
    }

    if (maxAge < minAge) {
      errors.maxAge = 'Max age cannot be lower than min age';
    }

    if (minProjectCost <= 0) {
      errors.minProjectCost = 'Min project cost must be greater than ₹0';
    }

    if (maxProjectCost < minProjectCost) {
      errors.maxProjectCost = 'Max project cost cannot be lower than min project cost';
    }

    if (maxLoanAmount > maxProjectCost) {
      errors.maxLoanAmount = 'Max loan amount cannot exceed max project cost';
    }

    if (eligibleCategories.length === 0) {
      errors.eligibleCategories = 'At least one beneficiary social group must be selected';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validate()) {
      const firstKey = Object.keys(formErrors)[0];
      setGeneralError(`Please correct the highlighted form errors before proceeding.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateSchemePayload = {
        scheme: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          nameHi: nameHi.trim() || name.trim(),
          corporation,
          corporationFullName: 
            corporation === 'NSFDC' 
              ? 'National Scheduled Castes Finance and Development Corporation'
              : corporation === 'NBCFDC'
              ? 'National Backward Classes Finance and Development Corporation'
              : 'National Safai Karamcharis Finance and Development Corporation',
          targetGroup,
          targetGroupHi: targetGroupHi || targetGroup,
          description: description.trim(),
          descriptionHi: descriptionHi.trim() || description.trim(),
          specialBenefits: [
            `${interestRateMin}% to ${interestRateMax}% concessional interest rate`,
            rebateForWomenPercent > 0 ? `${rebateForWomenPercent}% interest rebate for women entrepreneurs` : '',
            `Repayment tenure up to ${tenureYearsMax} years including ${moratoriumMonths} months moratorium`
          ].filter(Boolean),
          specialBenefitsHi: [
            `${interestRateMin}% से ${interestRateMax}% रियायती ब्याज दर`,
            rebateForWomenPercent > 0 ? `महिला उद्यमियों के लिए ${rebateForWomenPercent}% ब्याज छूट` : '',
            `${tenureYearsMax} वर्ष तक पुनर्भुगतान अवधि (${moratoriumMonths} माह मोराटोरियम सहित)`
          ].filter(Boolean),
          applicationProcess: [
            'Submit loan application along with DPR to the designated State Channelising Agency (SCA) or Partner Bank.',
            'Verification of affirmative category credentials and project feasibility by field officers.',
            'Sanction by SCA/Bank and loan disbursement into beneficiary bank account.'
          ],
          applicationProcessHi: [
            'नामित राज्य चैनलाइजिंग एजेंसी (SCA) या भागीदार बैंक में डीपीआर सहित आवेदन पत्र जमा करें।',
            'क्षेत्रीय अधिकारियों द्वारा श्रेणी प्रमाण पत्र और परियोजना व्यवहार्यता का सत्यापन।',
            'स्वीकृति के उपरांत लाभार्थी के खाते में ऋण राशि का वितरण।'
          ],
          channelPartners: ['State Channelising Agencies (SCAs)', 'Public Sector Banks', 'Regional Rural Banks (RRBs)'],
          sourceUrl: sourceUrl.trim() || undefined,
          sourceName: sourceName.trim() || undefined,
          effectiveFrom,
          lastVerifiedAt: new Date().toISOString().split('T')[0],
          active: true,
          isDemoData: false
        },
        terms: {
          interestRateMin,
          interestRateMax,
          rebateForWomenPercent,
          tenureYearsMax,
          moratoriumMonths,
          subsidyRatePercent
        },
        rules: {
          minAge,
          maxAge,
          maxAnnualIncome,
          minProjectCost,
          maxProjectCost,
          maxLoanAmount,
          personalContributionMinPercent,
          eligibleCategories,
          eligibleGenders,
          mandatoryTrainingRequired,
          specialConditionsNotes: specialConditionsNotes.trim() || undefined,
          effectiveFrom,
          lastVerifiedAt: new Date().toISOString().split('T')[0]
        },
        documents: documents.filter(d => d.title.trim()).map(d => ({
          code: d.code.trim() || `doc_${Date.now()}`,
          title: d.title.trim(),
          titleHi: d.titleHi.trim() || d.title.trim(),
          requirementType: d.requirementType,
          conditionNote: d.conditionNote?.trim() || undefined
        })),
        source: {
          sourceName: sourceName.trim(),
          officialUrl: sourceUrl.trim(),
          effectiveFrom,
          lastVerifiedAt: new Date().toISOString().split('T')[0],
          isVerified: true
        }
      };

      // 1. Submit to Supabase
      const result = await createSchemeAdmin(payload);

      if (!result.success) {
        throw new Error(result.error || 'Failed to persist scheme to database.');
      }

      // 2. Register into DataStore
      const createdSchemeObj: Scheme = {
        id: result.schemeId || `scheme-${Date.now()}`,
        code: payload.scheme.code,
        name: payload.scheme.name,
        nameHi: payload.scheme.nameHi || payload.scheme.name,
        corporation: payload.scheme.corporation,
        corporationFullName: payload.scheme.corporationFullName || `${payload.scheme.corporation} Corporation`,
        targetGroup: payload.scheme.targetGroup || 'Affirmative Beneficiaries',
        targetGroupHi: payload.scheme.targetGroupHi || 'लक्षित लाभार्थी',
        description: payload.scheme.description,
        descriptionHi: payload.scheme.descriptionHi || payload.scheme.description,
        rules: {
          id: `rule-${result.schemeId || Date.now()}`,
          schemeId: result.schemeId || `scheme-${Date.now()}`,
          minAge: payload.rules.minAge,
          maxAge: payload.rules.maxAge,
          maxAnnualIncome: payload.rules.maxAnnualIncome,
          minProjectCost: payload.rules.minProjectCost,
          maxProjectCost: payload.rules.maxProjectCost,
          maxLoanAmount: payload.rules.maxLoanAmount,
          personalContributionMinPercent: payload.rules.personalContributionMinPercent,
          eligibleCategories: payload.rules.eligibleCategories as BeneficiaryCategory[],
          eligibleGenders: payload.rules.eligibleGenders as Gender[],
          mandatoryTrainingRequired: payload.rules.mandatoryTrainingRequired,
          specialConditionsNotes: payload.rules.specialConditionsNotes,
          effectiveFrom: payload.rules.effectiveFrom || '2026-01-01',
          lastVerifiedAt: new Date().toISOString().split('T')[0]
        },
        terms: {
          interestRateMin: payload.terms.interestRateMin,
          interestRateMax: payload.terms.interestRateMax,
          rebateForWomenPercent: payload.terms.rebateForWomenPercent || 1.0,
          tenureYearsMax: payload.terms.tenureYearsMax,
          moratoriumMonths: payload.terms.moratoriumMonths,
          subsidyRatePercent: payload.terms.subsidyRatePercent || 0
        },
        documents: (payload.documents || []).map((doc, idx) => ({
          id: `doc-${idx}-${Date.now()}`,
          schemeId: result.schemeId || `scheme-${Date.now()}`,
          code: doc.code,
          title: doc.title,
          titleHi: doc.titleHi || doc.title,
          description: '',
          descriptionHi: '',
          requirementType: doc.requirementType,
          conditionNote: doc.conditionNote
        })),
        specialBenefits: payload.scheme.specialBenefits || [],
        specialBenefitsHi: payload.scheme.specialBenefitsHi || [],
        applicationProcess: payload.scheme.applicationProcess || [],
        applicationProcessHi: payload.scheme.applicationProcessHi || [],
        channelPartners: payload.scheme.channelPartners || [],
        sourceUrl: payload.scheme.sourceUrl,
        sourceName: payload.scheme.sourceName,
        effectiveFrom: payload.scheme.effectiveFrom || '2026-01-01',
        lastVerifiedAt: new Date().toISOString().split('T')[0],
        active: true,
        isDemoData: false
      };

      dataStore.addScheme(createdSchemeObj);

      setSuccessMessage(
        language === 'hi' 
          ? `योजना "${payload.scheme.name}" सफलतापूर्वक दर्ज की गई!`
          : `Scheme "${payload.scheme.name}" successfully created and published!`
      );

      if (onSchemeCreated) {
        onSchemeCreated(createdSchemeObj);
      }

      setTimeout(() => {
        onBackToDashboard();
      }, 1500);

    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred while creating the scheme.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToAdmin || 'Back to Admin Dashboard'}</span>
        </button>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authorized Ministry Administrator</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'hi' ? 'नई सरकारी योजना जोड़ें' : 'Add New Government Scheme'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          {language === 'hi' 
            ? 'वैधानिक दिशा-निर्देशों, पात्रता नियमों और ब्याज दरों के साथ योजना का विवरण दर्ज करें।' 
            : 'Register a verified concessional credit scheme with deterministic eligibility criteria and statutory guidelines.'}
        </p>
      </div>

      {/* General error / success alerts */}
      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-3 text-rose-800 dark:text-rose-200 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="font-semibold">{generalError}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start space-x-3 text-emerald-800 dark:text-emerald-200 text-xs shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="font-semibold">{successMessage}</div>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Scheme Identification */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>1. Scheme Identification & Apex Corporation</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              General details, official nomenclature, and executing corporation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Scheme Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Scheme Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. NSFDC-EDU-02"
                className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border ${
                  formErrors.code ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              />
              {formErrors.code && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.code}</p>}
            </div>

            {/* Apex Corporation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Apex Corporation <span className="text-rose-500">*</span>
              </label>
              <select
                value={corporation}
                onChange={e => handleCorporationChange(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NSFDC">NSFDC - National Scheduled Castes Finance & Dev Corp</option>
                <option value="NBCFDC">NBCFDC - National Backward Classes Finance & Dev Corp</option>
                <option value="NSKFDC">NSKFDC - National Safai Karamcharis Finance & Dev Corp</option>
              </select>
            </div>

            {/* Scheme Name (English) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Scheme Name (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Higher Education Concessional Loan Scheme"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              />
              {formErrors.name && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.name}</p>}
            </div>

            {/* Scheme Name (Hindi) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Scheme Name (Hindi)
              </label>
              <input
                type="text"
                value={nameHi}
                onChange={e => setNameHi(e.target.value)}
                placeholder="उदा. उच्च शिक्षा रियायती ऋण योजना"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Target Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Beneficiary Group (English)
              </label>
              <input
                type="text"
                value={targetGroup}
                onChange={e => setTargetGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Target Group (Hindi) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Beneficiary Group (Hindi)
              </label>
              <input
                type="text"
                value={targetGroupHi}
                onChange={e => setTargetGroupHi(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description (English) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Description (English) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Outline scheme objectives, eligible trades, and financing guidelines..."
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  formErrors.description ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              />
              {formErrors.description && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.description}</p>}
            </div>

            {/* Description (Hindi) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Description (Hindi)
              </label>
              <textarea
                rows={2}
                value={descriptionHi}
                onChange={e => setDescriptionHi(e.target.value)}
                placeholder="योजना के उद्देश्य और प्रमुख दिशानिर्देश..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Financial Terms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Percent className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>2. Financial Terms & Repayment Guidelines</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Statutory interest bands, moratorium allowances, and women rebates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Min Interest Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Min Interest Rate (% p.a.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRateMin}
                onChange={e => setInterestRateMin(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.interestRateMin && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.interestRateMin}</p>}
            </div>

            {/* Max Interest Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Interest Rate (% p.a.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRateMax}
                onChange={e => setInterestRateMax(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.interestRateMax && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.interestRateMax}</p>}
            </div>

            {/* Women Rebate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Women Interest Rebate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rebateForWomenPercent}
                onChange={e => setRebateForWomenPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Max Tenure */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Tenure (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={tenureYearsMax}
                onChange={e => setTenureYearsMax(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Moratorium Months */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Moratorium Period (Months)
              </label>
              <input
                type="number"
                value={moratoriumMonths}
                onChange={e => setMoratoriumMonths(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Capital Subsidy */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Capital Subsidy (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={subsidyRatePercent}
                onChange={e => setSubsidyRatePercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Deterministic Eligibility Rules */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>3. Deterministic Eligibility Criteria</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact threshold constraints evaluated by the SchemeSetu matching engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Min Age */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={minAge}
                onChange={e => setMinAge(parseInt(e.target.value) || 18)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.minAge && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.minAge}</p>}
            </div>

            {/* Max Age */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={maxAge}
                onChange={e => setMaxAge(parseInt(e.target.value) || 60)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.maxAge && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.maxAge}</p>}
            </div>

            {/* Max Annual Income */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Annual Family Income (₹)
              </label>
              <input
                type="number"
                step="5000"
                value={maxAnnualIncome}
                onChange={e => setMaxAnnualIncome(parseInt(e.target.value) || 0)}
                placeholder="0 for no income ceiling"
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Set to 0 if no income ceiling exists</span>
            </div>

            {/* Min Project Cost */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Project Cost (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="10000"
                value={minProjectCost}
                onChange={e => setMinProjectCost(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.minProjectCost && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.minProjectCost}</p>}
            </div>

            {/* Max Project Cost */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum Project Cost (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="50000"
                value={maxProjectCost}
                onChange={e => setMaxProjectCost(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.maxProjectCost && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.maxProjectCost}</p>}
            </div>

            {/* Max Loan Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum Loan Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="50000"
                value={maxLoanAmount}
                onChange={e => setMaxLoanAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.maxLoanAmount && <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.maxLoanAmount}</p>}
            </div>

            {/* Personal Contribution Margin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Margin Money (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={personalContributionMinPercent}
                onChange={e => setPersonalContributionMinPercent(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Beneficiary Categories */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Eligible Social Groups <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'SC', label: 'Scheduled Caste (SC)' },
                  { code: 'OBC', label: 'Other Backward Class (OBC)' },
                  { code: 'SafaiKaramchari', label: 'Safai Karamchari & Dependents' },
                  { code: 'DNT_NT', label: 'De-Notified Tribes (DNT/NT)' },
                  { code: 'EBC', label: 'Economically Backward Classes (EBC)' },
                ].map(cat => {
                  const selected = eligibleCategories.includes(cat.code);
                  return (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() => toggleCategory(cat.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              {formErrors.eligibleCategories && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{formErrors.eligibleCategories}</p>
              )}
            </div>

            {/* Genders */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Eligible Genders
              </label>
              <div className="flex space-x-3">
                {[
                  { code: 'male', label: 'Male' },
                  { code: 'female', label: 'Female' },
                  { code: 'other', label: 'Other / Transgender' }
                ].map(g => {
                  const checked = eligibleGenders.includes(g.code);
                  return (
                    <label key={g.code} className="inline-flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGender(g.code)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{g.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Mandatory Technical Training */}
            <div className="sm:col-span-3">
              <label className="inline-flex items-center space-x-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={mandatoryTrainingRequired}
                  onChange={e => setMandatoryTrainingRequired(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Mandatory Technical / Vocational Skill Training Certificate required</span>
              </label>
            </div>

            {/* Special Conditions Notes */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Special Conditions & Operational Notes
              </label>
              <input
                type="text"
                value={specialConditionsNotes}
                onChange={e => setSpecialConditionsNotes(e.target.value)}
                placeholder="e.g. Sanitation worker occupational certificate issued by local urban local body (ULB)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Required Documents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>4. Required Document Checklist</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configures documents displayed on the citizen's checklist view.
              </p>
            </div>

            <button
              type="button"
              onClick={addDocumentRow}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition inline-flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={doc.title}
                    onChange={e => updateDocumentField(idx, 'title', e.target.value)}
                    placeholder="Document Title (English)"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={doc.titleHi}
                    onChange={e => updateDocumentField(idx, 'titleHi', e.target.value)}
                    placeholder="दस्तावेज़ का नाम (हिंदी)"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={doc.requirementType}
                    onChange={e => updateDocumentField(idx, 'requirementType', e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="required">Mandatory (Required)</option>
                    <option value="conditional">Conditional</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={doc.code}
                    onChange={e => updateDocumentField(idx, 'code', e.target.value)}
                    placeholder="code (e.g. caste_cert)"
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeDocumentRow(idx)}
                    disabled={documents.length <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: Official Verification & Gazette Link */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>5. Official Gazette & Verification Source</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authoritative audit trail referencing the statutory publication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Authority Circular / Gazette Source Name
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={e => setEffectiveFrom(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Source URL
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://nsfdc.nic.in/schemes/guidelines"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submission Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
          >
            {t.cancel || 'Cancel'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.saving || 'Publishing Scheme...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.saveScheme || 'Save & Publish Scheme'}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
