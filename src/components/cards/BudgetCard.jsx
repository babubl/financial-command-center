// ─── Budget Card ───
import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card, { CardDivider, CardRow } from '@/components/shared/Card';
import MetricTile, { MetricRow } from '@/components/shared/MetricTile';
import { MiniProgress, MiniBarChart } from '@/components/shared/MiniChart';
import { AlertBadge } from '@/components/shared/AlertBadge';
import { formatINR, formatPct } from '@/utils/formatters';
import { expenseCategories } from '@/config/theme';
import { PieChart } from 'lucide-react';

export default function BudgetCard({ onEdit }) {
  const { budgetCalc, budget, emergencyFund } = useFinanceStore();

  // Category breakdown for bar chart
  const categoryData = budget.expenses
    .map((e) => ({
      label: expenseCategories[e.category]?.label || e.category,
      value: e.amount,
      color: expenseCategories[e.category]?.color || '#94A3B8',
      displayValue: formatINR(e.amount, true),
    }))
    .sort((a, b) => b.value - a.value);

  const savingsColor = budgetCalc.savingsRate >= 0.3
    ? '#10B981'
    : budgetCalc.savingsRate >= 0.15
    ? '#F59E0B'
    : '#EF4444';

  return (
    <Card title="Monthly Budget" icon={PieChart} iconColor="#60A5FA" onEdit={onEdit} module="budget">
      {/* Income vs Expenses */}
      <div className="flex items-start gap-5">
        <MetricTile
          label="Monthly Income"
          value={formatINR(budgetCalc.monthlyIncome, true)}
          color="#10B981"
          size="md"
        />
        <MetricTile
          label="Monthly Expenses"
          value={formatINR(budgetCalc.totalExpenses, true)}
          color="#F59E0B"
          size="md"
        />
      </div>

      <CardDivider />

      {/* Surplus + Savings Rate */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="section-label">Monthly Surplus</p>
          <p className={`text-base font-mono font-bold ${budgetCalc.monthlySurplus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {budgetCalc.monthlySurplus >= 0 ? '+' : ''}{formatINR(budgetCalc.monthlySurplus, true)}
          </p>
        </div>
        <div className="text-right">
          <p className="section-label">Savings Rate</p>
          <p className="text-base font-mono font-bold" style={{ color: savingsColor }}>
            {formatPct(budgetCalc.savingsRate, 0)}
          </p>
        </div>
      </div>

      <MiniProgress value={budgetCalc.savingsRate} color={savingsColor} height={6} />
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-dim">0%</span>
        <span className="text-[10px] text-dim">30% target</span>
        <span className="text-[10px] text-dim">50%+</span>
      </div>

      <CardDivider />

      {/* 50/30/20 Rule */}
      <p className="section-label mb-2">Spending Split</p>
      <div className="grid grid-cols-3 gap-2">
        <SplitBox
          label="Needs"
          value={formatINR(budgetCalc.needs, true)}
          pct={budgetCalc.needsPct}
          target={0.5}
          color="#60A5FA"
        />
        <SplitBox
          label="Wants"
          value={formatINR(budgetCalc.wants, true)}
          pct={budgetCalc.wantsPct}
          target={0.3}
          color="#F59E0B"
        />
        <SplitBox
          label="Invest"
          value={formatINR(budgetCalc.investments, true)}
          pct={budgetCalc.investmentsPct}
          target={0.2}
          color="#10B981"
        />
      </div>

      <CardDivider />

      {/* Top Expense Categories */}
      <p className="section-label mb-2">Top Expenses</p>
      <MiniBarChart
        data={categoryData.slice(0, 5)}
        barHeight={6}
        showLabels
        showValues
      />

      {/* Emergency Fund */}
      <CardDivider />
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label">Emergency Fund</p>
          <p className="text-[11px] text-muted mt-0.5">
            {emergencyFund.monthsCovered.toFixed(1)} months covered (target: 6)
          </p>
        </div>
        <AlertBadge
          type={emergencyFund.monthsCovered >= 6 ? 'success' : emergencyFund.monthsCovered >= 3 ? 'warn' : 'danger'}
          text={emergencyFund.monthsCovered >= 6 ? 'Adequate' : `Gap: ${formatINR(emergencyFund.gap, true)}`}
        />
      </div>
    </Card>
  );
}

function SplitBox({ label, value, pct, target, color }) {
  const actualPct = Math.round(pct * 100);
  const targetPct = Math.round(target * 100);
  const isOver = pct > target;

  return (
    <div className="text-center px-2 py-2 rounded-lg bg-navy-900/40 border border-navy-500/20">
      <p className="text-[10px] text-muted mb-1">{label}</p>
      <p className="text-xs font-mono font-bold text-slate-100">{value}</p>
      <p className={`text-[10px] mt-0.5 ${isOver ? 'text-amber-400' : 'text-emerald-400'}`}>
        {actualPct}%
        <span className="text-dim"> / {targetPct}%</span>
      </p>
    </div>
  );
}
