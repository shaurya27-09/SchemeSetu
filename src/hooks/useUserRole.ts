import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export interface UseUserRoleReturn {
  role: UserRole;
  isAdmin: boolean;
  isUser: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  userId: string | null;
  email: string | null;
  refreshRole: () => Promise<void>;
}

/**
 * Reusable hook to check the authenticated user's role directly from the authoritative session.
 * Does not trust localStorage or client-side tampering.
 */
export function useUserRole(): UseUserRoleReturn {
  const { user, role, loading, refreshProfile } = useAuth();

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && role === 'admin';
  const isUser = isAuthenticated && role === 'user';

  return {
    role,
    isAdmin,
    isUser,
    isAuthenticated,
    loading,
    userId: user?.id || null,
    email: user?.email || null,
    refreshRole: refreshProfile,
  };
}
