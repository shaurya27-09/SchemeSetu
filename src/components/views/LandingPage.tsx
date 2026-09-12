import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Calculator, 
  Building, 
  FileCheck, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Users,
  Percent,
  Layers
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { APP_CONFIG } from '../../config/appConfig';
import { INITIAL_SCHEMES } from '../../data/seedSchemes';

interface LandingPageProps {
  language: Language;
  onNavigate: (view: string) => void;
  onOpenMitra: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onNavigate,
  onOpenMitra
}) => {
  const t = TRANSLATIONS[language];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: language === 'hi' ? "योजना मिलान के लिए कौन-सा इंजन उपयोग किया जाता है?" : "How does SchemeSetu evaluate eligibility? Does AI make the final decision?",
      a: language === 'hi' 
        ? "पात्रता का निर्धारण पूर्णतः नियम-आधारित (Deterministic Rule Engine) द्वारा किया जाता है। AI केवल सरल भाषा में समझाने और मार्गदर्शन के लिए है, किसी भी निर्णय में AI का अनुमान शामिल नहीं है।"
        : "Eligibility is determined strictly by our deterministic PostgreSQL rule engine using official Government criteria (caste category, income ceiling, age limits, project cost brackets). AI is never allowed to hallucinate or decide eligibility."
    },
    {
      q: language === 'hi' ? "क्या स्वच्छता कर्मचारियों के लिए कोई आय सीमा है?" : "Is there an income ceiling for Safai Karamcharis (Sanitation Workers)?",
      a: language === 'hi'
        ? "नहीं। सामाजिक न्याय और अधिकारिता मंत्रालय के दिशा-निर्देशों के अनुसार NSKFDC की योजनाओं में सफाई कर्मचारियों एवं उनके आश्रितों के लिए वार्षिक आय की कोई बाध्यता नहीं है।"
        : "No. As per MoSJE gazette notifications, the family income ceiling has been waived for Safai Karamcharis, manual scavengers, and their dependents under NSKFDC schemes to promote dignified alternative livelihoods."
    },
    {
      q: language === 'hi' ? "महिला उद्यमियों के लिए क्या विशेष लाभ उपलब्ध हैं?" : "What special concessions are available for female entrepreneurs?",
      a: language === 'hi'
        ? "महिला उद्यमियों को 'महिला समृद्धि योजना' और 'नई स्वर्णिमा योजना' जैसी विशेष योजनाओं में 4% से 5% की बेहद रियायती ब्याज दर, 0% मार्जिन मनी, और सामान्य योजनाओं में 1% की अतिरिक्त ब्याज छूट मिलती है।"
        : "Female beneficiaries receive dedicated schemes like NSFDC Mahila Samriddhi Yojana (4% p.a.) and NBCFDC New Swarnima (5% p.a.), zero promoter margin money requirement, and a 1% interest rebate on general schemes."
    },
    {
      q: language === 'hi' ? "ऋण प्राप्त करने के लिए कहां संपर्क करना होगा?" : "Where can I apply or submit my verified application?",
      a: language === 'hi'
        ? "ऋण का संवितरण सीधे मंत्रालय द्वारा नहीं, बल्कि राज्य अनुसूचित जाति/पिछड़ा वर्ग वित्त एवं विकास निगमों (SCAs) तथा नामित राष्ट्रीयकृत बैंकों व क्षेत्रीय ग्रामीण बैंकों के माध्यम से किया जाता है।"
        : "Applications are processed and disbursed through State Channelising Agencies (SCAs), participating Public Sector Banks (e.g. PNB, Canara Bank), and Regional Rural Banks. Use our Branch Locator to find your district office."
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* SIH Announcement Badge */}
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-xs font-medium text-indigo-300 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{t.heroBadge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="btn-hero-check-eligibility"
              onClick={() => onNavigate('wizard')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 text-base cursor-pointer"
            >
              <span>{t.startEligibilityBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="btn-hero-explore-schemes"
              onClick={() => onNavigate('schemes')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-6 py-4 rounded-xl transition text-base cursor-pointer"
            >
              <span>{t.exploreSchemesBtn}</span>
            </button>

            <button
              id="btn-hero-ask-mitra"
              onClick={onOpenMitra}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold px-6 py-4 rounded-xl transition text-base cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask Scheme Mitra AI</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Deterministic Engine</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Official MoSJE Guidelines</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>SC, OBC & Sanitation Beneficiaries</span>
            </span>
          </div>
        </div>
      </section>

      {/* High-Impact Numerical Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{t.statsBeneficiariesVal}</p>
              <p className="text-xs text-slate-500 font-medium">{t.statsBeneficiaries}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{t.statsInterestRatesVal}</p>
              <p className="text-xs text-slate-500 font-medium">{t.statsInterestRates}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{t.statsSubsidiesVal}</p>
              <p className="text-xs text-slate-500 font-medium">{t.statsSubsidies}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{t.statsChannelPartnersVal}</p>
              <p className="text-xs text-slate-500 font-medium">{t.statsChannelPartners}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.howItWorksTitle}
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            {t.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{t.step1Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step1Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{t.step2Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step2Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{t.step3Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Engine Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Built For Precision, Transparency & Scale
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Explainability */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Deep Explainability</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Every scheme outcome comes with exact itemized reasons ("Why Eligible" and "Why Not Eligible"), backed by rule evaluations rather than black-box AI opinions.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('wizard')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Test with your profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: What-If Simulator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">"What-If?" Simulator</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Instantly adjust loan amounts, project budgets, and personal contribution to see how terms, subsidies, and eligibility thresholds shift in real time.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('emi')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Open Scenario Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Document Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Personalized Checklists</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Generates a tailored document dossier (caste certificate, DPR guidelines, quotation specs, income proofs) with printable PDF support.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('documents')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>View Document Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Sponsoring Corporations Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl mb-8">
            <span className="text-amber-400 text-xs font-bold tracking-wider uppercase">
              Ministry of Social Justice and Empowerment (MoSJE)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Apex Development Corporations Covered
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              SchemeSetu actively indexes verified lending guidelines, interest rate subventions, and eligibility parameters across all three statutory corporations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {APP_CONFIG.corporations.map((corp) => {
              const schemeCount = INITIAL_SCHEMES.filter(s => s.corporation === corp.code).length;
              return (
                <div key={corp.code} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-extrabold text-amber-400">{corp.name}</span>
                      <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                        {schemeCount} Active Schemes
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white mb-2 leading-snug">{corp.fullName}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{corp.description}</p>
                  </div>
                  <a 
                    href={corp.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Applicant Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 text-sm hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-900 text-white p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Discover Your Eligible Credit Schemes?
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm max-w-xl mx-auto">
            Takes less than 2 minutes. No account creation or Aadhaar biometric entry required for preliminary matching.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('wizard')}
              className="bg-white text-indigo-900 hover:bg-slate-100 font-bold px-8 py-3.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm cursor-pointer"
            >
              Start Eligibility Questionnaire
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
