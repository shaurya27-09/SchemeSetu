import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Calculator, 
  MapPin, 
  FileText, 
  Globe, 
  Menu, 
  X, 
  Sparkles,
  Scale,
  Bookmark,
  LogIn,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { APP_CONFIG } from '../../config/appConfig';
import { dataStore } from '../../services/dataStore';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { AnimatedBackground } from '../motion-primitives';

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);

  const { user, profile, role } = useAuth();
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

  const checkScrollButtons = useCallback(() => {
    const container = navScrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    // 2px tolerance for subpixel rounding
    const canLeft = scrollLeft > 2;
    const canRight = scrollLeft < scrollWidth - clientWidth - 2;

    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);
  }, []);

  const scrollNav = (direction: 'left' | 'right') => {
    const container = navScrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScrollButtons();
    const timer = setTimeout(checkScrollButtons, 60);

    const container = navScrollRef.current;
    if (!container) return () => clearTimeout(timer);

    window.addEventListener('resize', checkScrollButtons);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        checkScrollButtons();
      });
      resizeObserver.observe(container);
      if (container.firstElementChild) {
        resizeObserver.observe(container.firstElementChild);
      }
    }

    // Support mouse wheel horizontal translation without hijacking normal page scrolling
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      const isScrollingDown = e.deltaY > 0;
      const isScrollingUp = e.deltaY < 0;

      const canRightNow = container.scrollLeft < maxScroll - 2;
      const canLeftNow = container.scrollLeft > 2;

      if ((isScrollingDown && canRightNow) || (isScrollingUp && canLeftNow)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
        checkScrollButtons();
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollButtons);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      container.removeEventListener('wheel', onWheel);
    };
  }, [checkScrollButtons, role, language, savedCount]);

  // Keep active item in visible scroll area when active view changes
  useEffect(() => {
    if (currentView && navScrollRef.current) {
      const activeBtn = navScrollRef.current.querySelector<HTMLElement>(`#nav-link-${currentView}`);
      if (activeBtn) {
        const container = navScrollRef.current;
        const btnLeft = activeBtn.offsetLeft;
        const btnRight = btnLeft + activeBtn.offsetWidth;
        const scrollLeft = container.scrollLeft;
        const scrollRight = scrollLeft + container.clientWidth;

        if (btnLeft < scrollLeft) {
          container.scrollTo({ left: Math.max(0, btnLeft - 16), behavior: 'smooth' });
        } else if (btnRight > scrollRight) {
          container.scrollTo({ left: btnRight - container.clientWidth + 16, behavior: 'smooth' });
        }
      }
    }
  }, [currentView]);

  const rawName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Citizen';
  // Strip out parenthetical roles like (Nodal Officer) and domain/email noise from header button
  const cleanName = rawName.split('(')[0].trim() || 'Citizen';
  const displayName = cleanName;

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Top Ministry Ribbon */}
      <div className="w-full max-w-full bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 text-xs py-1 px-3 sm:px-6 lg:px-8 flex justify-between items-center border-b border-slate-800 dark:border-slate-900 overflow-hidden">
        <div className="flex items-center space-x-2 min-w-0 pr-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span>
          <span className="font-medium tracking-wide truncate">
            {language === 'hi' ? APP_CONFIG.ministryHi : APP_CONFIG.ministry}
          </span>
          <span className="hidden md:inline text-slate-500 shrink-0">•</span>
          <span className="hidden md:inline text-slate-400 font-mono text-[11px] truncate">
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
            className="flex items-center space-x-1 hover:text-white px-2 py-0.5 rounded bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 transition cursor-pointer shrink-0"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="w-full max-w-full px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between w-full max-w-full min-w-0 h-16 gap-2">
          {/* AREA 1 - LEFT: Logo & Brand */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0"
            onClick={() => { setCurrentView('landing'); }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
              श
            </div>
            <div className="shrink-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                  {APP_CONFIG.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 shrink-0">
                  MoSJE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block whitespace-nowrap">
                {language === 'hi' ? APP_CONFIG.taglineHi : APP_CONFIG.tagline}
              </p>
            </div>
          </div>

          {/* AREA 2 - CENTER: Desktop Navigation Links with Fixed Scroll Controls */}
          <div className="hidden lg:flex items-center min-w-0 flex-1 mx-1.5 sm:mx-2">
            {/* Left Scroll Button - Fixed next to scrollable items */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollNav('left')}
                aria-label="Scroll navigation left"
                className="shrink-0 mr-1.5 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                title="Scroll navigation left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Scroll Container Wrapper with subtle edge fades */}
            <div className="relative flex-1 min-w-0 overflow-hidden py-1">
              {/* Subtle Left Edge Fade */}
              {canScrollLeft && (
                <div 
                  className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10"
                  aria-hidden="true" 
                />
              )}

              {/* Scrollable Navigation Items */}
              <nav
                ref={navScrollRef}
                onScroll={checkScrollButtons}
                className="flex-1 min-w-0 overflow-x-auto scroll-smooth nav-scroll"
                aria-label="Main Navigation"
              >
                <div className="flex items-center gap-1 w-max">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`nav-link-${item.id}`}
                        onClick={() => setCurrentView(item.id)}
                        className={`relative shrink-0 flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                          item.highlight
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-none'
                            : isActive
                            ? 'text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isActive && !item.highlight && (
                          <AnimatedBackground
                            layoutId="navbar-active-pill"
                            className="absolute inset-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70 shadow-xs"
                          />
                        )}
                        <Icon className={`w-3.5 h-3.5 shrink-0 relative z-10 ${item.highlight ? 'text-white' : isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'}`} />
                        <span className="whitespace-nowrap relative z-10">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold shrink-0 relative z-10">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Admin Portal in scrollable nav (Strictly visible only if role === 'admin') */}
                  {role === 'admin' && (
                    <button
                      id="nav-link-admin"
                      onClick={() => setCurrentView('admin')}
                      className={`relative shrink-0 flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        currentView === 'admin' || currentView === 'admin_new_scheme'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60'
                      }`}
                      title="Ministry Administrator Portal"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300 shrink-0" />
                      <span className="whitespace-nowrap">{t.navAdmin || 'Admin Portal'}</span>
                    </button>
                  )}
                </div>
              </nav>

              {/* Subtle Right Edge Fade */}
              {canScrollRight && (
                <div 
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10"
                  aria-hidden="true" 
                />
              )}
            </div>

            {/* Right Scroll Button - Fixed next to scrollable items */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollNav('right')}
                aria-label="Scroll navigation right"
                className="shrink-0 ml-1.5 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                title="Scroll navigation right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AREA 3 - RIGHT: Responsive Right Controls */}
          <div className="shrink-0 flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            {/* Scheme Mitra AI Assistant Trigger */}
            <button
              id="btn-scheme-mitra-nav"
              onClick={onOpenMitra}
              className="shrink-0 flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold px-2 sm:px-2.5 xl:px-3 py-1.5 rounded-lg shadow-xs transition transform hover:-translate-y-0.5 cursor-pointer"
              title="Ask Scheme Mitra AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100 shrink-0" />
              <span className="hidden xl:inline">Scheme Mitra</span>
              <span className="hidden sm:inline xl:hidden">Mitra</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Dark Mode Theme Toggle */}
            <ThemeToggle variant="dropdown" />

            {/* Compact Language Selector */}
            <button 
              id="btn-lang-toggle-nav"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="shrink-0 flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold transition cursor-pointer"
              title={language === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold text-xs">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Profile or Login Button */}
            {user ? (
              <button
                id="btn-user-profile-nav"
                onClick={onOpenProfile}
                className="shrink-0 flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold transition cursor-pointer max-w-[120px] sm:max-w-[150px] xl:max-w-[180px]"
                title={`User Profile: ${cleanName}`}
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {cleanName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate whitespace-nowrap hidden sm:inline">{cleanName}</span>
              </button>
            ) : (
              <button
                id="btn-login-nav"
                onClick={onOpenAuth}
                className="shrink-0 flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-400 text-xs font-semibold transition cursor-pointer"
                title="Sign in or create account"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button (visible on mobile / small tablets) */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Visible when toggled on mobile/tablet) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-1.5 shadow-lg w-full max-w-full">
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

          {/* Mobile Admin Portal Item (role === 'admin' only) */}
          {role === 'admin' && (
            <button
              id="mobile-nav-link-admin"
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                currentView === 'admin' || currentView === 'admin_new_scheme'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <span>{t.navAdmin || 'Admin Portal'}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-200 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 text-[10px] font-bold uppercase">
                Admin
              </span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
