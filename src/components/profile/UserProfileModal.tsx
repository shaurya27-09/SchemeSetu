import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  LogOut, 
  Bookmark, 
  FileText, 
  Sparkles,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'financial' | 'enterprise'>('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || '',
    phone: profile?.phone || '',
    state_code: profile?.state_code || 'DL',
    district: profile?.district || 'Central Delhi',
    gender: profile?.gender || 'male',
    annual_family_income: profile?.annual_family_income || 180000,
    project_cost: profile?.project_cost || 120000,
    requested_loan_amount: profile?.requested_loan_amount || 110000,
    personal_contribution: profile?.personal_contribution || 10000,
    business_sector: profile?.business_sector || 'retail',
    business_stage: profile?.business_stage || 'starting',
    business_description: profile?.business_description || '',
    education_level: profile?.education_level || 'class_10',
    experience_years: profile?.experience_years || 1,
  });

  if (!isOpen) return null;

  const savedCount = dataStore.getSavedSchemeIds().length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-white font-bold text-lg">
              {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {formData.full_name || 'Entrepreneur Citizen'}
              </h2>
              <p className="text-xs text-indigo-200 flex items-center space-x-1.5 mt-0.5">
                <Mail className="w-3 h-3" />
                <span>{user?.email || 'entrepreneur@domain.in'}</span>
              </p>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-indigo-700/60 text-xs">
            <button
              onClick={() => { onClose(); onNavigate('saved'); }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center space-x-2 transition cursor-pointer text-left"
            >
              <Bookmark className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <span className="block font-bold">{savedCount} Schemes</span>
                <span className="text-[10px] text-indigo-200">Saved Schemes</span>
              </div>
            </button>

            <button
              onClick={() => { onClose(); onNavigate('documents'); }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center space-x-2 transition cursor-pointer text-left"
            >
              <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
              <div>
                <span className="block font-bold">Checklist</span>
                <span className="text-[10px] text-indigo-200">Document Dossier</span>
              </div>
            </button>

            <button
              onClick={() => { onClose(); onNavigate('wizard'); }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center space-x-2 transition cursor-pointer text-left"
            >
              <Sparkles className="w-4 h-4 text-indigo-200 shrink-0" />
              <div>
                <span className="block font-bold">Questionnaire</span>
                <span className="text-[10px] text-indigo-200">Re-evaluate Rules</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 pt-2 text-xs font-bold border-b-2 mr-6 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`pb-3 pt-2 text-xs font-bold border-b-2 mr-6 transition cursor-pointer ${
              activeTab === 'financial'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Financial Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enterprise')}
            className={`pb-3 pt-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'enterprise'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Proposed Enterprise
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Profile details updated and synchronized with cloud database!</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  State / UT
                </label>
                <input
                  type="text"
                  value={formData.state_code}
                  onChange={(e) => setFormData({ ...formData, state_code: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="male">Male</option>
                  <option value="female">Female (Eligible for Women Interest Subventions)</option>
                  <option value="transgender">Transgender</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Education Level
                </label>
                <select
                  value={formData.education_level}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="below_10">Below 10th Standard</option>
                  <option value="class_10">10th Pass</option>
                  <option value="class_12">12th Pass</option>
                  <option value="graduate">Graduate Degree</option>
                  <option value="post_graduate">Post Graduate</option>
                  <option value="vocational">ITI / Vocational Diploma</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Household Income (₹)
                </label>
                <input
                  type="number"
                  value={formData.annual_family_income}
                  onChange={(e) => setFormData({ ...formData, annual_family_income: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Affirmative action credit schemes are capped at statutory income ceilings (e.g. ₹3 Lakh).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Proposed Project Cost (₹)
                </label>
                <input
                  type="number"
                  value={formData.project_cost}
                  onChange={(e) => setFormData({ ...formData, project_cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Requested Loan Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.requested_loan_amount}
                  onChange={(e) => setFormData({ ...formData, requested_loan_amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Margin Contribution (₹)
                </label>
                <input
                  type="number"
                  value={formData.personal_contribution}
                  onChange={(e) => setFormData({ ...formData, personal_contribution: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {activeTab === 'enterprise' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Sector
                  </label>
                  <select
                    value={formData.business_sector}
                    onChange={(e) => setFormData({ ...formData, business_sector: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="retail">Retail & Micro Trade</option>
                    <option value="agriculture">Agriculture & Allied</option>
                    <option value="manufacturing">Small Manufacturing / Workshop</option>
                    <option value="services">Services & Transport</option>
                    <option value="sanitation_equip">Mechanized Sanitation Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Stage
                  </label>
                  <select
                    value={formData.business_stage}
                    onChange={(e) => setFormData({ ...formData, business_stage: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="starting">Starting New Venture (Greenfield)</option>
                    <option value="expansion">Expanding Existing Unit (Brownfield)</option>
                    <option value="modernization">Modernization & Tool Upgrades</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brief Enterprise Description
                </label>
                <textarea
                  rows={3}
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  placeholder="Describe your planned business activity, products or services..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
