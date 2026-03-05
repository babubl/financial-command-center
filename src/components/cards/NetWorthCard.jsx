// ─── Net Worth Card ───
import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card, { CardDivider, CardRow } from '@/components/shared/Card';
import MetricTile from '@/components/shared/MetricTile';
import { MiniDonut, ChartLegend } from '@/components/shared/MiniChart';
import { formatINR, formatPct } from '@/utils/formatters';
import { Wallet } from 'lucide-react';

export default function NetWorthCard({ onEdit }) {
  const { netWorth, assetAllocation, gains } = useFinanceStore();

  const donutData = assetAllocation.map((a) => ({
    value: a.value,
    color: a.color,
    label: a.label,
  }));

  const legendItems = assetAllocation.map((a) => ({
    color: a.color,
    label: a.label,
    value: `${Math.round(a.pct * 100)}%`,
  }));

  return (
    <Card title="Net Worth" icon={Wallet} iconColor="#22D3EE" onEdit={onEdit} module="networth">
      {/* Main metric */}
      <MetricTile
        label="Total Net Worth"
        value={formatINR(netWorth.netWorth, true)}
        color="#22D3EE"
        size="lg"
        subtext={`Assets ${formatINR(netWorth.totalAssets, true)} − Debt ${formatINR(netWorth.totalLiabilities, true)}`}
      />

      <CardDivider />

      {/* Donut + Legend */}
      <div className="flex items-start gap-4">
        <MiniDonut
          data={donutData}
          size={110}
          thickness={16}
          centerText={formatINR(netWorth.totalAssets, true)}
          centerSubtext="Assets"
        />
        <div className="flex-1 min-w-0">
          <p className="section-label mb-2">Allocation</p>
          <ChartLegend items={legendItems} compact />
        </div>
      </div>

      <CardDivider />

      {/* Unrealized Gains */}
      <div>
        <p className="section-label mb-1.5">Portfolio Returns</p>
        <CardRow
          label="Total Invested"
          value={formatINR(gains.totalInvested, true)}
        />
        <CardRow
          label="Current Value"
          value={formatINR(gains.totalCurrent, true)}
        />
        <CardRow
          label="Unrealized Gain"
          value={`${gains.absoluteGain >= 0 ? '+' : ''}${formatINR(gains.absoluteGain, true)} (${gains.pctGain >= 0 ? '+' : ''}${formatPct(gains.pctGain)})`}
          valueColor={gains.absoluteGain >= 0 ? '#10B981' : '#EF4444'}
        />
      </div>

      {/* Top holdings */}
      <CardDivider />
      <p className="section-label mb-1.5">Largest Holdings</p>
      {assetAllocation.slice(0, 3).map((a) => (
        <CardRow
          key={a.type}
          label={a.label}
          value={`${formatINR(a.value, true)} (${Math.round(a.pct * 100)}%)`}
          valueColor={a.color}
        />
      ))}
    </Card>
  );
}
