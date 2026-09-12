import { calculateEmi, EmiInput } from '../emiCalculator';
import { evaluateSchemeEligibility } from '../matchingEngine';
import { ApplicantProfile, Scheme, TestResult } from '../../types';
import { INITIAL_SCHEMES } from '../../data/seedSchemes';

/**
 * Automated Verification Suite for SchemeSetu's Financial Engine & Rule Matching
 */

export function runAllEngineTests(): {
  suites: TestResult[];
  totalPassed: number;
  totalFailed: number;
  allPassed: boolean;
} {
  const suites: TestResult[] = [];

  // ========================================================
  // Suite 1: Reducing-Balance EMI Calculation Tests
  // ========================================================
  const emiSuite: TestResult = {
    suiteName: "Reducing-Balance EMI Calculation Tests",
    tests: []
  };

  // Test 1.1: Standard reducing balance EMI
  // P = 1,00,000, rate = 6%, tenure = 5 years (60 months), mor = 0
  // Monthly rate = 0.005. Factor = (1.005)^60 = 1.34885
  // Expected EMI: ~1933
  const input1: EmiInput = { principal: 100000, annualRate: 6, tenureYears: 5, moratoriumMonths: 0 };
  const res1 = calculateEmi(input1);
  const emi1Passed = res1.monthlyEmi >= 1930 && res1.monthlyEmi <= 1936;
  emiSuite.tests.push({
    name: "Standard 6% 5-year loan of ₹1,00,000",
    passed: emi1Passed,
    input: input1,
    expected: "Monthly EMI ~ ₹1,933",
    actual: `Monthly EMI: ₹${res1.monthlyEmi}, Total Interest: ₹${res1.totalInterest}`
  });

  // Test 1.2: Zero-Interest Loan
  // P = 60,000, rate = 0%, tenure = 5 years (60 months)
  // Expected EMI: 60,000 / 60 = 1,000
  const input2: EmiInput = { principal: 60000, annualRate: 0, tenureYears: 5, moratoriumMonths: 0 };
  const res2 = calculateEmi(input2);
  const emi2Passed = res2.monthlyEmi === 1000 && res2.totalInterest === 0 && res2.totalRepayment === 60000;
  emiSuite.tests.push({
    name: "Zero-Interest Loan Edge Case (0% p.a.)",
    passed: emi2Passed,
    input: input2,
    expected: "Monthly EMI = ₹1,000, Interest = ₹0",
    actual: `Monthly EMI: ₹${res2.monthlyEmi}, Total Interest: ₹${res2.totalInterest}`
  });

  // Test 1.3: Moratorium Period Calculation
  // P = 1,20,000, rate = 5%, tenure = 5 years (60 months), moratorium = 6 months
  // Repayment months = 54
  const input3: EmiInput = { principal: 120000, annualRate: 5, tenureYears: 5, moratoriumMonths: 6 };
  const res3 = calculateEmi(input3);
  const emi3Passed = res3.moratoriumMonths === 6 && res3.schedule.filter(r => r.isMoratorium).length === 6;
  emiSuite.tests.push({
    name: "Moratorium Period Amortization (6 months grace)",
    passed: emi3Passed,
    input: input3,
    expected: "6 months moratorium tagged in amortization schedule",
    actual: `${res3.schedule.filter(r => r.isMoratorium).length} moratorium months generated`
  });

  suites.push(emiSuite);

  // ========================================================
  // Suite 2: Deterministic Rule Eligibility Tests
  // ========================================================
  const ruleSuite: TestResult = {
    suiteName: "Deterministic Eligibility Rules Tests",
    tests: []
  };

  const nsfdcTermLoan = INITIAL_SCHEMES.find(s => s.code === 'NSFDC-TL')!;
  const nskfdcTermLoan = INITIAL_SCHEMES.find(s => s.code === 'NSKFDC-TL')!;
  const nbcfdcSwarnima = INITIAL_SCHEMES.find(s => s.code === 'NBCFDC-SWARNIMA')!;

  // Test 2.1: Income Eligibility Check (Within Ceiling)
  const profileEligibleIncome: ApplicantProfile = {
    age: 30,
    gender: 'male',
    state: 'Delhi',
    district: 'Central Delhi',
    locationType: 'urban',
    category: 'SC',
    annualFamilyIncome: 240000, // < 3,00,000 ceiling
    projectCost: 500000,
    requestedLoanAmount: 400000,
    personalContribution: 50000,
    businessSector: 'Retail',
    businessStage: 'starting',
    businessDescription: 'Grocery store',
    employmentStatus: 'self_employed',
    educationLevel: '12th_pass',
    technicalTraining: false,
    vocationalCertification: false,
    experienceYears: 2
  };
  const evalIncome = evaluateSchemeEligibility(profileEligibleIncome, nsfdcTermLoan);
  ruleSuite.tests.push({
    name: "Income within threshold (₹2.4L < ₹3.0L ceiling)",
    passed: evalIncome.ruleEvaluations.incomeCheck.passed && evalIncome.status === 'eligible',
    input: { income: 240000, ceiling: 300000 },
    expected: "incomeCheck.passed: true, status: eligible",
    actual: `passed: ${evalIncome.ruleEvaluations.incomeCheck.passed}, status: ${evalIncome.status}`
  });

  // Test 2.2: Income Eligibility Check (Exceeding Ceiling)
  const profileExcessIncome: ApplicantProfile = {
    ...profileEligibleIncome,
    annualFamilyIncome: 360000 // Exceeds ₹3,00,000
  };
  const evalExcessIncome = evaluateSchemeEligibility(profileExcessIncome, nsfdcTermLoan);
  ruleSuite.tests.push({
    name: "Income exceeding threshold (₹3.6L > ₹3.0L ceiling)",
    passed: !evalExcessIncome.ruleEvaluations.incomeCheck.passed && evalExcessIncome.status === 'not_eligible',
    input: { income: 360000, ceiling: 300000 },
    expected: "incomeCheck.passed: false, status: not_eligible",
    actual: `passed: ${evalExcessIncome.ruleEvaluations.incomeCheck.passed}, status: ${evalExcessIncome.status}`
  });

  // Test 2.3: Category Match (SC applied to OBC scheme)
  const evalCategoryMismatch = evaluateSchemeEligibility(profileEligibleIncome, nbcfdcSwarnima);
  ruleSuite.tests.push({
    name: "Beneficiary Category Mismatch (SC profile on OBC-exclusive scheme)",
    passed: !evalCategoryMismatch.ruleEvaluations.categoryCheck.passed && evalCategoryMismatch.status === 'not_eligible',
    input: { profileCategory: 'SC', schemeCategories: nbcfdcSwarnima.rules.eligibleCategories },
    expected: "categoryCheck.passed: false, status: not_eligible",
    actual: `passed: ${evalCategoryMismatch.ruleEvaluations.categoryCheck.passed}, status: ${evalCategoryMismatch.status}`
  });

  // Test 2.4: Gender Exclusive Scheme (Male profile on Women-exclusive scheme)
  const profileMale: ApplicantProfile = {
    ...profileEligibleIncome,
    category: 'OBC',
    gender: 'male',
    annualFamilyIncome: 200000,
    projectCost: 150000,
    requestedLoanAmount: 120000
  };
  const evalGenderCheck = evaluateSchemeEligibility(profileMale, nbcfdcSwarnima);
  ruleSuite.tests.push({
    name: "Gender Reservation Check (Male profile on Women-only Swarnima scheme)",
    passed: !evalGenderCheck.ruleEvaluations.genderCheck.passed && evalGenderCheck.status === 'not_eligible',
    input: { profileGender: 'male', allowedGenders: ['female'] },
    expected: "genderCheck.passed: false, status: not_eligible",
    actual: `passed: ${evalGenderCheck.ruleEvaluations.genderCheck.passed}, status: ${evalGenderCheck.status}`
  });

  // Test 2.5: Age Limitation Check (<18 years old)
  const profileUnderage: ApplicantProfile = {
    ...profileEligibleIncome,
    age: 16
  };
  const evalUnderage = evaluateSchemeEligibility(profileUnderage, nsfdcTermLoan);
  ruleSuite.tests.push({
    name: "Age Restriction Check (Underage 16 years < min 18)",
    passed: !evalUnderage.ruleEvaluations.ageCheck.passed && evalUnderage.status === 'not_eligible',
    input: { age: 16, minAge: 18 },
    expected: "ageCheck.passed: false, status: not_eligible",
    actual: `passed: ${evalUnderage.ruleEvaluations.ageCheck.passed}, status: ${evalUnderage.status}`
  });

  // Test 2.6: Project Cost Ceiling Check
  const profileExcessCost: ApplicantProfile = {
    ...profileEligibleIncome,
    projectCost: 6500000 // Exceeds ₹50 Lakh max
  };
  const evalExcessCost = evaluateSchemeEligibility(profileExcessCost, nsfdcTermLoan);
  ruleSuite.tests.push({
    name: "Project Cost Ceiling Check (₹65L > ₹50L max permissible)",
    passed: !evalExcessCost.ruleEvaluations.projectCostCheck.passed && evalExcessCost.status === 'not_eligible',
    input: { projectCost: 6500000, maxCost: 5000000 },
    expected: "projectCostCheck.passed: false, status: not_eligible",
    actual: `passed: ${evalExcessCost.ruleEvaluations.projectCostCheck.passed}, status: ${evalExcessCost.status}`
  });

  // Test 2.7: Exemption for Sanitation Workers (Zero Income Ceiling)
  const profileSafaiKaramchari: ApplicantProfile = {
    ...profileEligibleIncome,
    category: 'SafaiKaramchari',
    annualFamilyIncome: 850000, // Higher income still permitted as NSKFDC has no income ceiling
    projectCost: 800000,
    requestedLoanAmount: 700000
  };
  const evalSafaiKaramchari = evaluateSchemeEligibility(profileSafaiKaramchari, nskfdcTermLoan);
  ruleSuite.tests.push({
    name: "NSKFDC Sanitation Worker Exemption (No Income Ceiling)",
    passed: evalSafaiKaramchari.ruleEvaluations.incomeCheck.passed && evalSafaiKaramchari.status === 'eligible',
    input: { category: 'SafaiKaramchari', income: 850000, maxAnnualIncome: 0 },
    expected: "incomeCheck.passed: true, status: eligible",
    actual: `passed: ${evalSafaiKaramchari.ruleEvaluations.incomeCheck.passed}, status: ${evalSafaiKaramchari.status}`
  });

  suites.push(ruleSuite);

  // Summarize
  let totalPassed = 0;
  let totalFailed = 0;

  suites.forEach(s => {
    s.tests.forEach(t => {
      if (t.passed) totalPassed++;
      else totalFailed++;
    });
  });

  return {
    suites,
    totalPassed,
    totalFailed,
    allPassed: totalFailed === 0
  };
}
