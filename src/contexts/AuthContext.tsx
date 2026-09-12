import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export interface UserProfileData {
  id?: string;
  full_name?: string;
  phone?: string;
  gender?: string;
  state_code?: string;
  district?: string;
  beneficiary_categories?: string[];
  annual_family_income?: number;
  project_cost?: number;
  requested_loan_amount?: number;
  personal_contribution?: number;
  business_sector?: string;
  business_stage?: string;
  business_description?: string;
  employment_status?: string;
  education_level?: string;
  technical_training?: boolean;
  experience_years?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfileData | null;
  role: 'entrepreneur' | 'admin';
  loading: boolean;
  error: string | null;
  isDemoUser: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role?: 'entrepreneur' | 'admin') => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfileData>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  setDemoUser: (role: 'entrepreneur' | 'admin') => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_ID_ENTREPRENEUR = '11111111-2222-3333-4444-555555555555';
const DEMO_USER_ID_ADMIN = '99999999-8888-7777-6666-555555555555';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [role, setRole] = useState<'entrepreneur' | 'admin'>('entrepreneur');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  // Initialize auth session from Supabase
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured) {
          setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('[Auth] getSession error:', sessionError.message);
        }

        if (mounted && initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setIsDemoUser(false);
          await loadUserProfileAndRole(initialSession.user.id);
        }
      } catch (err: any) {
        console.error('[Auth] Init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        setIsDemoUser(false);
        await loadUserProfileAndRole(newSession.user.id);
      } else if (!isDemoUser) {
        setProfile(null);
        setRole('entrepreneur');
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch profile and role from Supabase tables
  const loadUserProfileAndRole = async (userId: string) => {
    try {
      // 1. Fetch user role from `user_roles`
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!roleError && roleData?.role) {
        setRole(roleData.role === 'admin' ? 'admin' : 'entrepreneur');
      }

      // 2. Fetch profile from `profiles`
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      console.warn('[Auth] Error fetching profile/role:', err);
    }
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsDemoUser(false);
        await loadUserProfileAndRole(data.user.id);
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during sign in.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    selectedRole: 'entrepreneur' | 'admin' = 'entrepreneur'
  ) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: selectedRole,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      // If user was created, ensure profile in `profiles` exists without duplicates
      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            role: selectedRole,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

          await supabase.from('user_roles').upsert({
            user_id: data.user.id,
            role: selectedRole,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        } catch (dbErr) {
          console.warn('[Auth] Initial profile sync note:', dbErr);
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          setIsDemoUser(false);
          await loadUserProfileAndRole(data.user.id);
          return { success: true };
        } else {
          return {
            success: true,
            requiresVerification: true,
            error: 'Registration submitted! Please check your email to verify your account, or sign in.'
          };
        }
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'An error occurred during registration.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      if (session) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[Auth] SignOut note:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole('entrepreneur');
      setIsDemoUser(false);
    }
  };

  // Update Profile
  const updateProfile = async (data: Partial<UserProfileData>) => {
    const activeUserId = user?.id || (isDemoUser ? (role === 'admin' ? DEMO_USER_ID_ADMIN : DEMO_USER_ID_ENTREPRENEUR) : null);
    
    if (!activeUserId) {
      return { success: false, error: 'User is not authenticated' };
    }

    try {
      const payload = {
        ...data,
        id: activeUserId,
        updated_at: new Date().toISOString(),
      };

      if (user) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' });

        if (upsertError) {
          console.warn('[Auth] Supabase profile upsert error:', upsertError);
          // Still keep state in sync
        }
      }

      setProfile(prev => ({ ...(prev || {}), ...payload }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfileAndRole(user.id);
    }
  };

  // Preset demo personas for judges and hackathon evaluation
  const setDemoUser = (selectedRole: 'entrepreneur' | 'admin') => {
    setIsDemoUser(true);
    setRole(selectedRole);

    const mockId = selectedRole === 'admin' ? DEMO_USER_ID_ADMIN : DEMO_USER_ID_ENTREPRENEUR;
    const mockEmail = selectedRole === 'admin' ? 'nodal.officer@mosje.gov.in' : 'rameshwar.sc@entrepreneur.in';
    const mockName = selectedRole === 'admin' ? 'MoSJE Nodal Officer (Admin)' : 'Rameshwar Kumar';

    const mockUser: any = {
      id: mockId,
      email: mockEmail,
      user_metadata: { full_name: mockName, role: selectedRole },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile({
      id: mockId,
      full_name: mockName,
      phone: '9876543210',
      gender: 'male',
      state_code: 'DL',
      district: 'Central Delhi',
      beneficiary_categories: ['SC'],
      annual_family_income: 180000,
      project_cost: 120000,
      requested_loan_amount: 110000,
      personal_contribution: 10000,
      business_sector: 'retail',
      business_stage: 'starting',
      business_description: 'Micro retail trade and garment shop',
      employment_status: 'unemployed',
      education_level: 'class_10',
      technical_training: true,
      experience_years: 1,
    });
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        error,
        isDemoUser,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
        setDemoUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
