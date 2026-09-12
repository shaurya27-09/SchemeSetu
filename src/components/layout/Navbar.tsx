import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Calculator, 
  MapPin, 
  FileText, 
  Globe, 
  Menu, 
  X, 
  User, 
  Sparkles,
  Scale,
  Bookmark,
  LogIn
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { APP_CONFIG } from '../../config/appConfig';
import { dataStore } from '../../services/dataStore';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenMitra: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  onOpenMitra,
  onOpenAuth,
  onOpenProfile
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(() => dataStore.getSavedSchemeIds().length);
  const { user, profile } = useAuth();
  const t = TRANSLATIONS[language];

  useEffect(() => {
    return dataStore.subscribe(() => {
      setSavedCount(dataStore.getSavedSchemeIds().length);
    });
  }, []);

  const navItems = [
    { id: 'landing', label: t.navHome || 'Home', icon: Building2 },
    { id: 'wizard', label: 'Find Schemes', icon: CheckCircle2, highlight: true },
    { id: 'schemes', label: 'Explore Schemes', icon: FileText },
    { id: 'compare', label: t.navCompare || 'Compare', icon: Scale },
    { id: 'emi', label: 'EMI Calculator', icon: Calculator },
    { id: 'branches', label: 'Branch Locator', icon: MapPin },
    { id: 'documents', label: 'Documents', icon: FileText },
    { 
      id: 'saved', 
      label: 'Saved Schemes', 
      icon: Bookmark, 
      badge: savedCount > 0 ? savedCount : undefined 
    },
  ];

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Citizen';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Top Ministry Ribbon */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 text-xs py-1 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800 dark:border-slate-900">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span>
          <span className="font-medium tracking-wide truncate">
            {language === 'hi' ? APP_CONFIG.ministryHi : APP_CONFIG.ministry}
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400 font-mono text-[11px]">
            National Credit & Concessional Lending Portal
          </span>
        </div>
        <div className="flex items-center space-x-3 shrink-0 text-[11px]">
          <span className="hidden sm:inline text-emerald-400 font-medium">
            Toll-Free: {APP_CONFIG.tollFreeHelpline}
          </span>
          <button 
            id="btn-lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center space-x-1 hover:text-white px-2 py-0.5 rounded bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 transition cursor-pointer"
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
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            onClick={() => { setCurrentView('landing'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              श
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {APP_CONFIG.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  MoSJE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {language === 'hi' ? APP_CONFIG.taglineHi : APP_CONFIG.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    item.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-none'
                      : isActive
                      ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-white' : isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Scheme Mitra + Theme Toggle + Auth/Profile */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Scheme Mitra AI Assistant Trigger */}
            <button
              id="btn-scheme-mitra-nav"
              onClick={onOpenMitra}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 cursor-pointer"
              title="Ask Scheme Mitra AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100" />
              <span className="hidden sm:inline">Scheme Mitra</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Dark Mode Theme Toggle */}
            <ThemeToggle variant="dropdown" />

            {/* Profile or Login Button */}
            {user ? (
              <button
                id="btn-user-profile-nav"
                onClick={onOpenProfile}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold transition cursor-pointer"
                title="View and edit citizen profile"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[100px] hidden md:inline">{displayName}</span>
              </button>
            ) : (
              <button
                id="btn-login-nav"
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold transition cursor-pointer"
                title="Sign in or create account"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-1.5 shadow-lg">
          {/* Mobile Profile Banner */}
          {user ? (
            <div 
              onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
              className="p-3 mb-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{displayName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{user.email}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">View Profile →</span>
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="w-full p-2.5 mb-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          )}

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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  item.highlight
                    ? 'bg-indigo-600 text-white font-bold'
                    : isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
