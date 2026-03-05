// ─── Indian Financial Rules & Constants (FY 2025-26) ───

// New Tax Regime (Default from FY 2024-25)
export const newRegimeSlabs = [
  { min: 0,       max: 400000,   rate: 0 },
  { min: 400000,  max: 800000,   rate: 0.05 },
  { min: 800000,  max: 1200000,  rate: 0.10 },
  { min: 1200000, max: 1600000,  rate: 0.15 },
  { min: 1600000, max: 2000000,  rate: 0.20 },
  { min: 2000000, max: 2400000,  rate: 0.25 },
  { min: 2400000, max: Infinity,  rate: 0.30 },
];

// Old Tax Regime
export const oldRegimeSlabs = [
  { min: 0,       max: 250000,   rate: 0 },
  { min: 250000,  max: 500000,   rate: 0.05 },
  { min: 500000,  max: 1000000,  rate: 0.20 },
  { min: 1000000, max: Infinity,  rate: 0.30 },
];

// Section 80C components
export const section80C = {
  limit: 150000,
  components: [
    { id: 'elss',  label: 'ELSS Mutual Funds',  lockIn: '3 years' },
    { id: 'ppf',   label: 'PPF',                lockIn: '15 years' },
    { id: 'epf',   label: 'EPF (Employee)',      lockIn: 'Till retirement' },
    { id: 'nsc',   label: 'NSC',                lockIn: '5 years' },
    { id: 'li',    label: 'Life Insurance',      lockIn: 'Policy term' },
    { id: 'tuition', label: 'Tuition Fees',      lockIn: 'N/A' },
    { id: 'fd5yr', label: '5-Year Tax Saver FD', lockIn: '5 years' },
    { id: 'ssy',   label: 'Sukanya Samriddhi',  lockIn: '21 years' },
    { id: 'hlPrincipal', label: 'Home Loan Principal', lockIn: 'N/A' },
  ],
};

// Other deduction limits
export const deductionLimits = {
  section80D: {
    self: 25000,      // Health insurance (self + family)
    selfSenior: 50000,
    parents: 25000,
    parentsSenior: 50000,
    preventiveCheckup: 5000, // Included in above limits
  },
  section80CCD1B: 50000,      // NPS additional
  section80TTA: 10000,         // Savings interest
  section80TTB: 50000,         // Savings interest (seniors)
  section24b: 200000,          // Home loan interest
  standardDeduction: 75000,    // New regime FY 2025-26
  standardDeductionOld: 50000, // Old regime
};

// Benchmark rates
export const benchmarks = {
  inflation: 0.06,             // 6% CPI estimate
  equityReturn: 0.12,          // Long-term Nifty CAGR
  debtReturn: 0.07,            // FD/Debt fund average
  goldReturn: 0.10,            // Gold historical
  realEstateReturn: 0.08,      // Real estate appreciation
  savingsRate: 0.035,          // Savings account interest
  ppfRate: 0.071,              // PPF current rate
  epfRate: 0.0815,             // EPF current rate
  npsEquityReturn: 0.10,
};

// Emergency fund rules
export const emergencyFundRules = {
  monthsTarget: 6,             // Recommended months
  minimumMonths: 3,            // Absolute minimum
  idealMonths: 12,             // Conservative target
};

// Financial health scoring weights
export const healthWeights = {
  emergencyFund:    0.20,  // 20% — survival
  debtToIncome:     0.20,  // 20% — leverage risk
  savingsRate:      0.15,  // 15% — wealth building
  diversification:  0.15,  // 15% — concentration risk
  taxEfficiency:    0.10,  // 10% — tax optimization
  goalProgress:     0.10,  // 10% — on-track for goals
  insuranceCover:   0.10,  // 10% — protection
};

// Thresholds
export const thresholds = {
  savingsRateGood: 0.30,       // 30%+ is good
  savingsRateExcellent: 0.50,  // 50%+ is excellent
  debtToIncomeHealthy: 0.35,   // <35% is healthy
  debtToIncomeDanger: 0.50,    // >50% is danger
  singleAssetMaxPct: 0.40,     // No single asset >40% ideally
  insuranceMultiple: 10,       // 10x annual income
};

// Compute tax under a given regime
export const computeTax = (income, regime = 'new') => {
  const slabs = regime === 'new' ? newRegimeSlabs : oldRegimeSlabs;
  let tax = 0;
  let remaining = income;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, slab.max - slab.min);
    tax += taxable * slab.rate;
    remaining -= taxable;
  }

  // Cess at 4%
  tax = tax * 1.04;
  return Math.round(tax);
};
