import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Calculator, 
  FileCheck, 
  MapPin, 
  Scale, 
  ExternalLink, 
  Sliders, 
  RotateCcw,
  Percent,
  ChevronDown,
  ChevronUp,
  Info,
  Bookmark,
  BookmarkCheck,
  Database
} from 'lucide-react';
import { ApplicantProfile, Scheme, EligibilityResult, WhatIfParams } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { matchSchemes, evaluateSchemeEligibility } from '../../services/matchingEngine';
import { formatIndianCurrency } from '../../services/emiCalculator';
import { dataStore } from '../../services/dataStore';
import { recordMatchRunToSupabase } from '../../services/supabaseService';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedNumber } from '../motion-primitives';

interface ResultsDashboardProps {
  language: Language;
  profile: ApplicantProfile;
  onSelectSchemeDetails: (scheme: Scheme) => void;
  onOpenChecklist: (scheme: Scheme) => void;
  onOpenLocator: (scheme: Scheme) => void;
  onAddToCompare: (scheme: Scheme) => void;
  onEditProfile: () => void;
  onOpenMitra: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  language,
  profile,
  onSelectSchemeDetails,
  onOpenChecklist,
  onOpenLocator,
  onAddToCompare,
  onEditProfile,
  onOpenMitra
}) => {
  const t = TRANSLATIONS[language];
  const allSchemes = dataStore.getSchemes();

  // What-If Simulator state
  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'eligible' | 'possibly_eligible' | 'ineligible'>('eligible');
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  const [whatIfParams, setWhatIfParams] = useState<WhatIfParams>({
    projectCost: profile.projectCost,
    requestedLoanAmount: profile.requestedLoanAmount,
    personalContribution: profile.personalContribution,
    tenureYears: 7
  });

  // Calculate results using deterministic matching engine
  const matchOutput = matchSchemes(
    profile, 
    allSchemes, 
    showWhatIf ? whatIfParams : undefined
  );

  const { eligibleSchemes, possiblyEligibleSchemes, ineligibleSchemes, bestMatch } = matchOutput;

  // Bookmarked / Saved schemes
  const [savedIds, setSavedIds] = useState<string[]>(() => dataStore.getSavedSchemeIds());
  const [recordedRunId, setRecordedRunId] = useState<string | null>(null);

  useEffect(() => {
    return dataStore.subscribe(() => {
      setSavedIds(dataStore.getSavedSchemeIds());
    });
  }, []);

  // Record deterministic match run into Supabase match_runs & match_results
  useEffect(() => {
    recordMatchRunToSupabase(profile, matchOutput.allResults).then(runId => {
      if (runId) {
        setRecordedRunId(runId);
      }
    }).catch(err => {
      console.warn('[ResultsDashboard] Match run recording note:', err);
    });
  }, [profile, showWhatIf, whatIfParams.projectCost, whatIfParams.requestedLoanAmount]);

  const handleToggleSave = async (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dataStore.toggleSaveScheme(schemeId);
    setSavedIds(dataStore.getSavedSchemeIds());
  };

  const currentList = 
    activeTab === 'eligible' 
      ? eligibleSchemes 
      : activeTab === 'possibly_eligible' 
      ? possiblyEligibleSchemes 
      : ineligibleSchemes;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Profile Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Deterministic Matching Output
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Evaluated {allSchemes.length} statutory schemes
            </span>
            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              <Database className="w-3 h-3 text-indigo-500" />
              <span>{recordedRunId ? `Match Run Synced: #${recordedRunId.slice(0, 8)}` : 'Rule Engine Evaluated'}</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {t.resultsTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Matching for <strong className="text-slate-800 dark:text-slate-200">{profile.category}</strong> beneficiary | Budget: <strong className="text-slate-800 dark:text-slate-200">{formatIndianCurrency(profile.projectCost, true)}</strong> | Desired Credit: <strong className="text-slate-800 dark:text-slate-200">{formatIndianCurrency(profile.requestedLoanAmount, true)}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-toggle-whatif"
            onClick={() => setShowWhatIf(!showWhatIf)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              showWhatIf
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showWhatIf ? "Hide 'What-If?' Simulator" : t.simulateWhatIf}</span>
          </button>

          <button
            id="btn-edit-profile"
            onClick={onEditProfile}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            Modify Questionnaire
          </button>
        </div>
      </div>

      {/* Embedded "What-If?" Scenario Simulator */}
      {showWhatIf && (
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-indigo-900/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>{t.whatIfTitle}</span>
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                {t.whatIfSubtitle}
              </p>
            </div>
            <button
              onClick={() => setWhatIfParams({
                projectCost: profile.projectCost,
                requestedLoanAmount: profile.requestedLoanAmount,
                personalContribution: profile.personalContribution,
                tenureYears: 7
              })}
              className="flex items-center space-x-1 text-xs text-indigo-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Original</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Slider 1: Project Cost */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-200">Project Cost</span>
                <span className="text-amber-300 font-bold">{formatIndianCurrency(whatIfParams.projectCost, true)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="5000000"
                step="50000"
                value={whatIfParams.projectCost}
                onChange={(e) => {
                  const cost = Number(e.target.value);
                  setWhatIfParams(prev => ({
                    ...prev,
                    projectCost: cost,
                    requestedLoanAmount: Math.min(prev.requestedLoanAmount, Math.round(cost * 0.9)),
                    personalContribution: Math.round(cost * 0.1)
                  }));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Slider 2: Desired Loan Amount */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-200">Loan Amount</span>
                <span className="text-emerald-300 font-bold">{formatIndianCurrency(whatIfParams.requestedLoanAmount, true)}</span>
              </div>
              <input
                type="range"
                min="25000"
                max={whatIfParams.projectCost}
                step="25000"
                value={whatIfParams.requestedLoanAmount}
                onChange={(e) => {
                  const loan = Number(e.target.value);
                  setWhatIfParams(prev => ({
                    ...prev,
                    requestedLoanAmount: loan,
                    personalContribution: Math.max(0, prev.projectCost - loan)
                  }));
                }}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Slider 3: Personal Contribution */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-200">Promoter Margin</span>
                <span className="text-indigo-300 font-bold">{formatIndianCurrency(whatIfParams.personalContribution, true)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={whatIfParams.projectCost}
                step="10000"
                value={whatIfParams.personalContribution}
                onChange={(e) => setWhatIfParams(prev => ({
                  ...prev,
                  personalContribution: Number(e.target.value)
                }))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            {/* Slider 4: Loan Tenure */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-200">Repayment Tenure</span>
                <span className="text-cyan-300 font-bold">{whatIfParams.tenureYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={whatIfParams.tenureYears}
                onChange={(e) => setWhatIfParams(prev => ({
                  ...prev,
                  tenureYears: Number(e.target.value)
                }))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 sm:space-x-4">
        <button
          id="tab-eligible"
          onClick={() => setActiveTab('eligible')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'eligible'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.tabEligible} ({eligibleSchemes.length})</span>
        </button>

        <button
          id="tab-possibly-eligible"
          onClick={() => setActiveTab('possibly_eligible')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'possibly_eligible'
              ? 'border-amber-500 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>{t.tabPossiblyEligible} ({possiblyEligibleSchemes.length})</span>
        </button>

        <button
          id="tab-ineligible"
          onClick={() => setActiveTab('ineligible')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'ineligible'
              ? 'border-rose-500 text-rose-700 dark:text-rose-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          <span>{t.tabIneligible} ({ineligibleSchemes.length})</span>
        </button>
      </div>

      {/* Schemes List */}
      {currentList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Info className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No schemes found in this category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Check the other tabs above, or adjust your requested loan amount or project cost in the "What-If" simulator.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentList.map((result, idx) => {
            const scheme = result.scheme;
            const isExpanded = expandedSchemeId === scheme.id;
            const isTopMatch = bestMatch?.schemeId === scheme.id;

            return (
              <motion.div 
                key={scheme.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.28, 
                  delay: Math.min(idx * 0.05, 0.35), 
                  ease: [0.25, 0.1, 0.25, 1] 
                }}
                whileHover={{ y: -3 }}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-shadow ${
                  isTopMatch && result.status === 'eligible'
                    ? 'border-indigo-500 dark:border-indigo-400 shadow-md ring-1 ring-indigo-500 dark:ring-indigo-400 hover:shadow-lg'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                }`}
              >
                {/* Scheme Header Card */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          scheme.corporation === 'NSFDC' ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300' :
                          scheme.corporation === 'NBCFDC' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' :
                          'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {scheme.corporation}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {scheme.code}
                        </span>

                        {isTopMatch && result.status === 'eligible' && (
                          <span className="text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Highest Compatibility Match</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Target: {scheme.targetGroup}
                        </span>
                      </div>

                      {/* Scheme Name */}
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        onClick={() => onSelectSchemeDetails(scheme)}
                      >
                        {language === 'hi' ? scheme.nameHi : scheme.name}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {language === 'hi' ? scheme.descriptionHi : scheme.description}
                      </p>
                    </div>

                    {/* Right side: Score & Estimated EMI */}
                    <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-4 lg:gap-2 shrink-0 bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                          Compatibility Score
                        </span>
                        <div className="flex items-baseline space-x-1">
                          <span className={`text-2xl font-black ${
                            result.matchScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                            result.matchScore >= 60 ? 'text-indigo-600 dark:text-indigo-400' :
                            result.matchScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                          }`}>
                            <AnimatedNumber value={result.matchScore} suffix="%" duration={0.7} />
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">match</span>
                        </div>
                      </div>

                      {result.status === 'eligible' && (
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                            Est. Monthly EMI
                          </span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {formatIndianCurrency(result.financialEstimate.monthlyEmi)}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                            @{result.financialEstimate.interestRateApplied}% p.a.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Stats Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Interest Rate:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {scheme.terms.interestRateMin}% – {scheme.terms.interestRateMax}% p.a.
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Max Scheme Assistance:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatIndianCurrency(scheme.rules.maxLoanAmount, true)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Max Repayment Period:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {scheme.terms.tenureYearsMax} Years ({scheme.terms.moratoriumMonths} mo. moratorium)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Women Entrepreneur Rebate:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {scheme.terms.rebateForWomenPercent > 0 ? `${scheme.terms.rebateForWomenPercent}% Interest Rebate` : 'Inclusive / Standard'}
                      </span>
                    </div>
                  </div>

                  {/* EXPLAINABILITY BLOCK: WHY ELIGIBLE / WHY INELIGIBLE */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {/* Eligible Reasons */}
                    {(result.reasonsEligible || []).length > 0 && (
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{t.whyEligibleTitle}:</span>
                        </div>
                        <ul className="space-y-1 pl-5 list-disc text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                          {(result.reasonsEligible || []).map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ineligible Reasons */}
                    {(result.reasonsNotEligible || []).length > 0 && (
                      <div className="bg-rose-50/70 dark:bg-rose-950/40 p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-800/60 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>{t.whyNotEligibleTitle}:</span>
                        </div>
                        <ul className="space-y-1 pl-5 list-disc text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                          {(result.reasonsNotEligible || []).map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Potential Blockers / Conditions */}
                    {(result.potentialBlockers || []).length > 0 && (
                      <div className="bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{t.potentialBlockersTitle}:</span>
                        </div>
                        <ul className="space-y-1 pl-5 list-disc text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                          {(result.potentialBlockers || []).map((blocker, idx) => (
                            <li key={idx}>{blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        id={`btn-view-details-${scheme.id}`}
                        onClick={() => onSelectSchemeDetails(scheme)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition cursor-pointer"
                      >
                        {t.viewDetails}
                      </button>

                      <button
                        id={`btn-checklist-${scheme.id}`}
                        onClick={() => onOpenChecklist(scheme)}
                        className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>{t.generateChecklist}</span>
                      </button>

                      <button
                        id={`btn-locate-${scheme.id}`}
                        onClick={() => onOpenLocator(scheme)}
                        className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>{t.locateBranches}</span>
                      </button>

                      <button
                        id={`btn-compare-${scheme.id}`}
                        onClick={() => onAddToCompare(scheme)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 text-slate-400" />
                        <span>Compare</span>
                      </button>

                      {/* Saved Scheme Bookmark Toggle */}
                      <button
                        id={`btn-save-match-${scheme.id}`}
                        onClick={(e) => handleToggleSave(scheme.id, e)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                          savedIds.includes(scheme.id)
                            ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        title={savedIds.includes(scheme.id) ? "Saved in Bookmarks" : "Save Scheme"}
                      >
                        {savedIds.includes(scheme.id) ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            <span>Save</span>
                          </>
                        )}
                      </button>

                      {/* Expand Rule Matrix */}
                      <button
                        onClick={() => setExpandedSchemeId(isExpanded ? null : scheme.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide Rules" : "Inspect Rule Breakdown"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <a
                      href={scheme.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-[11px] flex items-center space-x-1"
                    >
                      <span>Official MoSJE Guidelines</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Expandable Deterministic Rule Breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                              Deterministic Rule Engine Audit Breakdown
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              Scheme Code: {scheme.code} | Status: {result.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Beneficiary Target Category</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{scheme.rules.eligibleCategories.join(', ')}</span>
                              <span className="block text-[10px] mt-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                Applicant ({profile.category}): {scheme.rules.eligibleCategories.includes(profile.category) ? '✓ Matched' : '✗ Category Ineligible'}
                              </span>
                            </div>

                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Age Range Permitted</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{scheme.rules.minAge} to {scheme.rules.maxAge} years</span>
                              <span className="block text-[10px] mt-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                Applicant ({profile.age} yrs): {profile.age >= scheme.rules.minAge && profile.age <= scheme.rules.maxAge ? '✓ Within Limits' : '✗ Out of Range'}
                              </span>
                            </div>

                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Max Credit Limit</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIndianCurrency(scheme.rules.maxLoanAmount, true)}</span>
                              <span className="block text-[10px] mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                                Requested: {formatIndianCurrency(profile.requestedLoanAmount, true)} ({profile.requestedLoanAmount <= scheme.rules.maxLoanAmount ? '✓ Within Limit' : '⚠ Exceeds Scheme Max'})
                              </span>
                            </div>

                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Income Ceiling Criteria</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {scheme.rules.maxAnnualIncome === 0 ? 'No Ceiling (Waiver Active)' : formatIndianCurrency(scheme.rules.maxAnnualIncome, true)}
                              </span>
                              <span className="block text-[10px] mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                                Declared Income: {formatIndianCurrency(profile.annualFamilyIncome, true)} ({scheme.rules.maxAnnualIncome === 0 || profile.annualFamilyIncome <= scheme.rules.maxAnnualIncome ? '✓ Eligible' : '✗ Exceeds Ceiling'})
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                            Required Documents ({(scheme.documents || []).length}): {(scheme.documents || []).map(d => d.title).join(', ')}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
