// ─── useFinanceStore ───
// Custom hook that provides memoized computed financial metrics.
// Components consume this instead of running calculations directly.

import { useMemo } from 'react';
import { useFinance } from './FinanceContext';
import {
  calcNetWorth,
  calcAssetAllocation,
  calcUnrealizedGains,
  calcIncome,
  calcBudget,
  calcDebtSummary,
  calcTaxComparison,
  calcEmergencyFund,
  calcInsuranceAdequacy,
  calcHealthScore,
  calcAllGoals,
} from '@/services/calculations';
import { generateInsights } from '@/services/aiAgent';

export function useFinanceStore() {
  const data = useFinance();

  const { assets, liabilities, income, budget, goals, insurance, taxDeductions, profile } = data;

  // ─── Net Worth ───
  const netWorth = useMemo(
    () => calcNetWorth(assets, liabilities),
    [assets, liabilities]
  );

  // ─── Asset Allocation ───
  const assetAllocation = useMemo(
    () => calcAssetAllocation(assets),
    [assets]
  );

  // ─── Unrealized Gains ───
  const gains = useMemo(
    () => calcUnrealizedGains(assets),
    [assets]
  );

  // ─── Income ───
  const incomeCalc = useMemo(
    () => calcIncome(income),
    [income]
  );

  // ─── Budget ───
  const budgetCalc = useMemo(
    () => calcBudget(budget, income),
    [budget, income]
  );

  // ─── Debt ───
  const debtSummary = useMemo(
    () => calcDebtSummary(liabilities, incomeCalc.monthly),
    [liabilities, incomeCalc.monthly]
  );

  // ─── Tax ───
  const taxComparison = useMemo(
    () => calcTaxComparison(income, taxDeductions),
    [income, taxDeductions]
  );

  // ─── Emergency Fund ───
  const emergencyFund = useMemo(
    () => calcEmergencyFund(budget, assets),
    [budget, assets]
  );

  // ─── Insurance ───
  const insuranceAdequacy = useMemo(
    () => calcInsuranceAdequacy(insurance, income),
    [insurance, income]
  );

  // ─── Goals ───
  const goalProjections = useMemo(
    () => calcAllGoals(goals),
    [goals]
  );

  // ─── Health Score ───
  const healthScore = useMemo(
    () => calcHealthScore(data),
    [data]
  );

  // ─── AI Insights ───
  const insights = useMemo(
    () => generateInsights(data),
    [data]
  );

  return {
    // Raw data
    profile,
    assets,
    liabilities,
    income,
    budget,
    goals,
    insurance,
    taxDeductions,

    // Computed
    netWorth,
    assetAllocation,
    gains,
    incomeCalc,
    budgetCalc,
    debtSummary,
    taxComparison,
    emergencyFund,
    insuranceAdequacy,
    goalProjections,
    healthScore,
    insights,

    // UI
    ui: data._ui,

    // Full data (for agent context)
    fullData: data,
  };
}
