import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
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
import { TextEffect, InView, BorderTrail, Accordion } from '../motion-primitives';

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
  const shouldReduceMotion = useReducedMotion();

  const faqs = [
    {
      q: language === 'hi' ? "योजना मिलान के लिए कौन-सा इंजन उपयोग किया जाता है?" : "How does SchemeSetu evaluate eligibility? Does AI make the final decision?",
      a: language === 'hi' 
        ? "पात्रता का निर्धारण पूर्णतः नियम-आधारित (Deterministic Rule Engine) द्वारा किया जाता है। AI केवल सरल भाषा में समझाने और मार्गदर्शन के लिए है, किसी भी निर्णय में AI का अनुमान शामिल नहीं है।"
        : "Eligibility is determined strictly by our deterministic rule engine using official Government criteria (caste category, income ceiling, age limits, project cost brackets). AI is never allowed to hallucinate or decide eligibility."
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
    <div className="space-y-16 pb-12 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* SIH Announcement Badge */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-xs font-medium text-indigo-300 backdrop-blur-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{t.heroBadge}</span>
          </motion.div>

          {/* Main Title with TextEffect */}
          <div className="min-h-[72px] sm:min-h-[100px] flex items-center justify-center">
            <TextEffect
              as="h1"
              delay={0.1}
              duration={0.45}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
            >
              {t.heroTitle}
            </TextEffect>
          </div>

          {/* Subtitle with slightly delayed fade-up */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {/* Primary CTA with subtle BorderTrail, soft hover scale */}
            <motion.button
              id="btn-hero-check-eligibility"
              onClick={() => onNavigate('wizard')}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              className="relative overflow-hidden w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 text-base cursor-pointer"
            >
              <BorderTrail duration={6} />
              <span className="relative z-10">{t.startEligibilityBtn}</span>
              <ArrowRight className="w-5 h-5 relative z-10" />
            </motion.button>

            <motion.button
              id="btn-hero-explore-schemes"
              onClick={() => onNavigate('schemes')}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-6 py-4 rounded-xl transition text-base cursor-pointer"
            >
              <span>{t.exploreSchemesBtn}</span>
            </motion.button>

            <motion.button
              id="btn-hero-ask-mitra"
              onClick={onOpenMitra}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold px-6 py-4 rounded-xl transition text-base cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask Scheme Mitra AI</span>
            </motion.button>
          </motion.div>

          {/* Trust Guarantees */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
          >
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
          </motion.div>
        </div>
      </section>

      {/* High-Impact Numerical Stats Banner with InView */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <InView delay={0.05} once>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{t.statsBeneficiariesVal}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.statsBeneficiaries}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{t.statsInterestRatesVal}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.statsInterestRates}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{t.statsSubsidiesVal}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.statsSubsidies}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{t.statsChannelPartnersVal}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.statsChannelPartners}</p>
              </div>
            </div>
          </div>
        </InView>
      </section>

      {/* 3-Step Process Explanation with Staggered InView & Connecting Line */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InView delay={0.05} once>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.howItWorksTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
              {t.howItWorksSubtitle}
            </p>
          </div>
        </InView>

        <div className="relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 dark:from-indigo-900 dark:via-indigo-700 dark:to-indigo-900 -z-0" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <InView delay={0.08} once>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 shadow-sm shadow-indigo-600/30">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.step1Title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex-1">{t.step1Desc}</p>
              </div>
            </InView>

            <InView delay={0.16} once>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 shadow-sm shadow-indigo-600/30">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.step2Title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex-1">{t.step2Desc}</p>
              </div>
            </InView>

            <InView delay={0.24} once>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 shadow-sm shadow-indigo-600/30">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.step3Title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex-1">{t.step3Desc}</p>
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid with Staggered InView */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InView delay={0.05} once>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Engine Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
              Built For Precision, Transparency & Scale
            </h2>
          </div>
        </InView>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Explainability */}
          <InView delay={0.08} once>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Deep Explainability</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Every scheme outcome comes with exact itemized reasons ("Why Eligible" and "Why Not Eligible"), backed by rule evaluations rather than black-box AI opinions.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('wizard')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
              >
                <span>Test with your profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </InView>

          {/* Card 2: What-If Simulator */}
          <InView delay={0.16} once>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">"What-If?" Simulator</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Instantly adjust loan amounts, project budgets, and personal contribution to see how terms, subsidies, and eligibility thresholds shift in real time.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('emi')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
              >
                <span>Open Scenario Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </InView>

          {/* Card 3: Document Checklist */}
          <InView delay={0.24} once>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Personalized Checklists</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Generates a tailored document dossier (caste certificate, DPR guidelines, quotation specs, income proofs) with printable PDF support.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('documents')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
              >
                <span>View Document Checklist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </InView>
        </div>
      </section>

      {/* Sponsoring Corporations Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InView delay={0.05} once>
          <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl p-8 sm:p-12 border border-slate-800">
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
                  <div key={corp.code} className="bg-slate-800/80 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
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
        </InView>
      </section>

      {/* Frequently Asked Questions with Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <InView delay={0.05} once>
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-indigo-100 dark:border-indigo-800">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Applicant Guidance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
        </InView>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              <Accordion isOpen={openFaq === idx}>
                <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  {faq.a}
                </div>
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner with InView */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InView delay={0.05} once>
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-900 text-white p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Discover Your Eligible Credit Schemes?
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm max-w-xl mx-auto">
              Takes less than 2 minutes. No account creation or Aadhaar biometric entry required for preliminary matching.
            </p>
            <div className="pt-2">
              <motion.button
                onClick={() => onNavigate('wizard')}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="bg-white text-indigo-900 hover:bg-slate-100 font-bold px-8 py-3.5 rounded-xl shadow-md transition text-sm cursor-pointer"
              >
                Start Eligibility Questionnaire
              </motion.button>
            </div>
          </div>
        </InView>
      </section>
    </div>
  );
};

