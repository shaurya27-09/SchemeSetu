import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { ApplicantProfile, Scheme, EligibilityResult, WhatIfParams } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { matchSchemes, evaluateSchemeEligibility } from '../../services/matchingEngine';
import { formatIndianCurrency } from '../../services/emiCalculator';
import { dataStore } from '../../services/dataStore';

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

  const currentList = 
    activeTab === 'eligible' 
      ? eligibleSchemes 
      : activeTab === 'possibly_eligible' 
      ? possiblyEligibleSchemes 
      : ineligibleSchemes;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Profile Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Deterministic Matching Output
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Evaluated {allSchemes.length} statutory schemes
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            {t.resultsTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Matching for <strong>{profile.category}</strong> beneficiary | Budget: <strong>{formatIndianCurrency(profile.projectCost, true)}</strong> | Desired Credit: <strong>{formatIndianCurrency(profile.requestedLoanAmount, true)}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-toggle-whatif"
            onClick={() => setShowWhatIf(!showWhatIf)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition border ${
              showWhatIf
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showWhatIf ? "Hide 'What-If?' Simulator" : t.simulateWhatIf}</span>
          </button>

          <button
            id="btn-edit-profile"
            onClick={onEditProfile}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Modify Questionnaire
          </button>
        </div>
      </div>

      {/* Embedded "What-If?" Scenario Simulator */}
      {showWhatIf && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6">
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
              className="flex items-center space-x-1 text-xs text-indigo-300 hover:text-white"
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
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4">
        <button
          id="tab-eligible"
          onClick={() => setActiveTab('eligible')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'eligible'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t.tabEligible} ({eligibleSchemes.length})</span>
        </button>

        <button
          id="tab-possibly-eligible"
          onClick={() => setActiveTab('possibly_eligible')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'possibly_eligible'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>{t.tabPossiblyEligible} ({possiblyEligibleSchemes.length})</span>
        </button>

        <button
          id="tab-ineligible"
          onClick={() => setActiveTab('ineligible')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'ineligible'
              ? 'border-rose-500 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-500" />
          <span>{t.tabIneligible} ({ineligibleSchemes.length})</span>
        </button>
      </div>

      {/* Schemes List */}
      {currentList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No schemes found in this category</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Check the other tabs above, or adjust your requested loan amount or project cost in the "What-If" simulator.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentList.map((result) => {
            const scheme = result.scheme;
            const isExpanded = expandedSchemeId === scheme.id;
            const isTopMatch = bestMatch?.schemeId === scheme.id;

            return (
              <div 
                key={scheme.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isTopMatch && result.status === 'eligible'
                    ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Scheme Header Card */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          scheme.corporation === 'NSFDC' ? 'bg-blue-100 text-blue-800' :
                          scheme.corporation === 'NBCFDC' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {scheme.corporation}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {scheme.code}
                        </span>

                        {isTopMatch && result.status === 'eligible' && (
                          <span className="text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Highest Compatibility Match</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500">
                          Target: {scheme.targetGroup}
                        </span>
                      </div>

                      {/* Scheme Name */}
                      <h3 className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer"
                        onClick={() => onSelectSchemeDetails(scheme)}
                      >
                        {language === 'hi' ? scheme.nameHi : scheme.name}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {language === 'hi' ? scheme.descriptionHi : scheme.description}
                      </p>
                    </div>

                    {/* Right side: Score & Estimated EMI */}
                    <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-4 lg:gap-2 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Compatibility Score
                        </span>
                        <div className="flex items-baseline space-x-1">
                          <span className={`text-2xl font-black ${
                            result.matchScore >= 80 ? 'text-emerald-600' :
                            result.matchScore >= 60 ? 'text-indigo-600' :
                            result.matchScore >= 40 ? 'text-amber-600' : 'text-slate-400'
                          }`}>
                            {result.matchScore}%
                          </span>
                          <span className="text-xs text-slate-400">match</span>
                        </div>
                      </div>

                      {result.status === 'eligible' && (
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                            Est. Monthly EMI
                          </span>
                          <span className="text-base font-extrabold text-slate-900">
                            {formatIndianCurrency(result.financialEstimate.monthlyEmi)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            @{result.financialEstimate.interestRateApplied}% p.a.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Stats Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500 block">Interest Rate:</span>
                      <span className="font-bold text-slate-800">
                        {scheme.terms.interestRateMin}% – {scheme.terms.interestRateMax}% p.a.
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Max Scheme Assistance:</span>
                      <span className="font-bold text-slate-800">
                        {formatIndianCurrency(scheme.rules.maxLoanAmount, true)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Max Repayment Period:</span>
                      <span className="font-bold text-slate-800">
                        {scheme.terms.tenureYearsMax} Years ({scheme.terms.moratoriumMonths} mo. moratorium)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Women Entrepreneur Rebate:</span>
                      <span className="font-bold text-emerald-700">
                        {scheme.terms.rebateForWomenPercent > 0 ? `${scheme.terms.rebateForWomenPercent}% Interest Rebate` : 'Inclusive / Standard'}
                      </span>
                    </div>
                  </div>

                  {/* EXPLAINABILITY BLOCK: WHY ELIGIBLE / WHY INELIGIBLE */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    {/* Eligible Reasons */}
                    {result.reasonsEligible.length > 0 && (
                      <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.whyEligibleTitle}:</span>
                        </div>
                        <ul className="space-y-1 pl-5 list-disc text-xs text-emerald-900 leading-relaxed">
                          {result.reasonsEligible.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ineligible Reasons */}
                    {result.reasonsNotEligible.length > 0 && (
                      <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/80 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>{t.whyNotEligibleTitle}:</span>
                        </div>
                        <ul className="space-y-1 pl-5 list-disc text-xs text-rose-900 leading-relaxed">
                          {result.reasonsNotEligible.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Potential Blockers / Conditions */}
                    {result.potentialBlockers.length > 0 && (
                      <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{t.potentialBlockersTitle}:</span>
                        </div>
                        <ul className="space-y-1 pl-5 list-disc text-xs text-amber-900 leading-relaxed">
                          {result.potentialBlockers.map((blocker, idx) => (
                            <li key={idx}>{blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        id={`btn-view-details-${scheme.id}`}
                        onClick={() => onSelectSchemeDetails(scheme)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition"
                      >
                        {t.viewDetails}
                      </button>

                      <button
                        id={`btn-checklist-${scheme.id}`}
                        onClick={() => onOpenChecklist(scheme)}
                        className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.generateChecklist}</span>
                      </button>

                      <button
                        id={`btn-locate-${scheme.id}`}
                        onClick={() => onOpenLocator(scheme)}
                        className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.locateBranches}</span>
                      </button>

                      <button
                        id={`btn-compare-${scheme.id}`}
                        onClick={() => onAddToCompare(scheme)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition"
                      >
                        <Scale className="w-3.5 h-3.5 text-slate-400" />
                        <span>Compare</span>
                      </button>
                    </div>

                    <a
                      href={scheme.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-indigo-600 text-[11px] flex items-center space-x-1"
                    >
                      <span>Official MoSJE Guidelines</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
