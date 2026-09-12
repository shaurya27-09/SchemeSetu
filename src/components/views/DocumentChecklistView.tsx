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
  Building
} from 'lucide-react';
import { Scheme, ApplicantProfile, DocumentRequirement } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { generateDocumentChecklist } from '../../services/documentService';
import { dataStore } from '../../services/dataStore';

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
  const checklist = generateDocumentChecklist(activeScheme, activeProfile);
  const [preparedDocs, setPreparedDocs] = useState<Record<string, boolean>>({});

  const togglePrepared = (docId: string) => {
    setPreparedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const totalMandatory = checklist.mandatory.length + checklist.conditional.length;
  const preparedCount = Object.values(preparedDocs).filter(Boolean).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Scheme Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Personalized Dossier Generator
            </span>
            <span className="text-xs text-slate-500 font-mono">
              MoSJE Compliance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Document Checklist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalized verification checklist required by State Channelising Agencies (SCAs) and banks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">Select Scheme:</label>
            <select
              value={activeScheme.id}
              onChange={(e) => {
                const found = allSchemes.find(s => s.id === e.target.value);
                if (found) onSelectScheme(found);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
            >
              {allSchemes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.corporation} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Checklist (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Card */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Printable Header Banner */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-sm">
                {activeScheme.corporation}
              </span>
              <span className="text-xs font-mono text-slate-500">{activeScheme.code}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {activeScheme.name}
            </h2>
            <p className="text-xs text-slate-500">
              {activeScheme.corporationFullName} • Verified Submission Checklist
            </p>
          </div>

          {/* Prepared status indicator */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right no-print">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Dossier Readiness</span>
            <span className="text-sm font-bold text-slate-800">
              {preparedCount} of {totalMandatory + checklist.optional.length} Documents Prepared
            </span>
          </div>
        </div>

        {/* 1. MANDATORY STATUTORY DOCUMENTS */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Mandatory Documents (Required for All Applicants)
            </h3>
          </div>

          <div className="space-y-3">
            {checklist.mandatory.map((doc) => {
              const isChecked = Boolean(preparedDocs[doc.id]);
              return (
                <div 
                  key={doc.id}
                  onClick={() => togglePrepared(doc.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                    isChecked 
                      ? 'bg-emerald-50/60 border-emerald-300' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 text-indigo-600 rounded-sm focus:ring-indigo-500 w-4 h-4"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-bold ${isChecked ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                        {doc.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                        Mandatory
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Issuing Authority: <strong className="text-slate-600">{doc.issuingAuthority}</strong></span>
                      {doc.formats && <span>Format: {doc.formats.join(', ')}</span>}
                      {doc.validity && <span>Validity: {doc.validity}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. CONDITIONAL DOCUMENTS */}
        {checklist.conditional.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Conditional Documents (Based on Project Size or Sector)
              </h3>
            </div>

            <div className="space-y-3">
              {checklist.conditional.map((doc) => {
                const isChecked = Boolean(preparedDocs[doc.id]);
                return (
                  <div 
                    key={doc.id}
                    onClick={() => togglePrepared(doc.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                      isChecked 
                        ? 'bg-emerald-50/60 border-emerald-300' 
                        : 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-1 text-indigo-600 rounded-sm focus:ring-indigo-500 w-4 h-4"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold ${isChecked ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                          {doc.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Conditional
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>
                      {doc.condition && (
                        <div className="text-[11px] text-amber-800 font-medium bg-amber-100/60 p-2 rounded-lg mt-1">
                          Condition: {doc.condition}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. OPTIONAL / VALUE-ADD DOCUMENTS */}
        {checklist.optional.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Supplementary / Faster Processing Documents
              </h3>
            </div>

            <div className="space-y-3">
              {checklist.optional.map((doc) => {
                const isChecked = Boolean(preparedDocs[doc.id]);
                return (
                  <div 
                    key={doc.id}
                    onClick={() => togglePrepared(doc.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                      isChecked 
                        ? 'bg-emerald-50/60 border-emerald-300' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-1 text-indigo-600 rounded-sm focus:ring-indigo-500 w-4 h-4"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold ${isChecked ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                          {doc.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Official Submission Note & SCA Channel */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Submission Protocol:</span>
          </div>
          <p>
            Applicants should submit one set of self-attested photocopies along with original documents for physical verification at the District Office of your State Channelising Agency (SCA) or nominated public sector bank branch.
          </p>
        </div>
      </div>
    </div>
  );
};
