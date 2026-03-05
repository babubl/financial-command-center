// ─── Sample Financial Data ───
// Realistic Indian middle-upper class profile for demo.
// All values in INR. User replaces with their own data.

const sampleData = {
  profile: {
    name: 'Rahul Sharma',
    age: 35,
    retirementAge: 55,
    taxRegime: 'new',     // 'new' | 'old'
    city: 'Bangalore',
    dependents: 2,         // spouse + 1 child
  },

  // ─── INCOME ───
  income: {
    monthly: {
      salary: 185000,
      rental: 22000,
      interest: 3500,
      dividends: 1800,
      freelance: 0,
    },
    annual: {
      bonus: 350000,
      otherIncome: 0,
    },
  },

  // ─── ASSETS ───
  assets: [
    // Equity
    { id: 'a1', type: 'equity', name: 'Direct Stocks (Zerodha)', value: 820000, investedValue: 650000 },
    { id: 'a2', type: 'equity', name: 'US Stocks (INDMoney)', value: 180000, investedValue: 200000 },

    // Mutual Funds
    { id: 'a3', type: 'mutualFund', name: 'Nifty 50 Index Fund', value: 540000, investedValue: 420000, sipAmount: 10000 },
    { id: 'a4', type: 'mutualFund', name: 'Parag Parikh Flexi Cap', value: 380000, investedValue: 300000, sipAmount: 8000 },
    { id: 'a5', type: 'mutualFund', name: 'ELSS Tax Saver', value: 220000, investedValue: 175000, sipAmount: 5000 },
    { id: 'a6', type: 'mutualFund', name: 'SBI Small Cap', value: 165000, investedValue: 120000, sipAmount: 5000 },
    { id: 'a7', type: 'mutualFund', name: 'HDFC Balanced Advantage', value: 290000, investedValue: 250000, sipAmount: 7000 },

    // Real Estate
    { id: 'a8', type: 'realEstate', name: '2BHK Whitefield', value: 8500000, investedValue: 6200000 },

    // Gold
    { id: 'a9', type: 'gold', name: 'SGB 2029 Series', value: 350000, investedValue: 280000 },
    { id: 'a10', type: 'gold', name: 'Physical Gold (22K)', value: 420000, investedValue: 320000 },

    // Fixed Deposits
    { id: 'a11', type: 'fd', name: 'SBI FD (8.1%)', value: 500000, investedValue: 500000, maturityDate: '2026-03-15' },
    { id: 'a12', type: 'fd', name: 'HDFC FD (7.75%)', value: 300000, investedValue: 300000, maturityDate: '2027-06-01' },

    // PPF / EPF
    { id: 'a13', type: 'ppfEpf', name: 'PPF (SBI)', value: 680000, investedValue: 580000 },
    { id: 'a14', type: 'ppfEpf', name: 'EPF Balance', value: 920000, investedValue: 780000 },

    // NPS
    { id: 'a15', type: 'nps', name: 'NPS Tier 1', value: 240000, investedValue: 200000 },

    // Cash
    { id: 'a16', type: 'cash', name: 'HDFC Savings Account', value: 185000, investedValue: 185000 },
    { id: 'a17', type: 'cash', name: 'Kotak 811 Account', value: 42000, investedValue: 42000 },
  ],

  // ─── LIABILITIES ───
  liabilities: [
    {
      id: 'l1',
      type: 'home',
      name: 'Home Loan (SBI)',
      principal: 4200000,
      outstanding: 3650000,
      emi: 38500,
      rate: 8.5,
      tenureMonths: 216,     // 18 years total
      remainingMonths: 168,  // 14 years left
      startDate: '2021-06-01',
    },
    {
      id: 'l2',
      type: 'car',
      name: 'Car Loan (HDFC)',
      principal: 600000,
      outstanding: 280000,
      emi: 12800,
      rate: 9.2,
      tenureMonths: 60,
      remainingMonths: 24,
      startDate: '2023-03-01',
    },
    {
      id: 'l3',
      type: 'credit',
      name: 'HDFC Credit Card',
      principal: 0,
      outstanding: 35000,
      emi: 0,
      rate: 42,              // Revolving credit
      tenureMonths: 0,
      remainingMonths: 0,
    },
  ],

  // ─── TAX DEDUCTIONS (FY 2025-26) ───
  taxDeductions: {
    section80C: {
      epf: 21600,        // 12% of basic per month * 12
      ppf: 50000,
      elss: 60000,        // SIP * 12
      liPremium: 24000,
      tuitionFees: 0,
      hlPrincipal: 48000,
    },
    section80D: {
      selfFamily: 18000,   // Health insurance premium
      parents: 12000,
    },
    section80CCD1B: 50000,  // NPS
    section24b: 180000,      // Home loan interest claimed
    hra: 0,                  // Claiming HRA (old regime only)
  },

  // ─── MONTHLY BUDGET ───
  budget: {
    expenses: [
      { category: 'housing',       amount: 8000,  label: 'Maintenance + Society' },
      { category: 'emi',           amount: 51300, label: 'Home + Car EMI' },
      { category: 'food',          amount: 15000, label: 'Groceries + Dining' },
      { category: 'transport',     amount: 8000,  label: 'Fuel + Uber' },
      { category: 'utilities',     amount: 5500,  label: 'Electric + Internet + Phone' },
      { category: 'medical',       amount: 3000,  label: 'Medicines + Doctor' },
      { category: 'education',     amount: 12000, label: 'Child School Fees' },
      { category: 'entertainment', amount: 6000,  label: 'OTT + Outings' },
      { category: 'shopping',      amount: 8000,  label: 'Clothes + Amazon' },
      { category: 'insurance',     amount: 4500,  label: 'Term + Health + Car' },
      { category: 'investment',    amount: 35000, label: 'SIPs' },
      { category: 'other',         amount: 5000,  label: 'Miscellaneous' },
    ],
  },

  // ─── FINANCIAL GOALS ───
  goals: [
    {
      id: 'g1',
      name: 'Retirement Corpus',
      targetAmount: 50000000,   // ₹5 Cr
      currentAmount: 2400000,
      monthlySIP: 15000,
      targetYear: 2046,         // Age 55
      expectedReturn: 0.12,
      priority: 'critical',
    },
    {
      id: 'g2',
      name: 'Child Higher Education',
      targetAmount: 3000000,    // ₹30L
      currentAmount: 220000,
      monthlySIP: 8000,
      targetYear: 2040,         // Child age 18
      expectedReturn: 0.11,
      priority: 'high',
    },
    {
      id: 'g3',
      name: 'Emergency Fund',
      targetAmount: 1200000,    // 6 months expenses
      currentAmount: 227000,    // Savings accounts
      monthlySIP: 5000,
      targetYear: 2028,
      expectedReturn: 0.06,
      priority: 'critical',
    },
    {
      id: 'g4',
      name: 'Europe Trip',
      targetAmount: 500000,
      currentAmount: 80000,
      monthlySIP: 10000,
      targetYear: 2027,
      expectedReturn: 0.07,
      priority: 'medium',
    },
    {
      id: 'g5',
      name: 'Car Upgrade',
      targetAmount: 1500000,
      currentAmount: 150000,
      monthlySIP: 0,
      targetYear: 2029,
      expectedReturn: 0.08,
      priority: 'low',
    },
  ],

  // ─── INSURANCE ───
  insurance: {
    term: { cover: 10000000, premium: 14000, provider: 'HDFC Click2Protect' },
    health: { cover: 1000000, premium: 18000, provider: 'Star Health' },
    car: { premium: 12000, provider: 'ICICI Lombard' },
  },
};

export default sampleData;
