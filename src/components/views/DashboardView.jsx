// ─── Dashboard View ───
// Main dashboard layout with all cards and editor modals.

import React, { useState } from 'react';
import DashboardGrid, { GridCell } from '@/components/layout/DashboardGrid';
import { useFinanceStore } from '@/store/useFinanceStore';
import { InsightCard } from '@/components/shared/AlertBadge';
import HealthScore from '@/components/shared/HealthScore';
import MetricTile, { MetricRow } from '@/components/shared/MetricTile';
import { formatINR, formatPct } from '@/utils/formatters';
import { getHealthColor, getHealthLabel } from '@/config/theme';
import { Wallet, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

// Cards
import NetWorthCard from '@/components/cards/NetWorthCard';
import TaxCard from '@/components/cards/TaxCard';
import DebtCard from '@/components/cards/DebtCard';
import InvestmentCard from '@/components/cards/InvestmentCard';
import GoalsCard from '@/components/cards/GoalsCard';
import BudgetCard from '@/components/cards/BudgetCard';

// Editors
import AssetEditor from '@/components/editors/AssetEditor';
import LiabilityEditor from '@/components/editors/LiabilityEditor';
import GoalEditor from '@/components/editors/GoalEditor';
import IncomeEditor from '@/components/editors/IncomeEditor';
import BudgetEditor from '@/components/editors/BudgetEditor';
import TaxEditor from '@/components/editors/TaxEditor';

export default function DashboardView() {
  const store = useFinanceStore();
  const { healthScore, insights, netWorth, incomeCalc, budgetCalc, debtSummary } = store;

  // Editor modal states
  const [assetEditorOpen, setAssetEditorOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [liabilityEditorOpen, setLiabilityEditorOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [goalEditorOpen, setGoalEditorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [incomeEditorOpen, setIncomeEditorOpen] = useState(false);
  const [budgetEditorOpen, setBudgetEditorOpen] = useState(false);
  const [taxEditorOpen, setTaxEditorOpen] = useState(false);

  return (
    <div className="p-5 space-y-5">
      {/* ══════ Hero Section ══════ */}
      <div className="glass-card p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <HealthScore score={healthScore.overall} size={72} strokeWidth={5} />
            <div>
              <p className="text-[10px] text-dim uppercase tracking-widest">Financial Health</p>
              <p className="text-lg font-bold" style={{ color: getHealthColor(healthScore.overall) }}>
                {getHealthLabel(healthScore.overall)}
              </p>
              <p className="text-[11px] text-dim mt-0.5">Score: {healthScore.overall}/100</p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-14 bg-navy-500/40" />

          <div className="flex-1">
            <MetricRow>
              <MetricTile
                label="Net Worth"
                value={formatINR(netWorth.netWorth, true)}
                icon={<Wallet size={14} className="text-cyan" />}
                color="#22D3EE"
                size="md"
              />
              <MetricTile
                label="Monthly Income"
                value={formatINR(incomeCalc.monthly, true)}
                icon={<TrendingUp size={14} className="text-emerald-400" />}
                color="#10B981"
                size="md"
              />
              <MetricTile
                label="Savings Rate"
                value={formatPct(budgetCalc.savingsRate, 0)}
                icon={<Shield size={14} className="text-purple-400" />}
                color={budgetCalc.savingsRate >= 0.3 ? '#10B981' : budgetCalc.savingsRate >= 0.15 ? '#F59E0B' : '#EF4444'}
                size="md"
                subtext={budgetCalc.savingsRate >= 0.3 ? 'Healthy' : 'Needs improvement'}
              />
              <MetricTile
                label="Debt-to-Income"
                value={formatPct(debtSummary.debtToIncome, 0)}
                icon={<AlertTriangle size={14} className="text-amber-400" />}
                color={debtSummary.debtToIncome <= 0.35 ? '#10B981' : '#F59E0B'}
                size="md"
                subtext={`EMI: ${formatINR(debtSummary.totalEMI, true)}/mo`}
              />
            </MetricRow>
          </div>
        </div>
      </div>

      {/* ══════ Health Breakdown ══════ */}
      <div className="glass-card p-4">
        <p className="section-label mb-3">Health Score Breakdown</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(healthScore.breakdown).map(([key, data]) => {
            const labels = {
              emergencyFund: 'Emergency',
              debtManagement: 'Debt',
              savingsRate: 'Savings',
              diversification: 'Diversity',
              taxEfficiency: 'Tax',
              goalProgress: 'Goals',
              insuranceCover: 'Insurance',
            };
            return (
              <div key={key} className="text-center">
                <HealthScore score={data.score} size={40} strokeWidth={3} />
                <p className="text-[10px] text-muted mt-1.5">{labels[key] || key}</p>
                <p className="text-[9px] text-dim">×{data.weight * 100}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════ Insights ══════ */}
      {insights.length > 0 && (
        <div>
          <p className="section-label mb-3 px-1">AI Insights & Alerts</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {insights.slice(0, 6).map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* ══════ Module Cards Grid ══════ */}
      <DashboardGrid>
        <GridCell>
          <NetWorthCard onEdit={() => { setEditingAsset(null); setAssetEditorOpen(true); }} />
        </GridCell>
        <GridCell>
          <TaxCard onEdit={() => setTaxEditorOpen(true)} />
        </GridCell>
        <GridCell>
          <DebtCard onEdit={() => { setEditingLoan(null); setLiabilityEditorOpen(true); }} />
        </GridCell>
        <GridCell>
          <InvestmentCard onEdit={() => { setEditingAsset(null); setAssetEditorOpen(true); }} />
        </GridCell>
        <GridCell>
          <GoalsCard onEdit={() => { setEditingGoal(null); setGoalEditorOpen(true); }} />
        </GridCell>
        <GridCell>
          <BudgetCard onEdit={() => setBudgetEditorOpen(true)} />
        </GridCell>
      </DashboardGrid>

      {/* ══════ Editor Modals ══════ */}
      <AssetEditor
        isOpen={assetEditorOpen}
        onClose={() => { setAssetEditorOpen(false); setEditingAsset(null); }}
        editAsset={editingAsset}
      />
      <LiabilityEditor
        isOpen={liabilityEditorOpen}
        onClose={() => { setLiabilityEditorOpen(false); setEditingLoan(null); }}
        editLoan={editingLoan}
      />
      <GoalEditor
        isOpen={goalEditorOpen}
        onClose={() => { setGoalEditorOpen(false); setEditingGoal(null); }}
        editGoal={editingGoal}
      />
      <IncomeEditor
        isOpen={incomeEditorOpen}
        onClose={() => setIncomeEditorOpen(false)}
      />
      <BudgetEditor
        isOpen={budgetEditorOpen}
        onClose={() => setBudgetEditorOpen(false)}
      />
      <TaxEditor
        isOpen={taxEditorOpen}
        onClose={() => setTaxEditorOpen(false)}
      />
    </div>
  );
}
