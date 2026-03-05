// ─── Financial Calculation Engine ───
// Pure functions. No side effects. Fully testable.

import {
  computeTax,
  section80C,
  deductionLimits,
  benchmarks,
  emergencyFundRules,
  healthWeights,
  thresholds,
} from '@/constants/financialRules';
import { assetTypes } from '@/config/theme';

// ════════════════════════════════════════
// NET WORTH
// ════════════════════════════════════════

/**
 * Calculate total assets, total liabilities, net worth
 */
export const calcNetWorth = (assets, liabilities) => {
  const totalAssets = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.outstanding || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return { totalAssets, totalLiabilities, netWorth };
};

/**
 * Asset allocation breakdown by type
 * Returns [{ type, label, value, pct, color }]
 */
export const calcAssetAllocation = (assets) => {
  const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  if (totalValue === 0) return [];

  const grouped = {};
  for (const asset of assets) {
    if (!grouped[asset.type]) {
      grouped[asset.type] = 0;
    }
    grouped[asset.type] += asset.value || 0;
  }

  return Object.entries(grouped)
    .map(([type, value]) => ({
      type,
      label: assetTypes[type]?.label || type,
      value,
      pct: value / totalValue,
      color: assetTypes[type]?.color || '#94A3B8',
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Total unrealized gains/losses
 */
export const calcUnrealizedGains = (assets) => {
  let totalInvested = 0;
  let totalCurrent = 0;

  for (const a of assets) {
    totalInvested += a.investedValue || 0;
    totalCurrent += a.value || 0;
  }

  const absoluteGain = totalCurrent - totalInvested;
  const pctGain = totalInvested > 0 ? absoluteGain / totalInvested : 0;

  return { totalInvested, totalCurrent, absoluteGain, pctGain };
};

// ════════════════════════════════════════
// INCOME & BUDGET
// ════════════════════════════════════════

/**
 * Calculate monthly and annual income
 */
export const calcIncome = (income) => {
  const monthly = Object.values(income.monthly || {}).reduce((s, v) => s + (v || 0), 0);
  const annualFromMonthly = monthly * 12;
  const annualExtra = Object.values(income.annual || {}).reduce((s, v) => s + (v || 0), 0);
  const totalAnnual = annualFromMonthly + annualExtra;

  return { monthly, annualFromMonthly, annualExtra, totalAnnual };
};

/**
 * Calculate budget summary
 */
export const calcBudget = (budget, income) => {
  const totalExpenses = budget.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const monthlyIncome = calcIncome(income).monthly;
  const monthlySurplus = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? monthlySurplus / monthlyIncome : 0;

  // Separate needs vs wants
  const needsCategories = ['housing', 'emi', 'food', 'utilities', 'medical', 'insurance', 'education'];
  const needs = budget.expenses
    .filter((e) => needsCategories.includes(e.category))
    .reduce((s, e) => s + (e.amount || 0), 0);
  const wants = totalExpenses - needs;
  const investments = budget.expenses
    .filter((e) => e.category === 'investment')
    .reduce((s, e) => s + (e.amount || 0), 0);

  return {
    totalExpenses,
    monthlyIncome,
    monthlySurplus,
    savingsRate,
    needs,
    wants: wants - investments,
    investments,
    needsPct: totalExpenses > 0 ? needs / totalExpenses : 0,
    wantsPct: totalExpenses > 0 ? (wants - investments) / totalExpenses : 0,
    investmentsPct: totalExpenses > 0 ? investments / totalExpenses : 0,
  };
};

// ════════════════════════════════════════
// DEBT ANALYSIS
// ════════════════════════════════════════

/**
 * Total EMI, total outstanding, debt-to-income ratio
 */
export const calcDebtSummary = (liabilities, monthlyIncome) => {
  const totalOutstanding = liabilities.reduce((s, l) => s + (l.outstanding || 0), 0);
  const totalEMI = liabilities.reduce((s, l) => s + (l.emi || 0), 0);
  const debtToIncome = monthlyIncome > 0 ? totalEMI / monthlyIncome : 0;

  // Total interest payable (simplified estimate)
  const totalInterest = liabilities.reduce((s, l) => {
    return s + (l.emi * l.remainingMonths - l.outstanding);
  }, 0);

  return { totalOutstanding, totalEMI, debtToIncome, totalInterest };
};

/**
 * Loan prepayment impact calculator
 */
export const calcPrepaymentSavings = (loan, prepayAmount) => {
  if (!loan || !prepayAmount || prepayAmount <= 0) return null;

  const monthlyRate = loan.rate / 100 / 12;
  const currentEMI = loan.emi;
  const newOutstanding = loan.outstanding - prepayAmount;

  if (newOutstanding <= 0) {
    return {
      interestSaved: currentEMI * loan.remainingMonths - loan.outstanding,
      monthsSaved: loan.remainingMonths,
      newTenure: 0,
    };
  }

  // New tenure keeping same EMI
  const newTenure = Math.ceil(
    -Math.log(1 - (newOutstanding * monthlyRate) / currentEMI) / Math.log(1 + monthlyRate)
  );

  const monthsSaved = loan.remainingMonths - newTenure;
  const currentTotalPayment = currentEMI * loan.remainingMonths;
  const newTotalPayment = currentEMI * newTenure + prepayAmount;
  const interestSaved = currentTotalPayment - newTotalPayment;

  return { interestSaved: Math.max(0, interestSaved), monthsSaved, newTenure };
};

// ════════════════════════════════════════
// TAX
// ════════════════════════════════════════

/**
 * Calculate tax under both regimes and recommend
 */
export const calcTaxComparison = (income, deductions) => {
  const { totalAnnual } = calcIncome(income);

  // --- NEW REGIME ---
  const newTaxableIncome = totalAnnual - deductionLimits.standardDeduction;
  const newTax = computeTax(Math.max(0, newTaxableIncome), 'new');

  // --- OLD REGIME ---
  // 80C total
  const total80C = Math.min(
    section80C.limit,
    Object.values(deductions.section80C || {}).reduce((s, v) => s + (v || 0), 0)
  );

  // 80D total
  const total80D = Math.min(
    (deductions.section80D?.selfFamily || 0),
    deductionLimits.section80D.self
  ) + Math.min(
    (deductions.section80D?.parents || 0),
    deductionLimits.section80D.parents
  );

  const nps80CCD = Math.min(deductions.section80CCD1B || 0, deductionLimits.section80CCD1B);
  const homeLoanInterest = Math.min(deductions.section24b || 0, deductionLimits.section24b);
  const hra = deductions.hra || 0;

  const oldDeductions = total80C + total80D + nps80CCD + homeLoanInterest + hra + deductionLimits.standardDeductionOld;
  const oldTaxableIncome = totalAnnual - oldDeductions;
  const oldTax = computeTax(Math.max(0, oldTaxableIncome), 'old');

  const betterRegime = newTax <= oldTax ? 'new' : 'old';
  const savings = Math.abs(newTax - oldTax);

  // 80C utilization
  const used80C = Object.values(deductions.section80C || {}).reduce((s, v) => s + (v || 0), 0);
  const remaining80C = Math.max(0, section80C.limit - used80C);

  return {
    newRegime: { taxableIncome: newTaxableIncome, tax: newTax },
    oldRegime: { taxableIncome: oldTaxableIncome, tax: oldTax, totalDeductions: oldDeductions },
    betterRegime,
    savings,
    section80C: { used: used80C, limit: section80C.limit, remaining: remaining80C, pct: used80C / section80C.limit },
    grossIncome: totalAnnual,
  };
};

// ════════════════════════════════════════
// GOALS
// ════════════════════════════════════════

/**
 * Future value of current corpus + SIP at expected return
 */
export const calcGoalProjection = (goal) => {
  const now = new Date();
  const targetDate = new Date(goal.targetYear, 3, 1); // April of target year
  const monthsRemaining = Math.max(0, (targetDate - now) / (1000 * 60 * 60 * 24 * 30.44));
  const monthlyReturn = goal.expectedReturn / 12;

  // FV of existing corpus
  const corpusFV = goal.currentAmount * Math.pow(1 + monthlyReturn, monthsRemaining);

  // FV of SIP
  let sipFV = 0;
  if (monthlyReturn > 0 && goal.monthlySIP > 0) {
    sipFV = goal.monthlySIP * ((Math.pow(1 + monthlyReturn, monthsRemaining) - 1) / monthlyReturn) * (1 + monthlyReturn);
  }

  const projectedAmount = corpusFV + sipFV;
  const shortfall = Math.max(0, goal.targetAmount - projectedAmount);
  const surplus = Math.max(0, projectedAmount - goal.targetAmount);
  const progressPct = Math.min(1, goal.currentAmount / goal.targetAmount);
  const onTrack = projectedAmount >= goal.targetAmount;

  // Required monthly SIP to meet goal (if current plan falls short)
  let requiredSIP = 0;
  if (shortfall > 0 && monthlyReturn > 0 && monthsRemaining > 0) {
    const remainingTarget = goal.targetAmount - corpusFV;
    requiredSIP = remainingTarget / (((Math.pow(1 + monthlyReturn, monthsRemaining) - 1) / monthlyReturn) * (1 + monthlyReturn));
  }

  return {
    projectedAmount: Math.round(projectedAmount),
    shortfall: Math.round(shortfall),
    surplus: Math.round(surplus),
    progressPct,
    onTrack,
    requiredSIP: Math.round(Math.max(0, requiredSIP)),
    monthsRemaining: Math.round(monthsRemaining),
    corpusFV: Math.round(corpusFV),
    sipFV: Math.round(sipFV),
  };
};

/**
 * Compute all goals projections
 */
export const calcAllGoals = (goals) => {
  return goals.map((goal) => ({
    ...goal,
    projection: calcGoalProjection(goal),
  }));
};

// ════════════════════════════════════════
// EMERGENCY FUND
// ════════════════════════════════════════

export const calcEmergencyFund = (budget, assets) => {
  const monthlyExpenses = budget.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const target = monthlyExpenses * emergencyFundRules.monthsTarget;
  const minimum = monthlyExpenses * emergencyFundRules.minimumMonths;

  // Count liquid assets as emergency fund
  const liquidAssets = assets
    .filter((a) => a.type === 'cash' || a.type === 'fd')
    .reduce((s, a) => s + (a.value || 0), 0);

  const monthsCovered = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;
  const gap = Math.max(0, target - liquidAssets);
  const score = Math.min(1, liquidAssets / target);

  return { target, minimum, liquidAssets, monthsCovered, gap, score, monthlyExpenses };
};

// ════════════════════════════════════════
// INSURANCE ADEQUACY
// ════════════════════════════════════════

export const calcInsuranceAdequacy = (insurance, income) => {
  const { totalAnnual } = calcIncome(income);
  const recommendedTermCover = totalAnnual * thresholds.insuranceMultiple;
  const currentTermCover = insurance?.term?.cover || 0;
  const termCoverRatio = recommendedTermCover > 0 ? currentTermCover / recommendedTermCover : 0;
  const termGap = Math.max(0, recommendedTermCover - currentTermCover);

  const healthCover = insurance?.health?.cover || 0;
  const recommendedHealth = 1000000; // ₹10L minimum
  const healthAdequate = healthCover >= recommendedHealth;

  return {
    recommendedTermCover,
    currentTermCover,
    termCoverRatio,
    termGap,
    healthCover,
    recommendedHealth,
    healthAdequate,
  };
};

// ════════════════════════════════════════
// FINANCIAL HEALTH SCORE (0-100)
// ════════════════════════════════════════

export const calcHealthScore = (data) => {
  const { assets, liabilities, income, budget, goals, insurance, taxDeductions } = data;
  const monthlyIncome = calcIncome(income).monthly;
  let score = 0;

  // 1. Emergency Fund (20%)
  const ef = calcEmergencyFund(budget, assets);
  const efScore = Math.min(1, ef.monthsCovered / emergencyFundRules.monthsTarget);
  score += efScore * healthWeights.emergencyFund * 100;

  // 2. Debt-to-Income (20%)
  const debt = calcDebtSummary(liabilities, monthlyIncome);
  let dtiScore = 1;
  if (debt.debtToIncome > thresholds.debtToIncomeDanger) dtiScore = 0.2;
  else if (debt.debtToIncome > thresholds.debtToIncomeHealthy) dtiScore = 0.5;
  else if (debt.debtToIncome > 0.2) dtiScore = 0.8;
  score += dtiScore * healthWeights.debtToIncome * 100;

  // 3. Savings Rate (15%)
  const budgetCalc = calcBudget(budget, income);
  let srScore = 0;
  if (budgetCalc.savingsRate >= thresholds.savingsRateExcellent) srScore = 1;
  else if (budgetCalc.savingsRate >= thresholds.savingsRateGood) srScore = 0.8;
  else if (budgetCalc.savingsRate >= 0.15) srScore = 0.5;
  else srScore = 0.2;
  score += srScore * healthWeights.savingsRate * 100;

  // 4. Diversification (15%)
  const allocation = calcAssetAllocation(assets);
  const maxPct = allocation.length > 0 ? allocation[0].pct : 0;
  let divScore = 1;
  if (maxPct > 0.7) divScore = 0.2;
  else if (maxPct > thresholds.singleAssetMaxPct) divScore = 0.5;
  else if (maxPct > 0.3) divScore = 0.8;
  score += divScore * healthWeights.diversification * 100;

  // 5. Tax Efficiency (10%)
  const tax = calcTaxComparison(income, taxDeductions);
  const taxScore = Math.min(1, tax.section80C.pct);
  score += taxScore * healthWeights.taxEfficiency * 100;

  // 6. Goal Progress (10%)
  const goalProjections = calcAllGoals(goals);
  const onTrackCount = goalProjections.filter((g) => g.projection.onTrack).length;
  const goalScore = goals.length > 0 ? onTrackCount / goals.length : 0;
  score += goalScore * healthWeights.goalProgress * 100;

  // 7. Insurance Cover (10%)
  const ins = calcInsuranceAdequacy(insurance, income);
  const insScore = Math.min(1, ins.termCoverRatio) * 0.7 + (ins.healthAdequate ? 0.3 : 0);
  score += insScore * healthWeights.insuranceCover * 100;

  return {
    overall: Math.round(score),
    breakdown: {
      emergencyFund: { score: Math.round(efScore * 100), weight: healthWeights.emergencyFund },
      debtManagement: { score: Math.round(dtiScore * 100), weight: healthWeights.debtToIncome },
      savingsRate: { score: Math.round(srScore * 100), weight: healthWeights.savingsRate },
      diversification: { score: Math.round(divScore * 100), weight: healthWeights.diversification },
      taxEfficiency: { score: Math.round(taxScore * 100), weight: healthWeights.taxEfficiency },
      goalProgress: { score: Math.round(goalScore * 100), weight: healthWeights.goalProgress },
      insuranceCover: { score: Math.round(insScore * 100), weight: healthWeights.insuranceCover },
    },
  };
};

// ════════════════════════════════════════
// AI AGENT CONTEXT BUILDER
// ════════════════════════════════════════

/**
 * Build a compact JSON summary of all financial data for the AI agent.
 * This gets injected as system prompt context.
 */
export const buildAgentContext = (data) => {
  const { assets, liabilities, income, budget, goals, insurance, taxDeductions, profile } = data;

  const nw = calcNetWorth(assets, liabilities);
  const inc = calcIncome(income);
  const bgt = calcBudget(budget, income);
  const debt = calcDebtSummary(liabilities, inc.monthly);
  const tax = calcTaxComparison(income, taxDeductions);
  const ef = calcEmergencyFund(budget, assets);
  const health = calcHealthScore(data);
  const allocation = calcAssetAllocation(assets);
  const goalData = calcAllGoals(goals);
  const ins = calcInsuranceAdequacy(insurance, income);
  const gains = calcUnrealizedGains(assets);

  return {
    profile,
    snapshot: {
      netWorth: nw.netWorth,
      totalAssets: nw.totalAssets,
      totalLiabilities: nw.totalLiabilities,
      healthScore: health.overall,
      healthBreakdown: health.breakdown,
    },
    income: {
      monthly: inc.monthly,
      annual: inc.totalAnnual,
    },
    budget: {
      monthlyExpenses: bgt.totalExpenses,
      savingsRate: bgt.savingsRate,
      surplus: bgt.monthlySurplus,
      needs: bgt.needs,
      wants: bgt.wants,
      investments: bgt.investments,
    },
    assetAllocation: allocation.map((a) => ({
      type: a.label,
      value: a.value,
      pct: Math.round(a.pct * 100),
    })),
    unrealizedGains: {
      invested: gains.totalInvested,
      current: gains.totalCurrent,
      gain: gains.absoluteGain,
      returnPct: Math.round(gains.pctGain * 100),
    },
    debts: liabilities.map((l) => ({
      name: l.name,
      outstanding: l.outstanding,
      emi: l.emi,
      rate: l.rate,
      remainingMonths: l.remainingMonths,
    })),
    debtSummary: {
      totalOutstanding: debt.totalOutstanding,
      totalEMI: debt.totalEMI,
      debtToIncome: Math.round(debt.debtToIncome * 100),
    },
    tax: {
      grossIncome: tax.grossIncome,
      newRegimeTax: tax.newRegime.tax,
      oldRegimeTax: tax.oldRegime.tax,
      betterRegime: tax.betterRegime,
      savings: tax.savings,
      section80C_used: tax.section80C.used,
      section80C_remaining: tax.section80C.remaining,
    },
    emergencyFund: {
      liquidAssets: ef.liquidAssets,
      target: ef.target,
      monthsCovered: Math.round(ef.monthsCovered * 10) / 10,
      gap: ef.gap,
    },
    goals: goalData.map((g) => ({
      name: g.name,
      target: g.targetAmount,
      current: g.currentAmount,
      monthlySIP: g.monthlySIP,
      targetYear: g.targetYear,
      projected: g.projection.projectedAmount,
      onTrack: g.projection.onTrack,
      shortfall: g.projection.shortfall,
      requiredSIP: g.projection.requiredSIP,
    })),
    insurance: {
      termCover: ins.currentTermCover,
      recommendedTermCover: ins.recommendedTermCover,
      termGap: ins.termGap,
      healthCover: ins.healthCover,
      healthAdequate: ins.healthAdequate,
    },
  };
};
