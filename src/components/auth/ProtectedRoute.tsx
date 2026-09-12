import React, { ReactNode } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { Loader2, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRequireAuth?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  onRequireAuth,
}) => {
  const { isAuthenticated, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
        <p className="text-sm font-medium">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please sign in to your SchemeSetu account to view and manage this resource.
        </p>
        {onRequireAuth && (
          <button
            onClick={onRequireAuth}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            Sign In Now
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
