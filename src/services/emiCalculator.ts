/**
 * Standard Reducing-Balance EMI and Loan Amortization Engine
 * 
 * Formula:
 * r = annualRate / 12 / 100
 * n = tenureYears * 12
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 */

export interface EmiInput {
  principal: number; // P in INR
  annualRate: number; // e.g. 5 for 5%
  tenureYears: number; // loan tenure in years
  moratoriumMonths?: number; // repayment grace period
}

export interface AmortizationScheduleRow {
  month: number;
  year: number;
  beginningBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  isMoratorium: boolean;
}

export interface EmiCalculationResult {
  monthlyEmi: number;
  principal: number;
  totalInterest: number;
  totalRepayment: number;
  effectiveAnnualRate: number;
  tenureYears: number;
  tenureMonths: number;
  moratoriumMonths: number;
  schedule: AmortizationScheduleRow[];
  yearlySummary: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    endingBalance: number;
  }[];
  disclaimer: string;
}

export const EMI_DISCLAIMER = 
  "Indicative calculation only. Actual repayment may vary according to the lending agency and scheme conditions.";

export function calculateEmi(input: EmiInput): EmiCalculationResult {
  const principal = Math.max(0, Number(input.principal) || 0);
  const annualRate = Math.max(0, Number(input.annualRate) || 0);
  const tenureYears = Math.max(0.25, Number(input.tenureYears) || 1);
  const moratoriumMonths = Math.max(0, Math.floor(Number(input.moratoriumMonths) || 0));
  
  const totalMonths = Math.round(tenureYears * 12);
  const repaymentMonths = Math.max(1, totalMonths - moratoriumMonths);
  
  let monthlyEmi = 0;
  let totalInterest = 0;
  let totalRepayment = 0;
  
  // Handle Zero Interest Case (e.g. special interest-free subvention schemes)
  if (annualRate === 0) {
    monthlyEmi = principal / repaymentMonths;
    totalInterest = 0;
    totalRepayment = principal;
  } else {
    const monthlyRate = annualRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, repaymentMonths);
    monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
    
    // In standard reducing-balance without capitalized interest in simple moratorium:
    const regularRepayments = monthlyEmi * repaymentMonths;
    // Simple interest during moratorium if applicable
    const moratoriumInterest = (principal * monthlyRate) * moratoriumMonths;
    totalRepayment = regularRepayments + moratoriumInterest;
    totalInterest = totalRepayment - principal;
  }

  // Generate full monthly schedule
  let currentBalance = principal;
  const monthlyRate = annualRate > 0 ? (annualRate / 12 / 100) : 0;
  const schedule: AmortizationScheduleRow[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const isMoratorium = m <= moratoriumMonths;
    const year = Math.ceil(m / 12);
    const beginningBalance = currentBalance;
    
    let interestPaid = 0;
    let principalPaid = 0;
    let emiForMonth = 0;

    if (isMoratorium) {
      // During moratorium: interest is serviced only or waived
      interestPaid = beginningBalance * monthlyRate;
      principalPaid = 0;
      emiForMonth = interestPaid;
      currentBalance = beginningBalance;
    } else {
      if (annualRate === 0) {
        interestPaid = 0;
        principalPaid = Math.min(beginningBalance, monthlyEmi);
        emiForMonth = principalPaid;
        currentBalance = Math.max(0, beginningBalance - principalPaid);
      } else {
        interestPaid = beginningBalance * monthlyRate;
        principalPaid = Math.min(beginningBalance, monthlyEmi - interestPaid);
        emiForMonth = principalPaid + interestPaid;
        currentBalance = Math.max(0, beginningBalance - principalPaid);
      }
    }

    schedule.push({
      month: m,
      year,
      beginningBalance: Math.round(beginningBalance),
      emi: Math.round(emiForMonth),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interestPaid),
      endingBalance: Math.round(currentBalance),
      isMoratorium
    });
  }

  // Aggregate by year
  const yearlySummaryMap = new Map<number, { year: number; principalPaid: number; interestPaid: number; endingBalance: number }>();
  schedule.forEach((row) => {
    const current = yearlySummaryMap.get(row.year) || {
      year: row.year,
      principalPaid: 0,
      interestPaid: 0,
      endingBalance: 0
    };
    current.principalPaid += row.principalPaid;
    current.interestPaid += row.interestPaid;
    current.endingBalance = row.endingBalance;
    yearlySummaryMap.set(row.year, current);
  });

  return {
    monthlyEmi: Math.round(monthlyEmi),
    principal: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(totalRepayment),
    effectiveAnnualRate: annualRate,
    tenureYears,
    tenureMonths: totalMonths,
    moratoriumMonths,
    schedule,
    yearlySummary: Array.from(yearlySummaryMap.values()),
    disclaimer: EMI_DISCLAIMER
  };
}

/**
 * Format currency in standard Indian format (e.g. ₹4,50,000 or ₹4.5 Lakh)
 */
export function formatIndianCurrency(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
    return `₹${Math.round(amount)}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
