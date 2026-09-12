import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Calculator, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Globe, 
  Menu, 
  X, 
  User, 
  Sparkles,
  Scale
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { APP_CONFIG } from '../../config/appConfig';
import { dataStore } from '../../services/dataStore';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenMitra: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  onOpenMitra
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];
  const currentUser = dataStore.getCurrentUser();

  const toggleUserRole = () => {
    const newRole = currentUser.role === 'admin' ? 'entrepreneur' : 'admin';
    dataStore.setCurrentUser({
      ...currentUser,
      role: newRole,
      name: newRole === 'admin' ? "MoSJE Nodal Officer (Admin)" : "Rameshwar Kumar (Entrepreneur)"
    });
  };

  const navItems = [
    { id: 'landing', label: t.navHome, icon: Building2 },
    { id: 'wizard', label: t.navCheckEligibility, icon: CheckCircle2, highlight: true },
    { id: 'schemes', label: t.navSchemes, icon: FileText },
    { id: 'compare', label: t.navCompare, icon: Scale },
    { id: 'emi', label: t.navEmiCalculator, icon: Calculator },
    { id: 'branches', label: t.navBranchLocator, icon: MapPin },
    { id: 'documents', label: t.navDocuments, icon: FileText },
    { id: 'admin', label: t.navAdmin, icon: ShieldCheck, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Ministry Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="font-medium tracking-wide truncate">
            {language === 'hi' ? APP_CONFIG.ministryHi : APP_CONFIG.ministry}
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400 font-mono text-[11px]">
            SIH26092 | Software & Smart Automation
          </span>
        </div>
        <div className="flex items-center space-x-4 shrink-0 text-[11px]">
          <span className="hidden sm:inline text-emerald-400 font-medium">
            Toll-Free Helpline: {APP_CONFIG.tollFreeHelpline}
          </span>
          <button 
            id="btn-lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center space-x-1 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 text-indigo-400" />
            <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => { setCurrentView('landing'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              श
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {APP_CONFIG.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  MoSJE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {language === 'hi' ? APP_CONFIG.taglineHi : APP_CONFIG.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    item.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 font-semibold'
                      : isActive
                      ? 'text-indigo-700 bg-indigo-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: AI Scheme Mitra + Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Scheme Mitra AI Advisor Trigger */}
            <button
              id="btn-scheme-mitra-nav"
              onClick={onOpenMitra}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition transform hover:-translate-y-0.5"
              title="Ask Scheme Mitra AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Scheme Mitra AI</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Role Demo Toggle (Entrepreneur <-> Admin) */}
            <button
              id="btn-role-switcher"
              onClick={toggleUserRole}
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                currentUser.role === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle between Entrepreneur and Admin mode for SIH Hackathon Evaluation"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[120px]">
                {currentUser.role === 'admin' ? "Role: Admin" : "Role: User"}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <div className="p-2 mb-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs text-slate-600">
            <span>Demo Persona:</span>
            <button 
              onClick={toggleUserRole}
              className="font-bold text-indigo-700 underline"
            >
              Switch to {currentUser.role === 'admin' ? 'Entrepreneur' : 'Admin'}
            </button>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  item.highlight
                    ? 'bg-indigo-600 text-white'
                    : isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
