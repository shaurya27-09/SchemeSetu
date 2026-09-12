import { Scheme, SchemeRule, ChannelPartnerBranch, AdminAuditLog, ApplicantProfile, EligibilityResult, UserAccount } from '../types';
import { INITIAL_SCHEMES, INITIAL_BRANCHES } from '../data/seedSchemes';

const SCHEMES_STORAGE_KEY = 'schemesetu_schemes_v1';
const BRANCHES_STORAGE_KEY = 'schemesetu_branches_v1';
const AUDIT_STORAGE_KEY = 'schemesetu_audit_logs_v1';
const PROFILE_STORAGE_KEY = 'schemesetu_saved_profile_v1';
const CHECKLIST_STORAGE_KEY = 'schemesetu_checklists_v1';
const USER_STORAGE_KEY = 'schemesetu_current_user_v1';

export class DataStore {
  private static instance: DataStore;
  private schemes: Scheme[] = [];
  private branches: ChannelPartnerBranch[] = [];
  private auditLogs: AdminAuditLog[] = [];
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.loadInitialData();
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

      const storedAudit = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      } else {
        this.auditLogs = [
          {
            id: "audit-init-01",
            timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
            adminUser: "System Admin (MoSJE IT Cell)",
            action: "UPDATE_RULE",
            targetSchemeId: "nsfdc-term-loan-01",
            schemeName: "NSFDC Term Loan Scheme",
            fieldChanged: "maxAnnualIncome",
            previousValue: 150000,
            newValue: 300000,
            reason: "Annual income eligibility ceiling revised upward as per Ministry Gazette Notification."
          },
          {
            id: "audit-init-02",
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            adminUser: "System Admin (MoSJE IT Cell)",
            action: "UPDATE_TERMS",
            targetSchemeId: "nbcfdc-new-swarnima-04",
            schemeName: "NBCFDC New Swarnima Special Scheme for Women",
            fieldChanged: "interestRateMin",
            previousValue: "6.0%",
            newValue: "5.0%",
            reason: "Interest subvention enhanced for female OBC micro-entrepreneurs."
          }
        ];
        this.persistAudit();
      }
    } catch (e) {
      console.warn("Storage access fallback to memory:", e);
      this.schemes = [...INITIAL_SCHEMES];
      this.branches = [...INITIAL_BRANCHES];
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

  private persistAudit() {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn("Failed to persist audit logs:", e);
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
    ruleUpdates: Partial<SchemeRule>,
    reason: string,
    adminUser: string = "Admin Officer"
  ): { success: boolean; scheme?: Scheme; message?: string } {
    const schemeIndex = this.schemes.findIndex(s => s.id === schemeId);
    if (schemeIndex === -1) {
      return { success: false, message: "Scheme not found" };
    }

    const scheme = this.schemes[schemeIndex];
    const oldRule = { ...scheme.rules };

    // Record audit entries for changed fields
    Object.keys(ruleUpdates).forEach((key) => {
      const field = key as keyof SchemeRule;
      const prevVal = oldRule[field];
      const newVal = ruleUpdates[field];
      if (prevVal !== undefined && newVal !== undefined && prevVal !== newVal) {
        this.auditLogs.unshift({
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          adminUser,
          action: "UPDATE_RULE",
          targetSchemeId: schemeId,
          schemeName: scheme.name,
          fieldChanged: field,
          previousValue: Array.isArray(prevVal) ? prevVal.join(',') : String(prevVal),
          newValue: Array.isArray(newVal) ? newVal.join(',') : String(newVal),
          reason: reason || "Administrative guideline revision"
        });
      }
    });

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
    this.persistAudit();

    return { success: true, scheme: this.schemes[schemeIndex] };
  }

  public updateSchemeTerms(
    schemeId: string,
    termUpdates: Partial<Scheme['terms']>,
    reason: string,
    adminUser: string = "Admin Officer"
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

    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      adminUser,
      action: "UPDATE_TERMS",
      targetSchemeId: schemeId,
      schemeName: scheme.name,
      fieldChanged: "terms",
      previousValue: "Terms updated",
      newValue: JSON.stringify(termUpdates),
      reason: reason || "Financial policy rate update"
    });

    this.persistSchemes();
    this.persistAudit();
    return true;
  }

  public toggleSchemeActive(schemeId: string, adminUser: string = "Admin Officer"): boolean {
    const scheme = this.schemes.find(s => s.id === schemeId);
    if (!scheme) return false;

    scheme.active = !scheme.active;
    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUser,
      action: "DEACTIVATE_SCHEME",
      targetSchemeId: schemeId,
      schemeName: scheme.name,
      fieldChanged: "active",
      previousValue: (!scheme.active).toString(),
      newValue: scheme.active.toString(),
      reason: scheme.active ? "Scheme activated" : "Scheme deactivated by administrator"
    });

    this.persistSchemes();
    this.persistAudit();
    return true;
  }

  public updateScheme(updatedScheme: Scheme, reason: string = "Scheme parameters revised", adminUser: string = "MoSJE Nodal Officer"): boolean {
    const index = this.schemes.findIndex(s => s.id === updatedScheme.id);
    if (index === -1) return false;
    this.schemes[index] = { ...updatedScheme, lastVerifiedAt: new Date().toISOString().split('T')[0] };
    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUser,
      action: "UPDATE_RULE",
      targetSchemeId: updatedScheme.id,
      schemeName: updatedScheme.name,
      fieldChanged: "rules & terms",
      previousValue: "Previous Parameters",
      newValue: "Updated Rules / Terms",
      reason
    });
    this.persistSchemes();
    this.persistAudit();
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

  public getAuditLogs(): AdminAuditLog[] {
    return [...this.auditLogs];
  }

  // Profile Persistence (save partially completed & finished profiles)
  public saveProfile(profile: ApplicantProfile) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        ...profile,
        updatedAt: new Date().toISOString()
      }));
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
      return updated;
    } catch (e) {
      return [];
    }
  }

  // User Account & Role Demo Switcher
  public getCurrentUser(): UserAccount {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    const defaultUser: UserAccount = {
      id: "demo-user-01",
      email: "entrepreneur.demo@gov.in",
      name: "Rameshwar Kumar",
      role: "entrepreneur",
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
