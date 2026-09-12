/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/views/LandingPage';
import { EligibilityWizard } from './components/views/EligibilityWizard';
import { ResultsDashboard } from './components/views/ResultsDashboard';
import { SchemeDetailsModal } from './components/views/SchemeDetailsModal';
import { SchemeCompare } from './components/views/SchemeCompare';
import { EmiCalculatorPage } from './components/views/EmiCalculatorPage';
import { DocumentChecklistView } from './components/views/DocumentChecklistView';
import { BranchLocatorView } from './components/views/BranchLocatorView';
import { AllSchemesView } from './components/views/AllSchemesView';
import { SavedSchemesView } from './components/views/SavedSchemesView';
import { SchemeMitraModal } from './components/views/SchemeMitraModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/profile/UserProfileModal';

import { ApplicantProfile, Scheme } from './types';
import { Language } from './utils/translations';
import { dataStore } from './services/dataStore';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [language, setLanguage] = useState<Language>('en');
  
  // Profile state
  const [applicantProfile, setApplicantProfile] = useState<ApplicantProfile | null>(() => {
    return dataStore.getSavedProfile();
  });

  // Modal and focused scheme state
  const [modalScheme, setModalScheme] = useState<Scheme | null>(null);
  const [activeSchemeForChecklist, setActiveSchemeForChecklist] = useState<Scheme | null>(null);
  const [activeSchemeForEmi, setActiveSchemeForEmi] = useState<Scheme | null>(null);
  const [isMitraOpen, setIsMitraOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Scheme comparison state (up to 3 schemes)
  const [comparedSchemes, setComparedSchemes] = useState<Scheme[]>(() => {
    const all = dataStore.getSchemes();
    return all.slice(0, 2); // default compare two schemes
  });

  const handleCompleteWizard = (profile: ApplicantProfile) => {
    setApplicantProfile(profile);
    dataStore.saveProfile(profile);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCompare = (scheme: Scheme) => {
    if (comparedSchemes.find(s => s.id === scheme.id)) {
      setCurrentView('compare');
      return;
    }
    if (comparedSchemes.length >= 3) {
      setComparedSchemes([comparedSchemes[1], comparedSchemes[2], scheme]);
    } else {
      setComparedSchemes([...comparedSchemes, scheme]);
    }
    setCurrentView('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveFromCompare = (schemeId: string) => {
    setComparedSchemes(prev => prev.filter(s => s.id !== schemeId));
  };

  const handleOpenChecklist = (scheme: Scheme) => {
    setActiveSchemeForChecklist(scheme);
    setCurrentView('documents');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEmi = (scheme: Scheme) => {
    setActiveSchemeForEmi(scheme);
    setCurrentView('emi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLocator = (scheme: Scheme) => {
    setCurrentView('branches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        setLanguage={setLanguage}
        onOpenMitra={() => setIsMitraOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            language={language}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenMitra={() => setIsMitraOpen(true)}
          />
        )}

        {currentView === 'wizard' && (
          <EligibilityWizard
            language={language}
            onComplete={handleCompleteWizard}
            onOpenMitra={() => setIsMitraOpen(true)}
            initialProfile={applicantProfile}
          />
        )}

        {currentView === 'results' && applicantProfile && (
          <ResultsDashboard
            language={language}
            profile={applicantProfile}
            onSelectSchemeDetails={(scheme) => setModalScheme(scheme)}
            onOpenChecklist={handleOpenChecklist}
            onOpenLocator={handleOpenLocator}
            onAddToCompare={handleAddToCompare}
            onEditProfile={() => setCurrentView('wizard')}
            onOpenMitra={() => setIsMitraOpen(true)}
          />
        )}

        {currentView === 'results' && !applicantProfile && (
          <div className="max-w-xl mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Please complete the questionnaire first</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              To evaluate statutory eligibility, we require your target category, budget, and location.
            </p>
            <button
              onClick={() => setCurrentView('wizard')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
            >
              Start Eligibility Questionnaire
            </button>
          </div>
        )}

        {currentView === 'schemes' && (
          <AllSchemesView
            language={language}
            onSelectSchemeDetails={(scheme) => setModalScheme(scheme)}
            onOpenChecklist={handleOpenChecklist}
            onOpenLocator={handleOpenLocator}
            onAddToCompare={handleAddToCompare}
            onCheckEligibility={() => setCurrentView('wizard')}
          />
        )}

        {currentView === 'saved' && (
          <SavedSchemesView
            language={language}
            onSelectSchemeDetails={(scheme) => setModalScheme(scheme)}
            onOpenChecklist={handleOpenChecklist}
            onOpenEmi={handleOpenEmi}
            onAddToCompare={handleAddToCompare}
            onExploreSchemes={() => setCurrentView('schemes')}
            onCheckEligibility={() => setCurrentView('wizard')}
          />
        )}

        {currentView === 'compare' && (
          <SchemeCompare
            language={language}
            comparedSchemes={comparedSchemes}
            onRemoveScheme={handleRemoveFromCompare}
            onSelectSchemeDetails={(scheme) => setModalScheme(scheme)}
            onOpenChecklist={handleOpenChecklist}
            onOpenLocator={handleOpenLocator}
            onExploreSchemes={() => setCurrentView('schemes')}
          />
        )}

        {currentView === 'emi' && (
          <EmiCalculatorPage
            language={language}
            selectedScheme={activeSchemeForEmi}
          />
        )}

        {currentView === 'documents' && (
          <DocumentChecklistView
            language={language}
            selectedScheme={activeSchemeForChecklist}
            profile={applicantProfile}
            onSelectScheme={(scheme) => setActiveSchemeForChecklist(scheme)}
          />
        )}

        {currentView === 'branches' && (
          <BranchLocatorView
            language={language}
          />
        )}
      </main>

      {/* Floating Action Button for Scheme Mitra AI on mobile / bottom right */}
      <button
        id="btn-fab-scheme-mitra"
        onClick={() => setIsMitraOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-3 rounded-full shadow-xl shadow-orange-500/20 font-bold text-xs transition transform hover:scale-105 no-print cursor-pointer"
        title="Chat with Scheme Mitra AI Assistant"
      >
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>Ask Scheme Mitra</span>
      </button>

      {/* Citizen Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Scheme Details Modal */}
      <SchemeDetailsModal
        scheme={modalScheme}
        onClose={() => setModalScheme(null)}
        language={language}
        onOpenChecklist={handleOpenChecklist}
        onOpenLocator={handleOpenLocator}
      />

      {/* Scheme Mitra AI Modal / Drawer */}
      <SchemeMitraModal
        isOpen={isMitraOpen}
        onClose={() => setIsMitraOpen(false)}
        language={language}
        profile={applicantProfile}
        activeScheme={modalScheme || activeSchemeForChecklist}
      />

      {/* Footer */}
      <Footer
        language={language}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
