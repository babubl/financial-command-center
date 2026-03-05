// ─── Tax Planning Card ───
import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card, { CardDivider, CardRow } from '@/components/shared/Card';
import MetricTile from '@/components/shared/MetricTile';
import { MiniProgress } from '@/components/shared/MiniChart';
import { AlertBadge } from '@/components/shared/AlertBadge';
import { formatINR } from '@/utils/formatters';
import { Receipt } from 'lucide-react';

export default function TaxCard({ onEdit }) {
  const { taxComparison, profile } = useFinanceStore();
  const { newRegime, oldRegime, betterRegime, savings, section80C, grossIncome } = taxComparison;

  const currentRegime = profile?.taxRegime || 'new';

  return (
    <Card title="Tax Planning" icon={Receipt} iconColor="#F59E0B" onEdit={onEdit} module="tax">
      {/* Gross Income */}
      <MetricTile
        label="Gross Annual Income"
        value={formatINR(grossIncome, true)}
        size="md"
        subtext={`Filing under ${currentRegime === 'new' ? 'New' : 'Old'} Regime`}
      />

      <CardDivider />

      {/* Regime Comparison */}
      <p className="section-label mb-2">Regime Comparison</p>
      <div className="grid grid-cols-2 gap-3">
        <RegimeBox
          label="New Regime"
          tax={newRegime.tax}
          active={betterRegime === 'new'}
          isCurrent={currentRegime === 'new'}
        />
        <RegimeBox
          label="Old Regime"
          tax={oldRegime.tax}
          active={betterRegime === 'old'}
          isCurrent={currentRegime === 'old'}
        />
      </div>

      {savings > 0 && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
          <p className="text-[11px] text-emerald-400">
            <span className="font-semibold">{betterRegime === 'new' ? 'New' : 'Old'} regime</span> saves you{' '}
            <span className="font-mono font-bold">{formatINR(savings, true)}</span> in taxes
          </p>
        </div>
      )}

      <CardDivider />

      {/* Section 80C Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="section-label">Section 80C Utilization</p>
          <span className="text-[11px] font-mono text-muted">
            {formatINR(section80C.used)} / {formatINR(section80C.limit)}
          </span>
        </div>
        <MiniProgress
          value={section80C.pct}
          color={section80C.pct >= 1 ? '#10B981' : section80C.pct >= 0.7 ? '#22D3EE' : '#F59E0B'}
          height={8}
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-dim">
            {Math.round(section80C.pct * 100)}% utilized
          </span>
          {section80C.remaining > 0 ? (
            <AlertBadge type="warn" text={`₹${Math.round(section80C.remaining / 1000)}K unused`} />
          ) : (
            <AlertBadge type="success" text="Fully utilized" />
          )}
        </div>
      </div>

      <CardDivider />

      {/* Key Deductions */}
      <p className="section-label mb-1.5">Effective Tax Rate</p>
      <CardRow
        label="New Regime"
        value={`${grossIncome > 0 ? ((newRegime.tax / grossIncome) * 100).toFixed(1) : 0}%`}
        valueColor={betterRegime === 'new' ? '#10B981' : '#94A3B8'}
      />
      <CardRow
        label="Old Regime"
        value={`${grossIncome > 0 ? ((oldRegime.tax / grossIncome) * 100).toFixed(1) : 0}%`}
        valueColor={betterRegime === 'old' ? '#10B981' : '#94A3B8'}
      />
      <CardRow
        label="Old Regime Deductions"
        value={formatINR(oldRegime.totalDeductions, true)}
      />
    </Card>
  );
}

function RegimeBox({ label, tax, active, isCurrent }) {
  return (
    <div
      className={`px-3 py-2.5 rounded-lg border text-center ${
        active
          ? 'bg-emerald-500/8 border-emerald-500/25'
          : 'bg-navy-900/50 border-navy-500/30'
      }`}
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <p className="text-[10px] text-muted uppercase tracking-wider">{label}</p>
        {isCurrent && (
          <span className="text-[8px] px-1 py-0.5 rounded bg-cyan/15 text-cyan font-medium">
            CURRENT
          </span>
        )}
      </div>
      <p
        className={`text-base font-mono font-bold ${
          active ? 'text-emerald-400' : 'text-muted'
        }`}
      >
        {formatINR(tax, true)}
      </p>
      {active && <p className="text-[9px] text-emerald-500 mt-0.5">✓ Better</p>}
    </div>
  );
}
