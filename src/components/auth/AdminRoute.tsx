import React, { ReactNode } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { ShieldAlert, ArrowLeft, LogIn, Loader2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../../utils/translations';

interface AdminRouteProps {
  children: ReactNode;
  language?: Language;
  onNavigateHome: () => void;
  onOpenAuth?: () => void;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  language = 'en',
  onNavigateHome,
  onOpenAuth,
}) => {
  const { isAuthenticated, isAdmin, loading, email, role } = useUserRole();
  const t = TRANSLATIONS[language];

  // 1. Loading state while verifying role
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-slate-500 dark:text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {language === 'hi' ? 'प्रशासनिक भूमिका सत्यापित की जा रही है...' : 'Verifying administrative privileges...'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Checking user_roles table
        </p>
      </div>
    );
  }

  // 2. Unauthenticated user -> Prompt login or redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <LogIn className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {language === 'hi' ? 'एडमिन प्रमाणीकरण आवश्यक' : 'Admin Login Required'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {language === 'hi' 
                ? 'एडमिन पोर्टल तक केवल अधिकृत नोडल अधिकारी और व्यवस्थापक ही पहुंच सकते हैं।' 
                : 'The admin portal is strictly restricted to verified ministry administrators. Please sign in.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToHome || 'Return to Home'}</span>
            </button>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'साइन इन करें' : 'Sign In as Admin'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated normal user without admin role -> 403 Forbidden Page
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 text-xs font-mono font-bold tracking-wider uppercase">
              <span>HTTP 403 FORBIDDEN</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'hi' ? '403 - अनाधिकृत पहुंच' : '403 - Unauthorized Access'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              {language === 'hi'
                ? 'आपके खाते के पास इस प्रशासनिक क्षेत्र तक पहुंचने की अनुमति नहीं है। केवल user_roles में "admin" भूमिका वाले उपयोगकर्ता ही इस पृष्ठ तक पहुंच सकते हैं।'
                : 'Your current account does not have administrator privileges. Only authenticated users with role "admin" in user_roles are authorized.'}
            </p>
          </div>

          {/* User Details box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs font-mono space-y-1">
            <div className="text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Authenticated User:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{email || 'Citizen'}</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Assigned Role:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 uppercase">{role}</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Required Role:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">admin</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToHome || 'Return to Homepage'}</span>
            </button>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                {language === 'hi' ? 'अन्य खाते से लॉगिन करें' : 'Switch Account'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated admin -> Render protected content
  return <>{children}</>;
};
