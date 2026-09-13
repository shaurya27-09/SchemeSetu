import React, { useState } from 'react';
import { 
  FileCheck, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  Check
} from 'lucide-react';
import { Scheme, ApplicantProfile, DocumentRequirement } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { generateDocumentChecklist } from '../../services/documentService';
import { dataStore } from '../../services/dataStore';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedNumber } from '../motion-primitives';

interface DocumentChecklistViewProps {
  language: Language;
  selectedScheme?: Scheme | null;
  profile?: ApplicantProfile | null;
  onSelectScheme: (scheme: Scheme) => void;
}

export const DocumentChecklistView: React.FC<DocumentChecklistViewProps> = ({
  language,
  selectedScheme,
  profile,
  onSelectScheme
}) => {
  const t = TRANSLATIONS[language];
  const allSchemes = dataStore.getSchemes().filter(s => s.active);
  const activeScheme = selectedScheme || allSchemes[0];
  const activeProfile = profile || dataStore.getSavedProfile();

  // Document checklist with prepared checkboxes
  const checklist = generateDocumentChecklist(activeScheme, activeProfile) || { mandatory: [], conditional: [], optional: [] };
  const mandatoryList = checklist.mandatory || [];
  const conditionalList = checklist.conditional || [];
  const optionalList = checklist.optional || [];
  const [preparedDocs, setPreparedDocs] = useState<Record<string, boolean>>({});

  const togglePrepared = (docId: string) => {
    setPreparedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const totalMandatory = mandatoryList.length + conditionalList.length;
  const totalDocs = totalMandatory + optionalList.length;
  const preparedCount = Object.values(preparedDocs).filter(Boolean).length;
  const readinessPercent = totalDocs > 0 ? Math.round((preparedCount / totalDocs) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header & Scheme Selector */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
              Personalized Dossier Generator
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              MoSJE Compliance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            Document Checklist
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Personalized verification checklist required by State Channelising Agencies (SCAs) and banks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Scheme:</label>
            <select
              value={activeScheme.id}
              onChange={(e) => {
                const found = allSchemes.find(s => s.id === e.target.value);
                if (found) onSelectScheme(found);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              {allSchemes.map(s => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {s.corporation} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Checklist (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0 transition-colors">
        {/* Printable Header Banner */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950/90 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-sm border border-indigo-200 dark:border-indigo-800">
                {activeScheme.corporation}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{activeScheme.code}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeScheme.name}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activeScheme.corporationFullName} • Verified Submission Checklist
            </p>
          </div>

          {/* Prepared status indicator with smooth progress bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 min-w-[220px] text-right no-print space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              <span>Dossier Readiness</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                <AnimatedNumber value={readinessPercent} suffix="%" duration={0.3} />
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {preparedCount} of {totalDocs} Documents Prepared
            </span>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-emerald-500 h-1.5 rounded-full"
                initial={false}
                animate={{ width: `${readinessPercent}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* 1. MANDATORY STATUTORY DOCUMENTS */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Mandatory Documents (Required for All Applicants)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Statutory identification, caste, and income verification documents
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mandatoryList.map((doc) => {
              const isChecked = Boolean(preparedDocs[doc.id]);
              return (
                <motion.div 
                  key={doc.id}
                  onClick={() => togglePrepared(doc.id)}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15 }}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3.5 select-none ${
                    isChecked 
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <AnimatePresence>
                      {isChecked && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-bold transition-all duration-200 ${isChecked ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-80' : 'text-slate-900 dark:text-slate-100'}`}>
                        {doc.title}
                      </h4>
                      <span className="shrink-0 text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full">
                        Mandatory
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{doc.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>Issuing Authority: <strong className="text-slate-700 dark:text-slate-200">{doc.issuingAuthority}</strong></span>
                      {doc.formats && <span>Format: <span className="text-slate-700 dark:text-slate-300">{doc.formats.join(', ')}</span></span>}
                      {doc.validity && <span>Validity: <span className="text-slate-700 dark:text-slate-300">{doc.validity}</span></span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 2. CONDITIONAL DOCUMENTS */}
        {conditionalList.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Conditional Documents (Based on Project Size or Sector)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Applicable for specific business categories, term loans, or high-value projects
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {conditionalList.map((doc) => {
                const isChecked = Boolean(preparedDocs[doc.id]);
                return (
                  <motion.div 
                    key={doc.id}
                    onClick={() => togglePrepared(doc.id)}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15 }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3.5 select-none ${
                      isChecked 
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700' 
                        : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/70 hover:border-amber-300 dark:hover:border-amber-600'
                    }`}
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <AnimatePresence>
                        {isChecked && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-bold transition-all duration-200 ${isChecked ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-80' : 'text-slate-900 dark:text-slate-100'}`}>
                          {doc.title}
                        </h4>
                        <span className="shrink-0 text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                          Conditional
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{doc.description}</p>
                      {doc.condition && (
                        <div className="text-[11px] text-amber-800 dark:text-amber-200 font-medium bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 p-2 rounded-lg mt-1">
                          Condition: {doc.condition}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. OPTIONAL / VALUE-ADD DOCUMENTS */}
        {optionalList.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  3. Supplementary / Faster Processing Documents
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Optional documents that expedite sanctioning and credit appraisal
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {optionalList.map((doc) => {
                const isChecked = Boolean(preparedDocs[doc.id]);
                return (
                  <motion.div 
                    key={doc.id}
                    onClick={() => togglePrepared(doc.id)}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15 }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3.5 select-none ${
                      isChecked 
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <AnimatePresence>
                        {isChecked && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-bold transition-all duration-200 ${isChecked ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-80' : 'text-slate-900 dark:text-slate-100'}`}>
                          {doc.title}
                        </h4>
                        <span className="shrink-0 text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{doc.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Official Submission Note & SCA Channel */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Submission Protocol:</span>
          </div>
          <p className="leading-relaxed">
            Applicants should submit one set of self-attested photocopies along with original documents for physical verification at the District Office of your State Channelising Agency (SCA) or nominated public sector bank branch.
          </p>
        </div>
      </div>
    </div>
  );
};
