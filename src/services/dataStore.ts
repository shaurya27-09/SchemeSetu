import { Scheme, SchemeRule, ChannelPartnerBranch, ApplicantProfile, UserAccount } from '../types';
import { INITIAL_SCHEMES, INITIAL_BRANCHES } from '../data/seedSchemes';
import { 
  getOfficialSchemes, 
  getBranchesFromDb,
  fetchUserSavedSchemeIds,
  toggleSaveScheme,
  fetchDocumentChecklist,
  saveDocumentChecklist,
  updateSchemeAdminStatus
} from './supabaseService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const SCHEMES_STORAGE_KEY = 'schemesetu_schemes_v1';
const BRANCHES_STORAGE_KEY = 'schemesetu_branches_v1';
const PROFILE_STORAGE_KEY = 'schemesetu_saved_profile_v1';
const CHECKLIST_STORAGE_KEY = 'schemesetu_checklists_v1';
const USER_STORAGE_KEY = 'schemesetu_current_user_v1';
const SAVED_SCHEMES_KEY = 'schemesetu_saved_schemes_v1';

export class DataStore {
  private static instance: DataStore;
  private schemes: Scheme[] = [];
  private branches: ChannelPartnerBranch[] = [];
  private savedSchemeIds: string[] = [];
  private listeners: Set<() => void> = new Set();
  private isSupabaseLoaded: boolean = false;

  private constructor() {
    this.loadInitialData();
    this.syncWithSupabase();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  private loadInitialData() {
    try {
      const storedSchemes = localStorage.getItem(SCHEMES_STORAGE_KEY);
      if (storedSchemes) {
        this.schemes = JSON.parse(storedSchemes);
      } else {
        this.schemes = [...INITIAL_SCHEMES];
        this.persistSchemes();
      }

      const storedBranches = localStorage.getItem(BRANCHES_STORAGE_KEY);
      if (storedBranches) {
        this.branches = JSON.parse(storedBranches);
      } else {
        this.branches = [...INITIAL_BRANCHES];
        this.persistBranches();
      }

      const storedSaved = localStorage.getItem(SAVED_SCHEMES_KEY);
      if (storedSaved) {
        this.savedSchemeIds = JSON.parse(storedSaved);
      }
    } catch (e) {
      console.warn("Storage access fallback to memory:", e);
      this.schemes = [...INITIAL_SCHEMES];
      this.branches = [...INITIAL_BRANCHES];
    }
  }

  /**
   * Asynchronously queries Supabase for verified schemes and branches
   */
  public async syncWithSupabase() {
    try {
      const [remoteSchemes, remoteBranches] = await Promise.all([
        getOfficialSchemes(),
        getBranchesFromDb()
      ]);

      if (remoteSchemes && remoteSchemes.length > 0) {
        this.schemes = remoteSchemes;
        this.persistSchemes();
      }

      if (remoteBranches && remoteBranches.length > 0) {
        this.branches = remoteBranches;
        this.persistBranches();
      }

      // Sync saved schemes from Supabase if authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const remoteSaved = await fetchUserSavedSchemeIds(userData.user.id);
        if (remoteSaved && remoteSaved.length > 0) {
          this.savedSchemeIds = Array.from(new Set([...this.savedSchemeIds, ...remoteSaved]));
          this.persistSavedSchemes();
        }
      }

      this.isSupabaseLoaded = true;
      this.notify();
    } catch (err) {
      console.warn('[DataStore] Supabase background sync note:', err);
    }
  }

  private persistSchemes() {
    try {
      localStorage.setItem(SCHEMES_STORAGE_KEY, JSON.stringify(this.schemes));
    } catch (e) {
      console.warn("Failed to persist schemes:", e);
    }
    this.notify();
  }

