import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Calendar, 
  Clock, 
  Info, 
  CheckCircle2, 
  PieChart, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { calculateEmi, formatIndianCurrency, EMI_DISCLAIMER } from '../../services/emiCalculator';
import { calculateEmiViaRpc } from '../../services/supabaseService';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { dataStore } from '../../services/dataStore';
import { Scheme } from '../../types';

interface EmiCalculatorPageProps {
  language: Language;
  selectedScheme?: Scheme | null;
}

export const EmiCalculatorPage: React.FC<EmiCalculatorPageProps> = ({
  language,
  selectedScheme
}) => {
  const t = TRANSLATIONS[language];
  const allSchemes = dataStore.getSchemes().filter(s => s.active);

  const [principal, setPrincipal] = useState<number>(() => {
    return selectedScheme ? selectedScheme.rules.maxLoanAmount / 2 : 200000;
  });

  const [annualRate, setAnnualRate] = useState<number>(() => {
    return selectedScheme ? selectedScheme.terms.interestRateMin : 5.0;
  });

  const [tenureYears, setTenureYears] = useState<number>(() => {
    return selectedScheme ? selectedScheme.terms.tenureYearsMax : 5;
  });

  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(() => {
    return selectedScheme ? selectedScheme.terms.moratoriumMonths : 6;
  });

  const [activeSchemeId, setActiveSchemeId] = useState<string>(selectedScheme?.id || "");

  // Auto populate when choosing scheme preset
  const handleSchemeSelect = (schemeId: string) => {
    setActiveSchemeId(schemeId);
    const found = allSchemes.find(s => s.id === schemeId);
    if (found) {
      setPrincipal(found.rules.maxLoanAmount > 500000 ? 500000 : found.rules.maxLoanAmount);
      setAnnualRate(found.terms.interestRateMin);
      setTenureYears(found.terms.tenureYearsMax);
      setMoratoriumMonths(found.terms.moratoriumMonths);
    }
  };

  // Local immediate calculation for responsive UI
  const localEmiResult = calculateEmi({
    principal,
    annualRate,
    tenureYears,
    moratoriumMonths
  });

  const [rpcResult, setRpcResult] = useState<typeof localEmiResult>(localEmiResult);
  const [isRpcLoading, setIsRpcLoading] = useState<boolean>(false);
  const [isRpcActive, setIsRpcActive] = useState<boolean>(false);

  // Sync with Supabase RPC calculate_emi
  useEffect(() => {
    let active = true;
    setIsRpcLoading(true);

    calculateEmiViaRpc({
      principal,
      annualRate,
      tenureMonths: tenureYears * 12,
      moratoriumMonths,
      interestAccruesDuringMoratorium: false
    }).then(res => {
      if (!active) return;
      const fullComputed = calculateEmi({
        principal: res.principal,
        annualRate: res.annualRate,
        tenureYears: Math.max(0.25, res.tenureMonths / 12),
        moratoriumMonths: res.moratoriumMonths
      });
      setRpcResult({
        ...fullComputed,
        principal: res.principal,
        annualRate: res.annualRate,
        tenureYears: Math.round(res.tenureMonths / 12),
        moratoriumMonths: res.moratoriumMonths,
        monthlyEmi: res.monthlyEmi || fullComputed.monthlyEmi,
        totalInterest: res.totalInterest || fullComputed.totalInterest,
        totalRepayment: res.totalRepayment || fullComputed.totalRepayment,
        disclaimer: res.disclaimer || fullComputed.disclaimer,
        yearlySummary: fullComputed.yearlySummary || [],
        schedule: fullComputed.schedule || []
      });
      setIsRpcActive(true);
      setIsRpcLoading(false);
    }).catch(() => {
      if (active) {
        setRpcResult(localEmiResult);
        setIsRpcLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [principal, annualRate, tenureYears, moratoriumMonths]);

  const emiResult = rpcResult || localEmiResult;

  const principalRatio = emiResult.totalRepayment > 0 
    ? Math.round((emiResult.principal / emiResult.totalRepayment) * 100) 
    : 100;
  const interestRatio = 100 - principalRatio;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Concessional Lending Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Reducing-Balance Method
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Concession Standard Verified</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {t.emiCalcTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.emiCalcSubtitle}
          </p>
        </div>

        {/* Populate from Scheme Preset Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
            Load Scheme Terms:
          </label>
          <select
            id="select-scheme-emi"
            value={activeSchemeId}
            onChange={(e) => handleSchemeSelect(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Custom Values</option>
            {allSchemes.map(s => (
              <option key={s.id} value={s.id}>
                {s.corporation} — {s.name} ({s.terms.interestRateMin}% p.a.)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Loan Parameters</span>
          </h2>

          {/* 1. Principal Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">Loan Principal Amount (P)</span>
              <span className="text-indigo-700 dark:text-indigo-400 font-black text-sm">{formatIndianCurrency(principal)}</span>
            </div>
            <input
              id="slider-emi-principal"
              type="range"
              min="20000"
              max="4500000"
              step="10000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>₹20,000</span>
              <span>₹25 Lakh</span>
              <span>₹45 Lakh (Max)</span>
            </div>
          </div>

          {/* 2. Annual Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">Concessional Annual Interest Rate (r)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{annualRate}% p.a.</span>
            </div>
            <input
              id="slider-emi-rate"
              type="range"
              min="0"
              max="12"
              step="0.25"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>0% (Zero Interest)</span>
              <span>4% - 6% (MoSJE Norm)</span>
              <span>12%</span>
            </div>
          </div>

          {/* 3. Loan Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">Repayment Period (Tenure)</span>
              <span className="text-indigo-700 dark:text-indigo-400 font-black text-sm">{tenureYears} Years ({tenureYears * 12} Months)</span>
            </div>
            <input
              id="slider-emi-tenure"
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>1 Year</span>
              <span>5 Years</span>
              <span>10 Years (Max)</span>
            </div>
          </div>

          {/* 4. Moratorium Period */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">Moratorium / Grace Period</span>
              <span className="text-amber-700 dark:text-amber-400 font-black text-sm">{moratoriumMonths} Months</span>
            </div>
            <input
              id="slider-emi-moratorium"
              type="range"
              min="0"
              max="18"
              step="1"
              value={moratoriumMonths}
              onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>0 Months (Immediate)</span>
              <span>6 Months</span>
              <span>18 Months</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              During the moratorium, the entrepreneur is excused from principal repayment while setting up machinery and generating initial cash flows.
            </p>
          </div>

          {/* Mathematical Formula Footnote */}
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            <strong>Standard Reducing Formula:</strong><br />
            r = rate / 12 / 100, n = tenure_months<br />
            EMI = [P × r × (1+r)ⁿ] / [(1+r)ⁿ - 1]
          </div>
        </div>

        {/* Right Column: Output Card & Visual Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-indigo-900/60 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                Calculated Monthly Installment
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                {formatIndianCurrency(emiResult.monthlyEmi)}
                <span className="text-xs font-normal text-indigo-300 ml-2">/ month</span>
              </div>
            </div>

            {/* Repayment Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-indigo-800 text-xs">
              <div>
                <span className="text-indigo-300 block">Principal Borrowed:</span>
                <span className="text-base font-bold text-white">{formatIndianCurrency(emiResult.principal, true)}</span>
              </div>
              <div>
                <span className="text-indigo-300 block">Total Interest:</span>
                <span className="text-base font-bold text-emerald-400">{formatIndianCurrency(emiResult.totalInterest, true)}</span>
              </div>
              <div>
                <span className="text-indigo-300 block">Total Repayment:</span>
                <span className="text-base font-bold text-amber-300">{formatIndianCurrency(emiResult.totalRepayment, true)}</span>
              </div>
            </div>

            {/* Visual Ratio Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-200">Principal ({principalRatio}%)</span>
                <span className="text-emerald-300">Interest ({interestRatio}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 flex overflow-hidden">
                <div 
                  className="bg-indigo-500 h-3 transition-all duration-300"
                  style={{ width: `${principalRatio}%` }}
                ></div>
                <div 
                  className="bg-emerald-400 h-3 transition-all duration-300"
                  style={{ width: `${interestRatio}%` }}
                ></div>
              </div>
            </div>

            {/* Mandatory Disclaimer */}
            <div className="p-3 bg-indigo-950/80 rounded-xl border border-indigo-800/80 text-[11px] text-indigo-200 leading-relaxed">
              <strong>Statutory Notice:</strong> {EMI_DISCLAIMER}
            </div>
          </div>

          {/* Yearly Amortization Schedule Summary */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Year-by-Year Amortization Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2">Year</th>
                    <th className="py-2">Principal Paid</th>
                    <th className="py-2">Interest Paid</th>
                    <th className="py-2 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(emiResult.yearlySummary || []).map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="py-2 font-bold text-slate-700 dark:text-slate-300">Year {row.year}</td>
                      <td className="py-2 text-slate-900 dark:text-white">{formatIndianCurrency(row.principalPaid)}</td>
                      <td className="py-2 text-emerald-700 dark:text-emerald-400 font-medium">{formatIndianCurrency(row.interestPaid)}</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{formatIndianCurrency(row.endingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
