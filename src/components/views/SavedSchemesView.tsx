import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  ArrowRight, 
  FileText, 
  Calculator, 
  Scale, 
  ExternalLink, 
  IndianRupee, 
  Percent, 
  Clock, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Scheme } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { dataStore } from '../../services/dataStore';
import { formatIndianCurrency } from '../../services/emiCalculator';

interface SavedSchemesViewProps {
  language: Language;
  onSelectSchemeDetails: (scheme: Scheme) => void;
  onOpenChecklist: (scheme: Scheme) => void;
  onOpenEmi: (scheme: Scheme) => void;
  onAddToCompare: (scheme: Scheme) => void;
  onExploreSchemes: () => void;
  onCheckEligibility: () => void;
}

export const SavedSchemesView: React.FC<SavedSchemesViewProps> = ({
  language,
  onSelectSchemeDetails,
  onOpenChecklist,
  onOpenEmi,
  onAddToCompare,
  onExploreSchemes,
  onCheckEligibility,
}) => {
  const t = TRANSLATIONS[language];
  const [allSchemes, setAllSchemes] = useState<Scheme[]>(() => dataStore.getSchemes());
  const [savedIds, setSavedIds] = useState<string[]>(() => dataStore.getSavedSchemeIds());

  useEffect(() => {
    return dataStore.subscribe(() => {
      setAllSchemes(dataStore.getSchemes());
      setSavedIds(dataStore.getSavedSchemeIds());
    });
  }, []);

  const savedSchemes = allSchemes.filter(s => savedIds.includes(s.id));

  const handleRemove = async (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dataStore.toggleSaveScheme(schemeId);
    setSavedIds(dataStore.getSavedSchemeIds());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/80 flex items-center space-x-1">
              <Bookmark className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Personal Dossier</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {savedSchemes.length} Saved {savedSchemes.length === 1 ? 'Scheme' : 'Schemes'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            My Saved Schemes & Bookmarks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your shortlisted concessional lending options, compare interest subventions, and prepare document dossiers.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={onExploreSchemes}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            Explore All Schemes
          </button>
          <button
            onClick={onCheckEligibility}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none transition cursor-pointer"
          >
            <span>{t.startEligibilityBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schemes Grid or Empty State */}
      {savedSchemes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Schemes Saved Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            When you browse credit schemes or complete the eligibility questionnaire, click the bookmark icon on any card to save it here for quick comparison and document preparation.
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={onExploreSchemes}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Browse Directory
            </button>
            <button
              onClick={onCheckEligibility}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Check My Eligibility
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => onSelectSchemeDetails(scheme)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md dark:hover:border-slate-700 transition flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                    {scheme.corporation}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={(e) => handleRemove(scheme.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Remove from saved schemes"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Name and Target */}
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {scheme.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {scheme.description}
                </p>

                {/* Key Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                      <IndianRupee className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Max Loan</span>
                    </span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatIndianCurrency(scheme.rules.maxLoanAmount)}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                      <Percent className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Interest Rate</span>
                    </span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {scheme.interestRateMin}% – {scheme.interestRateMax}% p.a.
                    </div>
                  </div>
                </div>

                {/* Women rebate notice if any */}
                {scheme.rules.specialRebates?.womenRebatePercent && (
                  <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Women Rebate: {scheme.rules.specialRebates.womenRebatePercent}% interest subvention</span>
                  </div>
                )}
              </div>

              {/* Card Bottom Quick Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-xs">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAddToCompare(scheme); }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 transition cursor-pointer"
                  title="Add to Comparison Matrix"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compare</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpenEmi(scheme); }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 transition cursor-pointer"
                  title="Calculate EMI Schedule"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">EMI</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpenChecklist(scheme); }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center space-x-1 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dossier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
