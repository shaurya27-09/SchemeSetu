import React from 'react';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  Building, 
  Percent, 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  MapPin,
  Clock,
  Briefcase,
  Users
} from 'lucide-react';
import { Scheme } from '../../types';
import { Language } from '../../utils/translations';
import { formatIndianCurrency } from '../../services/emiCalculator';

interface SchemeDetailsModalProps {
  scheme: Scheme | null;
  onClose: () => void;
  language: Language;
  onOpenChecklist: (scheme: Scheme) => void;
  onOpenLocator: (scheme: Scheme) => void;
}

export const SchemeDetailsModal: React.FC<SchemeDetailsModalProps> = ({
  scheme,
  onClose,
  language,
  onOpenChecklist,
  onOpenLocator
}) => {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header Ribbon */}
        <div className="sticky top-0 z-10 bg-slate-900 text-white p-6 rounded-t-3xl flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500 text-white">
                {scheme.corporation}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {scheme.code}
              </span>
              <span className="text-xs text-amber-400 font-semibold">
                MoSJE Verified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {language === 'hi' ? scheme.nameHi : scheme.name}
            </h2>
            <p className="text-xs text-slate-300">
              {scheme.corporationFullName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 text-slate-700">
          {/* Target Group & Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Target Beneficiary & Objective
            </h3>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {language === 'hi' ? scheme.descriptionHi : scheme.description}
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>Designated Beneficiaries:</strong> {scheme.targetGroup}</span>
            </div>
          </div>

          {/* Key Financial Parameters Bento Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Statutory Financial Pattern & Terms
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-xs block">Max Loan Limit:</span>
                <span className="text-lg font-black text-slate-900">
                  {formatIndianCurrency(scheme.rules.maxLoanAmount, true)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Cost ceiling: {formatIndianCurrency(scheme.rules.maxProjectCost, true)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-xs block">Interest Rate:</span>
                <span className="text-lg font-black text-emerald-700">
                  {scheme.terms.interestRateMin}% – {scheme.terms.interestRateMax}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Women rebate: {scheme.terms.rebateForWomenPercent}% p.a.
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-xs block">Max Tenure:</span>
                <span className="text-lg font-black text-slate-900">
                  {scheme.terms.tenureYearsMax} Years
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Moratorium: {scheme.terms.moratoriumMonths} Months
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-xs block">Promoter Margin:</span>
                <span className="text-lg font-black text-indigo-700">
                  {scheme.rules.personalContributionMinPercent}% Min
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Coverage: up to 90%
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility Rules Detail */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Deterministic Eligibility Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Eligible Categories:</span>
                  <span className="font-bold text-slate-800">{scheme.rules.eligibleCategories.join(', ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Age Bracket:</span>
                  <span className="font-bold text-slate-800">{scheme.rules.minAge} to {scheme.rules.maxAge} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual Family Income Limit:</span>
                  <span className="font-bold text-slate-800">
                    {scheme.rules.maxAnnualIncome === 0 ? "No Income Ceiling" : formatIndianCurrency(scheme.rules.maxAnnualIncome)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Gender Eligibility:</span>
                  <span className="font-bold text-slate-800 capitalize">{scheme.rules.eligibleGenders.join(', ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Minimum Project Cost:</span>
                  <span className="font-bold text-slate-800">{formatIndianCurrency(scheme.rules.minProjectCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel Partners:</span>
                  <span className="font-bold text-slate-800">State SCAs & Banks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Advantages & Special Benefits */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Special Program Benefits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scheme.specialBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Application Workflow */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Standard Application & Sanction Workflow
            </h3>
            <div className="space-y-2">
              {scheme.applicationProcess.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 text-xs flex items-start space-x-3 bg-white">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Partners & Branch Locations */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Participating Channelising Agencies:</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {scheme.channelPartners.join(' • ')}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenLocator(scheme);
              }}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Locate Channel Branches</span>
            </button>
          </div>

          {/* Official Verification Metadata & Source Link */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Verified: {scheme.lastVerifiedAt}</span>
              </span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Source: {scheme.sourceName}</span>
              </span>
            </div>

            <a
              href={scheme.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <span>View Ministry Portal Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 rounded-b-3xl border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              onClose();
              onOpenChecklist(scheme);
            }}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Document Checklist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
