import { ApplicantProfile, Scheme, EligibilityResult, WhatIfParams } from '../types';
import { calculateEmi, formatIndianCurrency } from './emiCalculator';

/**
 * Deterministic Scheme Matching and Eligibility Rules Engine
 * 
 * Rules are evaluated against structured scheme parameters without LLM hallucinations.
 */

export function evaluateSchemeEligibility(
  profile: ApplicantProfile,
  scheme: Scheme,
  whatIfOverrides?: WhatIfParams
): EligibilityResult {
  const rules = scheme?.rules || {
    minAge: 18,
    maxAge: 60,
    maxAnnualIncome: 0,
    minProjectCost: 0,
    maxProjectCost: 50000000,
    maxLoanAmount: 50000000,
    personalContributionMinPercent: 0,
    eligibleCategories: ['SC', 'OBC', 'SafaiKaramchari', 'DNT_NT', 'EBC', 'General'],
    eligibleGenders: ['male', 'female', 'other'],
    mandatoryTrainingRequired: false,
    eligibleSectors: [] as string[],
    specialConditionsNotes: '',
    effectiveFrom: '2026-01-01',
    lastVerifiedAt: '2026-01-01'
  };
  const terms = scheme?.terms || {
    interestRateMin: 4,
    interestRateMax: 8,
    rebateForWomenPercent: 1,
    tenureYearsMax: 7,
    moratoriumMonths: 6,
    subsidyRatePercent: 0
  };

  const eligibleCategories = rules.eligibleCategories || [];
  const eligibleGenders = rules.eligibleGenders || [];
  const eligibleSectors = rules.eligibleSectors || [];

  // Active values (with What-If simulation support)
  const effectiveProjectCost = whatIfOverrides ? whatIfOverrides.projectCost : profile.projectCost;
  const effectiveLoanAmount = whatIfOverrides ? whatIfOverrides.requestedLoanAmount : profile.requestedLoanAmount;
  const effectiveContribution = whatIfOverrides ? whatIfOverrides.personalContribution : profile.personalContribution;
  const effectiveTenureYears = whatIfOverrides ? whatIfOverrides.tenureYears : Math.min(terms.tenureYearsMax || 7, 7);

  const reasonsEligible: string[] = [];
  const reasonsNotEligible: string[] = [];
  const potentialBlockers: string[] = [];

  // ========================================================
  // 1. Category Check (Mandatory Affirmative Action Target)
  // ========================================================
  let categoryPassed = false;
  let categoryMessage = "";

  if (eligibleCategories.includes(profile.category)) {
    categoryPassed = true;
    categoryMessage = `Your category (${getCategoryLabel(profile.category)}) matches the target group for ${scheme.corporation}.`;
    reasonsEligible.push(`Beneficiary category satisfied: ${getCategoryLabel(profile.category)} is eligible under ${scheme.corporation}.`);
  } else {
    categoryPassed = false;
    const allowed = eligibleCategories.map(getCategoryLabel).join(', ');
    categoryMessage = `Scheme requires applicant category to be [${allowed}], but profile category is ${getCategoryLabel(profile.category)}.`;
    reasonsNotEligible.push(`Category mismatch: Scheme is designated for ${allowed}, whereas applicant is registered as ${getCategoryLabel(profile.category)}.`);
  }

  // ========================================================
  // 2. Annual Family Income Check
  // ========================================================
  let incomePassed = false;
  let incomeMessage = "";

  if (rules.maxAnnualIncome === 0) {
    // No income ceiling (e.g. NSKFDC sanitation workers exemption)
    incomePassed = true;
    incomeMessage = "No annual family income ceiling is prescribed for this affirmative action scheme.";
    reasonsEligible.push("No family income ceiling restriction (open to all verified beneficiaries).");
  } else if (profile.annualFamilyIncome <= rules.maxAnnualIncome) {
    incomePassed = true;
    const diff = rules.maxAnnualIncome - profile.annualFamilyIncome;
    incomeMessage = `Annual family income of ${formatIndianCurrency(profile.annualFamilyIncome)} is within the ceiling of ${formatIndianCurrency(rules.maxAnnualIncome)} (margin: ${formatIndianCurrency(diff)}).`;
    reasonsEligible.push(`Income requirement satisfied: Family income of ${formatIndianCurrency(profile.annualFamilyIncome)} is below the scheme ceiling of ${formatIndianCurrency(rules.maxAnnualIncome)}.`);
  } else {
    incomePassed = false;
    const excess = profile.annualFamilyIncome - rules.maxAnnualIncome;
    incomeMessage = `Annual family income of ${formatIndianCurrency(profile.annualFamilyIncome)} exceeds the ceiling limit of ${formatIndianCurrency(rules.maxAnnualIncome)} by ${formatIndianCurrency(excess)}.`;
    reasonsNotEligible.push(`Income exceeds limit: Annual family income exceeds scheme ceiling of ${formatIndianCurrency(rules.maxAnnualIncome)} by ${formatIndianCurrency(excess)}.`);
  }

  // ========================================================
  // 3. Age Limit Check
  // ========================================================
  let agePassed = false;
  let ageMessage = "";

  if (profile.age >= rules.minAge && profile.age <= rules.maxAge) {
    agePassed = true;
    ageMessage = `Age ${profile.age} years is within the allowable range of ${rules.minAge} to ${rules.maxAge} years.`;
    reasonsEligible.push(`Age eligibility verified: ${profile.age} years (permissible bracket is ${rules.minAge} – ${rules.maxAge} years).`);
  } else if (profile.age < rules.minAge) {
    agePassed = false;
    ageMessage = `Applicant age (${profile.age} years) is below the minimum required age of ${rules.minAge} years.`;
    reasonsNotEligible.push(`Age requirement not met: Minimum age is ${rules.minAge} years (applicant is ${profile.age} years).`);
  } else {
    agePassed = false;
    ageMessage = `Applicant age (${profile.age} years) exceeds the maximum allowed age of ${rules.maxAge} years.`;
    reasonsNotEligible.push(`Age limit exceeded: Maximum age for this scheme is ${rules.maxAge} years (applicant is ${profile.age} years).`);
  }

  // ========================================================
  // 4. Project Cost Limits Check
  // ========================================================
  let projectCostPassed = false;
  let projectCostMessage = "";

  if (effectiveProjectCost >= rules.minProjectCost && effectiveProjectCost <= rules.maxProjectCost) {
    projectCostPassed = true;
    projectCostMessage = `Project cost of ${formatIndianCurrency(effectiveProjectCost)} is within scheme range (${formatIndianCurrency(rules.minProjectCost)} – ${formatIndianCurrency(rules.maxProjectCost)}).`;
    reasonsEligible.push(`Project cost within limits: ${formatIndianCurrency(effectiveProjectCost)} fits the scheme bracket of ${formatIndianCurrency(rules.minProjectCost)} to ${formatIndianCurrency(rules.maxProjectCost)}.`);
  } else if (effectiveProjectCost < rules.minProjectCost) {
    projectCostPassed = false;
    projectCostMessage = `Project cost ${formatIndianCurrency(effectiveProjectCost)} is below the minimum project threshold of ${formatIndianCurrency(rules.minProjectCost)}.`;
    reasonsNotEligible.push(`Project cost below minimum: Scheme requires at least ${formatIndianCurrency(rules.minProjectCost)} project size.`);
  } else {
    projectCostPassed = false;
    const excessCost = effectiveProjectCost - rules.maxProjectCost;
    projectCostMessage = `Project cost ${formatIndianCurrency(effectiveProjectCost)} exceeds maximum scheme budget of ${formatIndianCurrency(rules.maxProjectCost)} by ${formatIndianCurrency(excessCost)}.`;
    reasonsNotEligible.push(`Project cost exceeds ceiling: Budget exceeds scheme maximum of ${formatIndianCurrency(rules.maxProjectCost)} by ${formatIndianCurrency(excessCost)}.`);
  }

  // ========================================================
  // 5. Loan Amount Limit Check
  // ========================================================
  let loanAmountPassed = false;
  let loanAmountMessage = "";

  if (effectiveLoanAmount <= rules.maxLoanAmount) {
    loanAmountPassed = true;
    loanAmountMessage = `Requested credit of ${formatIndianCurrency(effectiveLoanAmount)} is within the max loan ceiling of ${formatIndianCurrency(rules.maxLoanAmount)}.`;
    reasonsEligible.push(`Credit requirement supported: Requested loan of ${formatIndianCurrency(effectiveLoanAmount)} is within maximum loan assistance of ${formatIndianCurrency(rules.maxLoanAmount)}.`);
  } else {
    loanAmountPassed = false;
    const excessLoan = effectiveLoanAmount - rules.maxLoanAmount;
    loanAmountMessage = `Requested loan of ${formatIndianCurrency(effectiveLoanAmount)} exceeds maximum scheme loan limit of ${formatIndianCurrency(rules.maxLoanAmount)} by ${formatIndianCurrency(excessLoan)}.`;
    reasonsNotEligible.push(`Loan limit exceeded: Requested amount exceeds maximum loan cap of ${formatIndianCurrency(rules.maxLoanAmount)} by ${formatIndianCurrency(excessLoan)}.`);
  }

  // ========================================================
  // 6. Gender Eligibility Check
  // ========================================================
  let genderPassed = false;
  let genderMessage = "";

  if (eligibleGenders.length === 0 || eligibleGenders.includes(profile.gender)) {
    genderPassed = true;
    genderMessage = `Gender (${profile.gender}) is eligible for this program.`;
    if (eligibleGenders.length === 1 && eligibleGenders[0] === 'female') {
      reasonsEligible.push("Special Women-Exclusive Scheme: Tailored benefits and zero promoter contribution for women entrepreneurs.");
    }
  } else {
    genderPassed = false;
    genderMessage = `This scheme is exclusively reserved for ${eligibleGenders.join(', ')} applicants.`;
    reasonsNotEligible.push(`Gender restriction: This scheme is earmarked exclusively for ${eligibleGenders.join(', ')} beneficiaries.`);
  }

  // ========================================================
  // 7. Sector Eligibility Check
  // ========================================================
  let sectorPassed = true;
  let sectorMessage = "Sector is permissible under broad self-employment guidelines.";

  if (eligibleSectors && eligibleSectors.length > 0) {
    const businessSector = (profile.businessSector || '').toLowerCase();
    const sectorMatch = eligibleSectors.some(s => 
      s && (
        s.toLowerCase().includes(businessSector) ||
        businessSector.includes(s.toLowerCase())
      )
    );
    if (sectorMatch) {
      sectorPassed = true;
      sectorMessage = `Business sector '${profile.businessSector}' matches eligible sectors for this scheme.`;
      reasonsEligible.push(`Business sector match: Sector '${profile.businessSector}' is prioritized under this program.`);
    } else {
      // Not necessarily fatal blocker unless specialized (like SUY), but marks potential blocker
      if (scheme.code === 'NSKFDC-SUY') {
        sectorPassed = false;
        sectorMessage = `Scheme requires sanitation, cleaning equipment, or waste management project; current sector is '${profile.businessSector}'.`;
        reasonsNotEligible.push(`Specialized sector required: Only sanitation and mechanized cleaning ventures qualify.`);
      } else {
        sectorMessage = `Sector '${profile.businessSector}' may require special SCA concurrence.`;
        potentialBlockers.push(`Sector check: Verify specific local SCA trade list for '${profile.businessSector}'.`);
      }
    }
  }

  // ========================================================
  // 8. Skill / Training Check
  // ========================================================
  let trainingPassed = true;
  let trainingMessage = "No mandatory skill certification prerequisite.";

  if (rules.mandatoryTrainingRequired) {
    if (profile.technicalTraining || profile.vocationalCertification || profile.experienceYears >= 2) {
      trainingPassed = true;
      trainingMessage = "Applicant meets required skill/experience prerequisites.";
      reasonsEligible.push("Skill readiness verified: Vocational certification or operational experience provided.");
    } else {
      trainingPassed = false;
      trainingMessage = "Scheme requires technical training certification or at least 2 years demonstrated experience.";
      potentialBlockers.push("Skill certification prerequisite: Applicant should undergo EDP or vocational training before final sanction.");
    }
  }

  // Check personal contribution margin
  const minRequiredContribution = (rules.personalContributionMinPercent / 100) * effectiveProjectCost;
  if (effectiveContribution < minRequiredContribution && rules.personalContributionMinPercent > 0) {
    potentialBlockers.push(`Promoter contribution margin: Scheme requires min ${rules.personalContributionMinPercent}% (${formatIndianCurrency(minRequiredContribution)}), profile indicates ${formatIndianCurrency(effectiveContribution)}.`);
  }

  // Missing info check (e.g. if income or project cost is zero or unset)
  let isMissingMandatoryInfo = false;
  if (!profile.age || !profile.annualFamilyIncome || !profile.projectCost || !profile.category) {
    isMissingMandatoryInfo = true;
  }

  // ========================================================
  // Determine Final Eligibility Status
  // ========================================================
  let status: 'eligible' | 'possibly_eligible' | 'not_eligible' = 'eligible';

  const mandatoryChecksPassed = 
    categoryPassed &&
    incomePassed &&
    agePassed &&
    projectCostPassed &&
    loanAmountPassed &&
    genderPassed &&
    sectorPassed;

  if (isMissingMandatoryInfo) {
    status = 'possibly_eligible';
  } else if (!mandatoryChecksPassed) {
    status = 'not_eligible';
  } else if (potentialBlockers.length > 0 || !trainingPassed) {
    status = 'possibly_eligible';
  } else {
    status = 'eligible';
  }

  // ========================================================
  // Calculate Compatibility Score (0 - 100)
  // ========================================================
  let matchScore = 0;

  if (status === 'eligible' || status === 'possibly_eligible') {
    let score = 50; // Base score for meeting mandatory eligibility

    // 1. Loan Coverage factor (up to 20 pts)
    const maxLoan = Math.min(rules.maxLoanAmount, effectiveProjectCost * 0.95);
    const loanCoverageRatio = Math.min(1, maxLoan / (effectiveLoanAmount || 1));
    score += Math.round(loanCoverageRatio * 20);

    // 2. Interest Rate Competitiveness factor (up to 15 pts)
    // Rates in MoSJE range from 4% to 9%
    const effectiveRate = profile.gender === 'female' 
      ? Math.max(3.5, terms.interestRateMin - (terms.rebateForWomenPercent || 0))
      : terms.interestRateMin;
    const rateScore = Math.max(0, 15 - (effectiveRate - 3.5) * 2.5);
    score += Math.round(rateScore);

    // 3. Margin Money Friendliness (up to 10 pts)
    if (rules.personalContributionMinPercent === 0) {
      score += 10;
    } else if (rules.personalContributionMinPercent <= 5) {
      score += 7;
    } else {
      score += 4;
    }

    // 4. Special Demographics & Affirmative Alignment (up to 5 pts)
    if (profile.gender === 'female' && (terms.rebateForWomenPercent > 0 || rules.eligibleGenders.length === 1)) {
      score += 5;
    }
    if (profile.technicalTraining || profile.vocationalCertification) {
      score += 3;
    }

    if (status === 'possibly_eligible') {
      score = Math.min(score, 65); // Cap for partial or missing info
    }

    matchScore = Math.min(99, Math.max(40, score));
  } else {
    // For non-eligible, calculate proximity score (e.g. if only 1 check failed, score 15-30%)
    let passedCount = 0;
    if (categoryPassed) passedCount++;
    if (incomePassed) passedCount++;
    if (agePassed) passedCount++;
    if (projectCostPassed) passedCount++;
    if (loanAmountPassed) passedCount++;
    if (genderPassed) passedCount++;
    matchScore = Math.round((passedCount / 6) * 35);
  }

  // ========================================================
  // Calculate Financial Estimate & Monthly EMI
  // ========================================================
  const appliedInterestRate = profile.gender === 'female'
    ? Math.max(3.0, terms.interestRateMin - (terms.rebateForWomenPercent || 0))
    : terms.interestRateMin;

  const maxLoanPossible = Math.min(rules.maxLoanAmount, effectiveProjectCost * 0.90);
  const recommendedLoan = Math.min(effectiveLoanAmount, maxLoanPossible);
  const minPersonalContribution = Math.max(
    effectiveContribution,
    (rules.personalContributionMinPercent / 100) * effectiveProjectCost
  );

  const emiCalculation = calculateEmi({
    principal: recommendedLoan,
    annualRate: appliedInterestRate,
    tenureYears: effectiveTenureYears,
    moratoriumMonths: terms.moratoriumMonths
  });

  return {
    schemeId: scheme.id,
    scheme,
    status,
    matchScore,
    reasonsEligible,
    reasonsNotEligible,
    potentialBlockers,
    ruleEvaluations: {
      categoryCheck: { passed: categoryPassed, message: categoryMessage },
      incomeCheck: { passed: incomePassed, message: incomeMessage },
      ageCheck: { passed: agePassed, message: ageMessage },
      projectCostCheck: { passed: projectCostPassed, message: projectCostMessage },
      loanAmountCheck: { passed: loanAmountPassed, message: loanAmountMessage },
      genderCheck: { passed: genderPassed, message: genderMessage },
      sectorCheck: { passed: sectorPassed, message: sectorMessage },
      trainingCheck: { passed: trainingPassed, message: trainingMessage }
    },
    financialEstimate: {
      projectCost: effectiveProjectCost,
      maxLoanPossible,
      recommendedLoan,
      personalContributionRequired: minPersonalContribution,
      interestRateApplied: appliedInterestRate,
      tenureYears: effectiveTenureYears,
      moratoriumMonths: terms.moratoriumMonths,
      monthlyEmi: emiCalculation.monthlyEmi,
      totalInterest: emiCalculation.totalInterest,
      totalRepayment: emiCalculation.totalRepayment
    }
  };
}

