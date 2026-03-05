// ─── Debt & Loans Card ───
import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card, { CardDivider, CardRow } from '@/components/shared/Card';
import MetricTile, { MetricRow } from '@/components/shared/MetricTile';
import { MiniProgress } from '@/components/shared/MiniChart';
import { AlertBadge } from '@/components/shared/AlertBadge';
import { formatINR, formatPctDirect, formatTenure } from '@/utils/formatters';
import { loanTypes } from '@/config/theme';
import { CreditCard } from 'lucide-react';

export default function DebtCard({ onEdit }) {
  const { liabilities, debtSummary, incomeCalc } = useFinanceStore();

  const dtiPct = debtSummary.debtToIncome;
  const dtiColor = dtiPct <= 0.35 ? '#10B981' : dtiPct <= 0.5 ? '#F59E0B' : '#EF4444';
  const dtiLabel = dtiPct <= 0.35 ? 'Healthy' : dtiPct <= 0.5 ? 'Moderate' : 'High Risk';

  return (
    <Card title="Debt & Loans" icon={CreditCard} iconColor="#EF4444" onEdit={onEdit} module="debt">
      {/* Summary */}
      <div className="flex items-start gap-5">
        <MetricTile
          label="Total Outstanding"
          value={formatINR(debtSummary.totalOutstanding, true)}
          color="#EF4444"
          size="md"
        />
        <MetricTile
          label="Monthly EMI"
          value={formatINR(debtSummary.totalEMI, true)}
          size="md"
          subtext={`${Math.round(dtiPct * 100)}% of income`}
        />
      </div>

      <CardDivider />

      {/* Debt-to-Income Gauge */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="section-label">Debt-to-Income Ratio</p>
          <AlertBadge
            type={dtiPct <= 0.35 ? 'success' : dtiPct <= 0.5 ? 'warn' : 'danger'}
            text={dtiLabel}
          />
        </div>
        <MiniProgress value={Math.min(1, dtiPct / 0.6)} color={dtiColor} height={8} />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-dim">0%</span>
          <span className="text-[10px] text-dim">35% healthy</span>
          <span className="text-[10px] text-dim">60%</span>
        </div>
      </div>

      <CardDivider />

      {/* Individual Loans */}
      <p className="section-label mb-2">Active Loans</p>
      <div className="space-y-2.5">
        {liabilities.map((loan) => {
          const config = loanTypes[loan.type] || loanTypes.personal;
          const paidPct = loan.principal > 0
            ? (loan.principal - loan.outstanding) / loan.principal
            : 0;

          return (
            <div key={loan.id} className="px-3 py-2.5 rounded-lg bg-navy-900/40 border border-navy-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: config.color }}
                  />
                  <span className="text-xs font-medium text-slate-100">{loan.name}</span>
                </div>
                <span className="text-[10px] font-mono text-dim">
                  {formatPctDirect(loan.rate)} p.a.
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-muted">
                  Outstanding: <span className="font-mono text-slate-200">{formatINR(loan.outstanding, true)}</span>
                </span>
                <span className="text-muted">
                  EMI: <span className="font-mono text-slate-200">{formatINR(loan.emi, true)}</span>
                </span>
              </div>

              {loan.principal > 0 && (
                <>
                  <MiniProgress value={paidPct} color={config.color} height={4} />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-dim">
                      {Math.round(paidPct * 100)}% paid
                    </span>
                    <span className="text-[9px] text-dim">
                      {formatTenure(loan.remainingMonths)} left
                    </span>
                  </div>
                </>
              )}

              {loan.type === 'credit' && loan.outstanding > 0 && (
                <div className="mt-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/15">
                  <p className="text-[10px] text-red-400">
                    ⚠ {formatPctDirect(loan.rate)} interest — pay full balance to avoid charges
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Interest */}
      {debtSummary.totalInterest > 0 && (
        <>
          <CardDivider />
          <CardRow
            label="Est. remaining interest payable"
            value={formatINR(debtSummary.totalInterest, true)}
            valueColor="#F59E0B"
          />
        </>
      )}
    </Card>
  );
}
