export type BeneficiaryCategory = 
  | 'SC' 
  | 'OBC' 
  | 'SafaiKaramchari' 
  | 'DNT_NT' 
  | 'EBC' 
  | 'General';

export type Gender = 'male' | 'female' | 'other';
export type LocationType = 'rural' | 'urban' | 'semi-urban';
export type BusinessStage = 'idea' | 'starting' | 'existing';
export type EmploymentStatus = 'unemployed' | 'self_employed' | 'wage_worker' | 'student';
export type EducationLevel = 'below_10th' | '10th_pass' | '12th_pass' | 'diploma' | 'graduate' | 'post_graduate' | 'vocational';

export interface ApplicantProfile {
  id?: string;
  // Step 1: Personal
  age: number;
  gender: Gender;
  state: string;
  district: string;
  locationType: LocationType;
  
  // Step 2: Category
  category: BeneficiaryCategory;
  isSpecialSubgroup?: boolean; // e.g., manual scavenger dependent, single woman
  
  // Step 3: Financial
  annualFamilyIncome: number; // in Rupees
  projectCost: number; // total capital requirement
  requestedLoanAmount: number; // desired credit amount
  personalContribution: number; // applicant equity
  
  // Step 4: Business
  businessSector: string; // e.g. Agriculture, Manufacturing, Service, Retail, Transport, Sanitation Equipment
  businessStage: BusinessStage;
  businessDescription: string;
  employmentStatus: EmploymentStatus;
  
  // Step 5: Education & Skills
  educationLevel: EducationLevel;
  technicalTraining: boolean;
  technicalTrainingDetails?: string;
  vocationalCertification: boolean;
  vocationalCertificationDetails?: string;
  experienceYears: number;
  
  updatedAt?: string;
}

export interface SchemeRule {
  id: string;
  schemeId: string;
  minAge: number;
  maxAge: number;
  maxAnnualIncome: number; // 0 = no income ceiling
  minProjectCost: number;
  maxProjectCost: number;
  maxLoanAmount: number;
  personalContributionMinPercent: number; // e.g. 5% or 10%
  eligibleCategories: BeneficiaryCategory[];
  eligibleGenders: Gender[];
  eligibleStates?: string[]; // empty means all India
  eligibleSectors?: string[]; // empty means all sectors
  requiredEducation?: EducationLevel[];
  mandatoryTrainingRequired?: boolean;
  specialConditionsNotes?: string;
  effectiveFrom: string;
  lastVerifiedAt: string;
}

export interface SchemeTerms {
  interestRateMin: number; // annual percentage e.g. 4.0
  interestRateMax: number; // annual percentage e.g. 6.0
  rebateForWomenPercent: number; // e.g. 1.0%
  tenureYearsMax: number; // e.g. 5, 7, 10
  moratoriumMonths: number; // e.g. 6, 12
  subsidyRatePercent?: number;
}

export interface SchemeDocument {
  id: string;
  schemeId: string;
  code: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  requirementType: 'required' | 'conditional' | 'optional';
  conditionNote?: string;
}

export interface DocumentRequirement {
  id: string;
  title: string;
  description: string;
  issuingAuthority: string;
  formats?: string[];
  validity?: string;
  condition?: string;
  benefit?: string;
}

export interface Scheme {
  id: string;
  code: string;
  name: string;
  nameHi: string;
  corporation: 'NSFDC' | 'NBCFDC' | 'NSKFDC';
  corporationFullName: string;
  targetGroup: string;
  targetGroupHi: string;
  description: string;
  descriptionHi: string;
  rules: SchemeRule;
  terms: SchemeTerms;
  documents: SchemeDocument[];
  specialBenefits: string[];
  specialBenefitsHi: string[];
  applicationProcess: string[];
  applicationProcessHi: string[];
  channelPartners: string[];
  sourceUrl: string;
  sourceName: string;
  effectiveFrom: string;
  lastVerifiedAt: string;
  active: boolean;
  isDemoData: boolean;
}

export interface EligibilityResult {
  schemeId: string;
  scheme: Scheme;
  status: 'eligible' | 'possibly_eligible' | 'not_eligible';
  matchScore: number; // 0 to 100
  reasonsEligible: string[];
  reasonsNotEligible: string[];
  potentialBlockers: string[];
  ruleEvaluations: {
    categoryCheck: { passed: boolean; message: string };
    incomeCheck: { passed: boolean; message: string };
    ageCheck: { passed: boolean; message: string };
    projectCostCheck: { passed: boolean; message: string };
    loanAmountCheck: { passed: boolean; message: string };
    genderCheck: { passed: boolean; message: string };
    sectorCheck: { passed: boolean; message: string };
    trainingCheck: { passed: boolean; message: string };
  };
  financialEstimate: {
    projectCost: number;
    maxLoanPossible: number;
    recommendedLoan: number;
    personalContributionRequired: number;
    interestRateApplied: number;
    tenureYears: number;
    moratoriumMonths: number;
    monthlyEmi: number;
    totalInterest: number;
    totalRepayment: number;
  };
}

export interface WhatIfParams {
  projectCost: number;
  requestedLoanAmount: number;
  personalContribution: number;
  tenureYears: number;
  interestRate?: number;
  moratoriumMonths?: number;
}

export interface ChannelPartnerBranch {
  id: string;
  name: string;
  nameHi?: string;
  corporation: 'NSFDC' | 'NBCFDC' | 'NSKFDC' | 'ALL';
  agencyType: 'SCA' | 'PSB' | 'RRB' | 'Channel Partner';
  state: string;
  district: string;
  address: string;
  pincode: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  operatingHours?: string;
  website?: string;
  isDemoData: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  role: 'user' | 'entrepreneur';
  name: string;
  createdAt: string;
}

export interface TestResult {
  suiteName: string;
  tests: {
    name: string;
    passed: boolean;
    input: any;
    expected: any;
    actual: any;
    message?: string;
  }[];
}
