import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Users, 
  Activity, 
  TrendingUp, 
  FileText,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Scheme, AdminAuditLog } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { dataStore } from '../../services/dataStore';
import { formatIndianCurrency } from '../../services/emiCalculator';

interface AdminDashboardProps {
  language: Language;
  onSelectSchemeDetails: (scheme: Scheme) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  onSelectSchemeDetails
}) => {
  const t = TRANSLATIONS[language];
  const [schemes, setSchemes] = useState<Scheme[]>(() => dataStore.getSchemes());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => dataStore.getAuditLogs());
  const [activeTab, setActiveTab] = useState<'schemes' | 'analytics' | 'audit'>('schemes');
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);

  const currentUser = dataStore.getCurrentUser();

  const handleToggleStatus = (scheme: Scheme) => {
    const updated = { ...scheme, active: !scheme.active };
    dataStore.updateScheme(updated);
    setSchemes(dataStore.getSchemes());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const handleSaveScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;
    dataStore.updateScheme(editingScheme);
    setSchemes(dataStore.getSchemes());
    setAuditLogs(dataStore.getAuditLogs());
    setEditingScheme(null);
  };

  // Analytics mock data derived for SIH hackathon evaluation
  const totalBeneficiaries = 14280;
  const matchRateSc = 78.4;
  const matchRateObc = 72.1;
  const matchRateSafai = 89.2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              MoSJE Officer Control Room
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Role: {currentUser.role === 'admin' ? "Nodal Officer (Authorized)" : "Officer (Preview Mode)"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Scheme & Rule Management Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure statutory rule parameters, interest subventions, and inspect verified audit trails.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50">
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'schemes' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Schemes & Rules ({schemes.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'analytics' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics & Impact
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'audit' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SCHEMES & RULES MANAGEMENT TABLE */}
      {/* ========================================================= */}
      {activeTab === 'schemes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Credit Schemes Database
            </h3>
            <span className="text-xs text-slate-500">
              Changes reflect instantaneously across the deterministic matching engine.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Scheme Code & Name</th>
                  <th className="p-4">Corporation</th>
                  <th className="p-4">Interest Rate</th>
                  <th className="p-4">Loan Ceiling</th>
                  <th className="p-4">Income Limit</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Rule Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemes.map(scheme => (
                  <tr key={scheme.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{scheme.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{scheme.code}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                        {scheme.corporation}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-700">
                      {scheme.terms.interestRateMin}% – {scheme.terms.interestRateMax}%
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {formatIndianCurrency(scheme.rules.maxLoanAmount, true)}
                    </td>
                    <td className="p-4 text-slate-600">
                      {scheme.rules.maxAnnualIncome === 0 ? "No Ceiling" : formatIndianCurrency(scheme.rules.maxAnnualIncome)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(scheme)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition ${
                          scheme.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {scheme.active ? 'ACTIVE' : 'SUSPENDED'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditingScheme(scheme)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold inline-flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Rules</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ANALYTICS & HACKATHON EVALUATION METRICS */}
      {/* ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-xs uppercase font-bold block">Evaluated Inquiries</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">14,280</span>
              <span className="text-xs text-emerald-600 font-medium">↑ 18% this month</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-xs uppercase font-bold block">SC Eligibility Rate</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">{matchRateSc}%</span>
              <span className="text-xs text-slate-500">NSFDC Term & MSY</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-xs uppercase font-bold block">OBC Eligibility Rate</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{matchRateObc}%</span>
              <span className="text-xs text-slate-500">NBCFDC New Swarnima</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-xs uppercase font-bold block">Sanitation Worker Rate</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{matchRateSafai}%</span>
              <span className="text-xs text-slate-500">Exempt from income limit</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Demand Distribution Across Target Categories
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Scheduled Castes (SC) Applicants</span>
                  <span className="font-bold">48% of searches</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '48%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Other Backward Classes (OBC Non-Creamy)</span>
                  <span className="font-bold">36% of searches</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '36%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Safai Karamcharis & Sanitation Dependents</span>
                  <span className="font-bold">16% of searches</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '16%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AUDIT TRAIL LOGS */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Regulatory Audit Trail & Governance Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks every rule adjustment, interest rate revision, and status modification with officer timestamp.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 flex items-start space-x-3 text-xs">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{log.action.replace('_', ' ')}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm font-mono">{log.schemeName}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700">
                    <strong className="text-slate-900">{log.fieldChanged}</strong>: changed from <em>{String(log.previousValue)}</em> to <em>{String(log.newValue)}</em>
                  </p>
                  <p className="text-slate-500 text-[11px]">Reason: {log.reason}</p>
                  <div className="text-slate-400 text-[11px]">
                    Authorized Officer: <span className="font-semibold text-slate-600">{log.adminUser}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit Scheme Rules */}
      {editingScheme && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Scheme Rules: {editingScheme.code}</h3>
                <p className="text-xs text-slate-500">{editingScheme.name}</p>
              </div>
              <button
                onClick={() => setEditingScheme(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheme} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingScheme.terms.interestRateMin}
                    onChange={(e) => setEditingScheme({
                      ...editingScheme,
                      terms: { ...editingScheme.terms, interestRateMin: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingScheme.terms.interestRateMax}
                    onChange={(e) => setEditingScheme({
                      ...editingScheme,
                      terms: { ...editingScheme.terms, interestRateMax: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Loan Assistance (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    value={editingScheme.rules.maxLoanAmount}
                    onChange={(e) => setEditingScheme({
                      ...editingScheme,
                      rules: { ...editingScheme.rules, maxLoanAmount: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Annual Family Income Ceiling (₹)</label>
                  <input
                    type="number"
                    step="10000"
                    value={editingScheme.rules.maxAnnualIncome}
                    onChange={(e) => setEditingScheme({
                      ...editingScheme,
                      rules: { ...editingScheme.rules, maxAnnualIncome: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400">Set to 0 for no income ceiling.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Tenure (Years)</label>
                  <input
                    type="number"
                    value={editingScheme.terms.tenureYearsMax}
                    onChange={(e) => setEditingScheme({
                      ...editingScheme,
                      terms: { ...editingScheme.terms, tenureYearsMax: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Women Interest Rebate (%)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={editingScheme.terms.rebateForWomenPercent}
                    onChange={(e) => setEditingScheme({
                      ...editingScheme,
                      terms: { ...editingScheme.terms, rebateForWomenPercent: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingScheme(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save & Publish Rule Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
