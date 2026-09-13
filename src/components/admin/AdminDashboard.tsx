import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  FileText,
  AlertTriangle,
  RefreshCw,
  Power
} from 'lucide-react';
import { Scheme, UserRole } from '../../types';
import { DataStore } from '../../services/dataStore';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { AnimatedNumber } from '../motion-primitives';

interface AdminDashboardProps {
  language: Language;
  onNavigateAddScheme: () => void;
  onSelectScheme?: (scheme: Scheme) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  onNavigateAddScheme,
  onSelectScheme,
}) => {
  const t = TRANSLATIONS[language];
  const { user, profile, role } = useAuth();
  const dataStore = DataStore.getInstance();

  const [schemes, setSchemes] = useState<Scheme[]>(dataStore.getSchemes());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCorporation, setSelectedCorporation] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedSchemeForRules, setSelectedSchemeForRules] = useState<Scheme | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Subscribe to changes in DataStore
  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setSchemes(dataStore.getSchemes());
    });
    return unsubscribe;
  }, [dataStore]);

  // Handle status toggle (activate / deactivate)
  const handleToggleStatus = (scheme: Scheme) => {
    const nextStatus = !scheme.active;
    dataStore.toggleSchemeActive(scheme.id);
    setActionNotice(
      language === 'hi'
        ? `योजना "${scheme.name}" को ${nextStatus ? 'सक्रिय' : 'निष्क्रिय'} किया गया।`
        : `Scheme "${scheme.name}" marked as ${nextStatus ? 'Active' : 'Inactive'}.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Filtered schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      if (selectedCorporation !== 'ALL' && s.corporation !== selectedCorporation) {
        return false;
      }
      if (statusFilter === 'ACTIVE' && !s.active) return false;
      if (statusFilter === 'INACTIVE' && s.active) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCode = s.code.toLowerCase().includes(query);
        const matchName = s.name.toLowerCase().includes(query);
        const matchNameHi = s.nameHi?.toLowerCase().includes(query);
        const matchCorp = s.corporation.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchNameHi && !matchCorp) return false;
      }
      return true;
    });
  }, [schemes, selectedCorporation, statusFilter, searchTerm]);

  // Statistics
  const totalCount = schemes.length;
  const activeCount = schemes.filter(s => s.active).length;
  const inactiveCount = schemes.filter(s => !s.active).length;
  const nsfdcCount = schemes.filter(s => s.corporation === 'NSFDC').length;
  const nbcfdcCount = schemes.filter(s => s.corporation === 'NBCFDC').length;
  const nskfdcCount = schemes.filter(s => s.corporation === 'NSKFDC').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-xs font-semibold shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Ministry Identity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.adminBadge || 'Ministry Administration & Governance'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.adminPortalTitle || 'Administrative Control Center'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.adminPortalSubtitle || 'Manage schemes, verify statutory guidelines, update eligibility rules, and oversee nodal operations.'}
            </p>

            {/* Officer identity strip */}
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile?.full_name || 'Nodal Officer (Admin)'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">{user?.email || 'admin.officer@nic.in'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[10px] uppercase">
                Role: {role}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="admin-add-scheme-btn"
              onClick={onNavigateAddScheme}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addScheme || 'Add Scheme'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.totalSchemes || 'Total Schemes'}</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            <AnimatedNumber value={totalCount} duration={0.4} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Official credit assistance schemes
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.activeSchemes || 'Active Schemes'}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            <AnimatedNumber value={activeCount} duration={0.4} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Eligible for matching engine
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.inactiveSchemes || 'Inactive Schemes'}</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            <AnimatedNumber value={inactiveCount} duration={0.4} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Temporarily paused or archived
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Apex Corporations</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            <AnimatedNumber value={3} duration={0.4} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            NSFDC • NBCFDC • NSKFDC
          </div>
        </motion.div>
      </div>

      {/* Corporation Distribution Chart Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Apex Corporation Scheme Allocation
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {totalCount} Total Catalogued
          </span>
        </div>
        
        {/* Animated Stacked Reveal Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 flex overflow-hidden">
          <motion.div
            className="bg-blue-600 h-3"
            initial={{ width: 0 }}
            animate={{ width: `${totalCount ? (nsfdcCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          />
          <motion.div
            className="bg-emerald-500 h-3"
            initial={{ width: 0 }}
            animate={{ width: `${totalCount ? (nbcfdcCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
          />
          <motion.div
            className="bg-amber-500 h-3"
            initial={{ width: 0 }}
            animate={{ width: `${totalCount ? (nskfdcCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.2 }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300">
              NSFDC (Scheduled Castes): <strong className="text-slate-900 dark:text-white font-mono"><AnimatedNumber value={nsfdcCount} /></strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300">
              NBCFDC (Other Backward Classes): <strong className="text-slate-900 dark:text-white font-mono"><AnimatedNumber value={nbcfdcCount} /></strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300">
              NSKFDC (Safai Karamcharis): <strong className="text-slate-900 dark:text-white font-mono"><AnimatedNumber value={nskfdcCount} /></strong>
            </span>
          </div>
        </div>
      </div>

      {/* Schemes Management Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              {t.manageSchemes || 'Manage Schemes'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'hi' 
                ? 'योजनाओं की सक्रियता स्थिति बदलें, नियम देखें या नई योजनाएं जोड़ें।' 
                : 'Toggle active status, examine eligibility rules, or update statutory terms.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={language === 'hi' ? 'योजना या कोड खोजें...' : 'Search scheme or code...'}
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Corporation filter */}
            <select
              value={selectedCorporation}
              onChange={e => setSelectedCorporation(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Corporations</option>
              <option value="NSFDC">NSFDC (SC)</option>
              <option value="NBCFDC">NBCFDC (OBC)</option>
              <option value="NSKFDC">NSKFDC (Safai Karamchari)</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Schemes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th scope="col" className="px-5 py-3.5">{t.schemeCode || 'Scheme Code'}</th>
                <th scope="col" className="px-5 py-3.5">{t.schemeName || 'Scheme Name'}</th>
                <th scope="col" className="px-5 py-3.5">{t.corporation || 'Corporation'}</th>
                <th scope="col" className="px-5 py-3.5">{t.interestRates || 'Interest & Tenure'}</th>
                <th scope="col" className="px-5 py-3.5">Max Loan</th>
                <th scope="col" className="px-5 py-3.5">{t.status || 'Status'}</th>
                <th scope="col" className="px-5 py-3.5 text-right">{t.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {filteredSchemes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    <p className="font-semibold">No schemes found matching the selected criteria.</p>
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedCorporation('ALL'); setStatusFilter('ALL'); }}
                      className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredSchemes.map((scheme, idx) => {
                  const corpColor = 
                    scheme.corporation === 'NSFDC' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : scheme.corporation === 'NBCFDC'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';

                  return (
                    <motion.tr 
                      key={scheme.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: Math.min(idx * 0.025, 0.25) }}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Code */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                        {scheme.code}
                      </td>

                      {/* Name */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {language === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {language === 'hi' ? scheme.targetGroupHi || scheme.targetGroup : scheme.targetGroup}
                        </div>
                      </td>

                      {/* Corporation */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${corpColor}`}>
                          {scheme.corporation}
                        </span>
                      </td>

                      {/* Interest & Tenure */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                        <div>
                          {scheme.terms.interestRateMin}% – {scheme.terms.interestRateMax}% p.a.
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Up to {scheme.terms.tenureYearsMax} yrs
                        </div>
                      </td>

                      {/* Max Loan */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(scheme.rules.maxLoanAmount / 100000).toLocaleString('en-IN')} Lakh
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(scheme)}
                          title={scheme.active ? 'Click to deactivate' : 'Click to activate'}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer border"
                          style={{
                            backgroundColor: scheme.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            borderColor: scheme.active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.3)',
                            color: scheme.active ? '#059669' : '#64748b'
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full ${scheme.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{scheme.active ? (t.activate ? 'Active' : 'Active') : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                        <button
                          onClick={() => setSelectedSchemeForRules(scheme)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Rules</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(scheme)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition inline-flex items-center space-x-1 cursor-pointer ${
                            scheme.active 
                              ? 'border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{scheme.active ? (t.deactivate || 'Deactivate') : (t.activate || 'Activate')}</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Showing {filteredSchemes.length} of {totalCount} total schemes
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Row Level Security verified: Admin role grants atomic modification access
          </span>
        </div>
      </div>

      {/* Rules Quick Inspection Modal */}
      {selectedSchemeForRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono">
                  {selectedSchemeForRules.code}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedSchemeForRules.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Deterministic Eligibility Rules & Statutory Parameters
                </p>
              </div>
              <button
                onClick={() => setSelectedSchemeForRules(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Rules Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Age Requirement</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedSchemeForRules.rules.minAge} to {selectedSchemeForRules.rules.maxAge} Years
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Max Family Annual Income</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{selectedSchemeForRules.rules.maxAnnualIncome.toLocaleString('en-IN')} / year
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Project Cost Range</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{selectedSchemeForRules.rules.minProjectCost.toLocaleString('en-IN')} to ₹{selectedSchemeForRules.rules.maxProjectCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Minimum Margin Money</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedSchemeForRules.rules.personalContributionMinPercent}% of Project Cost
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Eligible Affirmative Categories</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedSchemeForRules.rules.eligibleCategories.map(cat => (
                    <span key={cat} className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-semibold text-[11px]">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Special Conditions & Verification Notes</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {selectedSchemeForRules.rules.specialConditionsNotes || 'No conditional constraints recorded.'}
                </p>
              </div>

              {selectedSchemeForRules.sourceUrl && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Official Ministry Source</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedSchemeForRules.sourceName || 'Government of India Circular'}
                    </span>
                  </div>
                  <a
                    href={selectedSchemeForRules.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>View Gazette</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSchemeForRules(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
