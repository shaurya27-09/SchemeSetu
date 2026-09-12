import React, { useState } from 'react';
import { 
  Scale, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Award, 
  ExternalLink, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Scheme } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { dataStore } from '../../services/dataStore';
import { formatIndianCurrency } from '../../services/emiCalculator';

interface SchemeCompareProps {
  language: Language;
  selectedSchemes: Scheme[];
  onRemoveScheme: (schemeId: string) => void;
  onAddScheme: (scheme: Scheme) => void;
  onSelectSchemeDetails: (scheme: Scheme) => void;
  onOpenChecklist: (scheme: Scheme) => void;
}

export const SchemeCompare: React.FC<SchemeCompareProps> = ({
  language,
  selectedSchemes,
  onRemoveScheme,
  onAddScheme,
  onSelectSchemeDetails,
  onOpenChecklist
}) => {
  const t = TRANSLATIONS[language];
  const allSchemes = dataStore.getSchemes().filter(s => s.active);

  // Available schemes not yet added to comparison
  const availableToAdd = allSchemes.filter(
    s => !selectedSchemes.some(sel => sel.id === s.id)
  );

  // Calculate Trade-Off Superlatives
  const bestRateScheme = selectedSchemes.length > 0 
    ? [...selectedSchemes].sort((a, b) => a.terms.interestRateMin - b.terms.interestRateMin)[0]
    : null;

  const highestFundingScheme = selectedSchemes.length > 0
    ? [...selectedSchemes].sort((a, b) => b.rules.maxLoanAmount - a.rules.maxLoanAmount)[0]
    : null;

  const longestTenureScheme = selectedSchemes.length > 0
    ? [...selectedSchemes].sort((a, b) => b.terms.tenureYearsMax - a.terms.tenureYearsMax)[0]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Comparative Analysis Matrix
            </span>
            <span className="text-xs text-slate-500">
              {selectedSchemes.length} of 3 schemes selected
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Scheme Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare statutory borrowing limits, interest concessions, and tenure conditions side-by-side to choose the best credit route.
          </p>
        </div>

        {/* Add Scheme Dropdown if < 3 */}
        {selectedSchemes.length < 3 && availableToAdd.length > 0 && (
          <div className="flex items-center space-x-2">
            <select
              id="select-add-scheme-compare"
              onChange={(e) => {
                const s = allSchemes.find(item => item.id === e.target.value);
                if (s) {
                  onAddScheme(s);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="" disabled>+ Add Scheme to Compare...</option>
              {availableToAdd.map(s => (
                <option key={s.id} value={s.id}>{s.corporation} — {s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Trade-Off Highlights Box (when >= 2 schemes selected) */}
      {selectedSchemes.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Lowest Interest Rate</span>
              <p className="text-xs font-extrabold text-slate-900 truncate">
                {bestRateScheme?.name}
              </p>
              <span className="text-xs font-black text-emerald-700">
                {bestRateScheme?.terms.interestRateMin}% p.a.
              </span>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">Highest Funding Limit</span>
              <p className="text-xs font-extrabold text-slate-900 truncate">
                {highestFundingScheme?.name}
              </p>
              <span className="text-xs font-black text-indigo-700">
                {formatIndianCurrency(highestFundingScheme?.rules.maxLoanAmount || 0, true)}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Longest Repayment Period</span>
              <p className="text-xs font-extrabold text-slate-900 truncate">
                {longestTenureScheme?.name}
              </p>
              <span className="text-xs font-black text-amber-800">
                {longestTenureScheme?.terms.tenureYearsMax} Years ({longestTenureScheme?.terms.moratoriumMonths}m grace)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Grid Table */}
      {selectedSchemes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Scale className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No schemes selected for comparison</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose schemes from the dropdown above or click "Compare" on any scheme card in the results dashboard.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 w-1/4 font-bold text-slate-500 uppercase tracking-wider">
                  Attribute
                </th>
                {selectedSchemes.map(s => (
                  <th key={s.id} className="p-4 w-1/4 font-bold text-slate-900">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          s.corporation === 'NSFDC' ? 'bg-blue-100 text-blue-800' :
                          s.corporation === 'NBCFDC' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {s.corporation}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{s.name}</h4>
                      </div>
                      <button
                        onClick={() => onRemoveScheme(s.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Max Loan Assistance */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Max Loan Limit</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 font-extrabold text-slate-900 text-sm">
                    {formatIndianCurrency(s.rules.maxLoanAmount, true)}
                  </td>
                ))}
              </tr>

              {/* Interest Rate */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Interest Rate Range</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 font-bold text-emerald-700">
                    {s.terms.interestRateMin}% – {s.terms.interestRateMax}% p.a.
                  </td>
                ))}
              </tr>

              {/* Women Concession */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Women Entrepreneur Rebate</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 text-slate-700">
                    {s.terms.rebateForWomenPercent > 0 
                      ? `${s.terms.rebateForWomenPercent}% Additional Interest Rebate` 
                      : (s.rules.eligibleGenders.length === 1 && s.rules.eligibleGenders[0] === 'female')
                      ? "Exclusive Women Scheme (Low Fixed Rate)"
                      : "Standard Rate"}
                  </td>
                ))}
              </tr>

              {/* Max Tenure */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Max Tenure</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 font-semibold text-slate-800">
                    {s.terms.tenureYearsMax} Years ({s.terms.moratoriumMonths} mo. moratorium)
                  </td>
                ))}
              </tr>

              {/* Minimum Margin Money */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Promoter Margin Required</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 font-semibold text-slate-800">
                    {s.rules.personalContributionMinPercent === 0 
                      ? "0% (Zero Promoter Contribution)" 
                      : `${s.rules.personalContributionMinPercent}% of project cost`}
                  </td>
                ))}
              </tr>

              {/* Annual Income Limit */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Family Income Ceiling</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 font-semibold text-slate-800">
                    {s.rules.maxAnnualIncome === 0 ? "No Income Ceiling" : formatIndianCurrency(s.rules.maxAnnualIncome)}
                  </td>
                ))}
              </tr>

              {/* Target Categories */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Eligible Categories</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 text-slate-700">
                    {s.rules.eligibleCategories.join(', ')}
                  </td>
                ))}
              </tr>

              {/* Channel Partners */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Implementation Channel</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 text-slate-600 leading-relaxed">
                    {s.channelPartners.slice(0, 3).join(', ')}
                  </td>
                ))}
              </tr>

              {/* Action Buttons */}
              <tr className="bg-slate-50/40">
                <td className="p-4 font-bold text-slate-700">Actions</td>
                {selectedSchemes.map(s => (
                  <td key={s.id} className="p-4 space-y-2">
                    <button
                      onClick={() => onSelectSchemeDetails(s)}
                      className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
                    >
                      Full Details
                    </button>
                    <button
                      onClick={() => onOpenChecklist(s)}
                      className="w-full py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                    >
                      Checklist
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
