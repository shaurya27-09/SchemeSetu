import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  Percent, 
  Clock, 
  IndianRupee, 
  ArrowRight,
  Scale,
  Sparkles,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Scheme } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { dataStore } from '../../services/dataStore';
import { formatIndianCurrency } from '../../services/emiCalculator';

interface AllSchemesViewProps {
  language: Language;
  onSelectSchemeDetails: (scheme: Scheme) => void;
  onOpenChecklist: (scheme: Scheme) => void;
  onAddToCompare: (scheme: Scheme) => void;
  onCheckEligibility: () => void;
}

export const AllSchemesView: React.FC<AllSchemesViewProps> = ({
  language,
  onSelectSchemeDetails,
  onOpenChecklist,
  onAddToCompare,
  onCheckEligibility
}) => {
  const t = TRANSLATIONS[language];
  const [allSchemes, setAllSchemes] = useState<Scheme[]>(() => dataStore.getSchemes().filter(s => s.active));
  const [savedIds, setSavedIds] = useState<string[]>(() => dataStore.getSavedSchemeIds());
  const [onlySaved, setOnlySaved] = useState<boolean>(false);

  useEffect(() => {
    return dataStore.subscribe(() => {
      setAllSchemes(dataStore.getSchemes().filter(s => s.active));
      setSavedIds(dataStore.getSavedSchemeIds());
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCorp, setSelectedCorp] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filtered = allSchemes.filter(scheme => {
    if (onlySaved && !savedIds.includes(scheme.id)) return false;
    const matchesCorp = selectedCorp === 'All' || scheme.corporation === selectedCorp;
    const matchesCat = selectedCategory === 'All' || scheme.rules.eligibleCategories.includes(selectedCategory as any);
    const matchesQuery = 
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.targetGroup.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCorp && matchesCat && matchesQuery;
  });

  const handleToggleSave = async (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dataStore.toggleSaveScheme(schemeId);
    setSavedIds(dataStore.getSavedSchemeIds());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Official MoSJE Directory
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {allSchemes.length} Active Credit Schemes
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            All Credit & Entrepreneurship Schemes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse verified concessional loan schemes operated by NSFDC, NBCFDC, and NSKFDC.
          </p>
        </div>

        <button
          onClick={onCheckEligibility}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none transition cursor-pointer"
        >
          <span>{t.startEligibilityBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOnlySaved(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                !onlySaved 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Schemes ({allSchemes.length})
            </button>
            <button
              onClick={() => setOnlySaved(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                onlySaved 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Schemes ({savedIds.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> matching schemes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by scheme name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Corporation */}
          <div>
            <select
              value={selectedCorp}
              onChange={(e) => setSelectedCorp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="All">All Apex Corporations (NSFDC, NBCFDC, NSKFDC)</option>
              <option value="NSFDC">NSFDC (Scheduled Castes)</option>
              <option value="NBCFDC">NBCFDC (Backward Classes)</option>
              <option value="NSKFDC">NSKFDC (Safai Karamcharis)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="All">All Target Beneficiaries</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="OBC">Other Backward Classes (OBC)</option>
              <option value="SafaiKaramchari">Safai Karamchari / Sanitation</option>
              <option value="DNT_NT">De-Notified Tribes (DNT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(scheme => (
          <div
            key={scheme.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md dark:hover:border-slate-700 transition flex flex-col justify-between p-6"
          >
            <div className="space-y-3">
              {/* Corporation & Code */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  scheme.corporation === 'NSFDC' ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300' :
                  scheme.corporation === 'NBCFDC' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' :
                  'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {scheme.corporation}
                </span>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{scheme.code}</span>
              </div>

              {/* Title */}
              <h3 
                onClick={() => onSelectSchemeDetails(scheme)}
                className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer leading-snug"
              >
                {language === 'hi' ? scheme.nameHi : scheme.name}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {language === 'hi' ? scheme.descriptionHi : scheme.description}
              </p>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 block">Interest Rate:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{scheme.terms?.interestRateMin ?? 4}% – {scheme.terms?.interestRateMax ?? 8}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 block">Max Loan:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatIndianCurrency(scheme.rules?.maxLoanAmount ?? 500000, true)}</span>
                </div>
              </div>

              {/* Concession tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(scheme.terms?.rebateForWomenPercent ?? 0) > 0 && (
                  <span className="text-[10px] font-bold bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-md border border-pink-100 dark:border-pink-900/60">
                    {scheme.terms?.rebateForWomenPercent}% Women Rebate
                  </span>
                )}
                <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                  {scheme.terms?.tenureYearsMax ?? 5} Yrs Tenure
                </span>
                {scheme.rules?.maxAnnualIncome === 0 ? (
                  <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    No Income Ceiling
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                    Ceiling: {formatIndianCurrency(scheme.rules?.maxAnnualIncome ?? 300000, true)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectSchemeDetails(scheme)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
              >
                View Details →
              </button>

              <div className="flex items-center space-x-1.5">
                <button
                  id={`btn-save-scheme-${scheme.id}`}
                  onClick={(e) => handleToggleSave(scheme.id, e)}
                  className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                    savedIds.includes(scheme.id)
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title={savedIds.includes(scheme.id) ? "Remove from Saved" : "Save Scheme"}
                >
                  {savedIds.includes(scheme.id) ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onAddToCompare(scheme)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs cursor-pointer"
                  title="Add to Compare"
                >
                  <Scale className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenChecklist(scheme)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs cursor-pointer"
                  title="Document Checklist"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