/**
 * Match all available schemes and return sorted ranking
 */
export function matchSchemes(
  profile: ApplicantProfile,
  allSchemes: Scheme[],
  whatIfOverrides?: WhatIfParams
): {
  eligibleSchemes: EligibilityResult[];
  possiblyEligibleSchemes: EligibilityResult[];
  ineligibleSchemes: EligibilityResult[];
  allResults: EligibilityResult[];
  bestMatch: EligibilityResult | null;
  totalEligibleCount: number;
} {
  const activeSchemes = allSchemes.filter(s => s.active);

  const results = activeSchemes.map(scheme => 
    evaluateSchemeEligibility(profile, scheme, whatIfOverrides)
  );

  const eligibleSchemes = results
    .filter(r => r.status === 'eligible')
    .sort((a, b) => b.matchScore - a.matchScore);

  const possiblyEligibleSchemes = results
    .filter(r => r.status === 'possibly_eligible')
    .sort((a, b) => b.matchScore - a.matchScore);

  const ineligibleSchemes = results
    .filter(r => r.status === 'not_eligible')
    .sort((a, b) => b.matchScore - a.matchScore);

  const bestMatch = eligibleSchemes.length > 0 
    ? eligibleSchemes[0] 
    : (possiblyEligibleSchemes.length > 0 ? possiblyEligibleSchemes[0] : null);

  return {
    eligibleSchemes,
    possiblyEligibleSchemes,
    ineligibleSchemes,
    allResults: results,
    bestMatch,
    totalEligibleCount: eligibleSchemes.length
  };
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'SC':
      return 'Scheduled Caste (SC)';
    case 'OBC':
      return 'Other Backward Classes (OBC)';
    case 'SafaiKaramchari':
      return 'Safai Karamchari / Sanitation Worker';
    case 'DNT_NT':
      return 'Denotified / Nomadic Tribe (DNT)';
    case 'EBC':
      return 'Economically Backward Class (EBC)';
    case 'General':
      return 'General';
    default:
      return category;
  }
}