  private persistBranches() {
    try {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(this.branches));
    } catch (e) {
      console.warn("Failed to persist branches:", e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // Scheme Queries & Operations
  public getSchemes(): Scheme[] {
    return [...this.schemes];
  }

  public getSchemeById(id: string): Scheme | undefined {
    return this.schemes.find(s => s.id === id);
  }

  public updateSchemeRule(
    schemeId: string,
    ruleUpdates: Partial<SchemeRule>
  ): { success: boolean; scheme?: Scheme; message?: string } {
    const schemeIndex = this.schemes.findIndex(s => s.id === schemeId);
    if (schemeIndex === -1) {
      return { success: false, message: "Scheme not found" };
    }

    const scheme = this.schemes[schemeIndex];
    const updatedRule: SchemeRule = {
      ...scheme.rules,
      ...ruleUpdates,
      lastVerifiedAt: new Date().toISOString().split('T')[0]
    };

    this.schemes[schemeIndex] = {
      ...scheme,
      rules: updatedRule,
      lastVerifiedAt: new Date().toISOString().split('T')[0]
    };

    this.persistSchemes();
    return { success: true, scheme: this.schemes[schemeIndex] };
  }

  public updateSchemeTerms(
    schemeId: string,
    termUpdates: Partial<Scheme['terms']>
  ): boolean {
    const schemeIndex = this.schemes.findIndex(s => s.id === schemeId);
    if (schemeIndex === -1) return false;

    const scheme = this.schemes[schemeIndex];
    this.schemes[schemeIndex] = {
      ...scheme,
      terms: {
        ...scheme.terms,
        ...termUpdates
      },
      lastVerifiedAt: new Date().toISOString().split('T')[0]
    };

    this.persistSchemes();
    return true;
  }

  public toggleSchemeActive(schemeId: string): boolean {
    const scheme = this.schemes.find(s => s.id === schemeId);
    if (!scheme) return false;

    scheme.active = !scheme.active;
    this.persistSchemes();
    
    // Background sync with Supabase
    updateSchemeAdminStatus(schemeId, scheme.active).catch(err => {
      console.warn('[DataStore] toggleSchemeActive Supabase sync note:', err);
    });

    return true;
  }

  public addScheme(newScheme: Scheme): boolean {
    // Check for duplicate code
    const existingIndex = this.schemes.findIndex(s => s.id === newScheme.id || s.code === newScheme.code);
    if (existingIndex >= 0) {
      this.schemes[existingIndex] = newScheme;
    } else {
      this.schemes.unshift(newScheme);
    }
    this.persistSchemes();
    return true;
  }

  public updateScheme(updatedScheme: Scheme): boolean {
    const index = this.schemes.findIndex(s => s.id === updatedScheme.id);
    if (index === -1) return false;
    this.schemes[index] = { ...updatedScheme, lastVerifiedAt: new Date().toISOString().split('T')[0] };
    this.persistSchemes();
    return true;
  }

  public resetToDefaults() {
    this.schemes = [...INITIAL_SCHEMES];
    this.branches = [...INITIAL_BRANCHES];
    this.persistSchemes();
    this.persistBranches();
  }

  public getBranches(state?: string, district?: string, agencyType?: string): ChannelPartnerBranch[] {
    return this.branches.filter(b => {
      if (state && state !== 'ALL' && b.state.toLowerCase() !== state.toLowerCase()) return false;
      if (district && district !== 'ALL' && b.district.toLowerCase() !== district.toLowerCase()) return false;
      if (agencyType && agencyType !== 'ALL' && b.agencyType !== agencyType) return false;
      return true;
    });
  }

  // Profile Persistence (save partially completed & finished profiles)
  public saveProfile(profile: ApplicantProfile) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        ...profile,
        updatedAt: new Date().toISOString()
      }));

      // If user is authenticated, sync to Supabase `profiles` table
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          supabase.from('profiles').upsert({
            id: data.user.id,
            annual_family_income: profile.annualFamilyIncome,
            project_cost: profile.projectCost,
            requested_loan_amount: profile.requestedLoanAmount,
            personal_contribution: profile.personalContribution,
            business_sector: profile.businessSector,
            business_stage: profile.businessStage,
            business_description: profile.businessDescription,
            employment_status: profile.employmentStatus,
            education_level: profile.educationLevel,
            technical_training: profile.technicalTraining,
            experience_years: profile.experienceYears,
            gender: profile.gender,
            state_code: profile.state,
            district: profile.district,
            beneficiary_categories: [profile.category],
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' }).then(({ error }) => {
            if (error) console.warn('[DataStore] Profile sync to Supabase note:', error.message);
          });
        }
      }).catch(console.warn);

    } catch (e) {
      console.warn("Failed to save profile:", e);
    }
  }

  public getSavedProfile(): ApplicantProfile | null {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to read profile:", e);
    }
    return null;
  }

  // Document Checklist Tracking
  public getCompletedChecklistDocs(schemeId: string): string[] {
    try {
      const stored = localStorage.getItem(`${CHECKLIST_STORAGE_KEY}_${schemeId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  public toggleChecklistDoc(schemeId: string, docCode: string): string[] {
    try {
      const current = this.getCompletedChecklistDocs(schemeId);
      let updated: string[];
      if (current.includes(docCode)) {
        updated = current.filter(c => c !== docCode);
      } else {
        updated = [...current, docCode];
      }
      localStorage.setItem(`${CHECKLIST_STORAGE_KEY}_${schemeId}`, JSON.stringify(updated));

      // Sync to Supabase if user authenticated
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          saveDocumentChecklist(data.user.id, schemeId, updated).catch(console.warn);
        }
      }).catch(console.warn);

      return updated;
    } catch (e) {
      return [];
    }
  }

  // Saved Schemes / Bookmarks
  public getSavedSchemeIds(): string[] {
    return [...this.savedSchemeIds];
  }

  public isSchemeSaved(schemeId: string): boolean {
    return this.savedSchemeIds.includes(schemeId);
  }

  public async toggleSaveScheme(schemeId: string): Promise<boolean> {
    const wasAlreadySaved = this.savedSchemeIds.includes(schemeId);
    let isSaved = false;
    if (wasAlreadySaved) {
      this.savedSchemeIds = this.savedSchemeIds.filter(id => id !== schemeId);
      isSaved = false;
    } else {
      this.savedSchemeIds.push(schemeId);
      isSaved = true;
    }
    this.persistSavedSchemes();

    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await toggleSaveScheme(data.user.id, schemeId, wasAlreadySaved);
      }
    } catch (err) {
      console.warn('[DataStore] toggleSaveScheme Supabase note:', err);
    }

    return isSaved;
  }

  private persistSavedSchemes() {
    try {
      localStorage.setItem(SAVED_SCHEMES_KEY, JSON.stringify(this.savedSchemeIds));
    } catch (e) {
      console.warn("Failed to persist saved schemes:", e);
    }
    this.notify();
  }

  // Current User
  public getCurrentUser(): UserAccount {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    const defaultUser: UserAccount = {
      id: "demo-user-01",
      email: "citizen.applicant@nic.in",
      name: "Rameshwar Kumar",
      role: "user",
      createdAt: new Date().toISOString()
    };
    return defaultUser;
  }

  public setCurrentUser(user: UserAccount) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      this.notify();
    } catch (e) {}
  }
}

export const dataStore = DataStore.getInstance();
