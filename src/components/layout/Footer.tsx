import React from 'react';
import { ShieldCheck, ExternalLink, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { APP_CONFIG } from '../../config/appConfig';

interface FooterProps {
  language: Language;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm no-print">
      {/* Upper Sponsoring Ministry Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {APP_CONFIG.corporations.map((corp) => (
            <div key={corp.code} className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-amber-400 text-base">{corp.name}</span>
                <a 
                  href={corp.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 mb-1 leading-snug">{corp.fullName}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{corp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-base">
              श
            </div>
            <span className="text-xl font-bold text-white tracking-tight">{APP_CONFIG.name}</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            {language === 'hi' ? APP_CONFIG.taglineHi : APP_CONFIG.tagline} — An affirmative action fintech solution designed for Smart India Hackathon 2026. Empowering aspiring entrepreneurs from Scheduled Castes, Backward Classes, and sanitation worker families with transparent, deterministic credit scheme discovery.
          </p>
          <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Deterministic Rule Verification</span>
            </span>
            <span className="flex items-center space-x-1 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Hallucination Matching</span>
            </span>
          </div>
        </div>

        {/* Quick Tools */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('wizard')} className="hover:text-white transition">
                Smart Eligibility Wizard
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('schemes')} className="hover:text-white transition">
                All MoSJE Credit Schemes
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('compare')} className="hover:text-white transition">
                Scheme Comparison Matrix
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('emi')} className="hover:text-white transition">
                Reducing-Balance EMI Calculator
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('branches')} className="hover:text-white transition">
                State Channel Partner Locator
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin')} className="hover:text-amber-400 transition text-amber-300 font-medium">
                Admin Rules Engine (Officer Portal)
              </button>
            </li>
          </ul>
        </div>

        {/* Helpline & Hackathon Metadata */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Support & Compliance</h4>
          <div className="space-y-2 text-xs text-slate-400">
            <p className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>National Toll-Free: {APP_CONFIG.tollFreeHelpline}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{APP_CONFIG.supportEmail}</span>
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] leading-relaxed">
              <p className="text-slate-500 font-mono">
                SIH Problem: SIH26092<br />
                Theme: Software | Smart Automation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal & Hackathon Disclaimer Bottom Bar */}
      <div className="bg-slate-950 py-4 px-4 sm:px-8 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <p className="text-center sm:text-left max-w-3xl">
          {t.disclaimerGovNotice}
        </p>
        <div className="flex items-center space-x-4 shrink-0">
          <span className="text-slate-400">SIH 2026 Submission</span>
          <span>•</span>
          <span className="text-amber-500 font-medium">Ministry of Social Justice & Empowerment</span>
        </div>
      </div>
    </footer>
  );
};
