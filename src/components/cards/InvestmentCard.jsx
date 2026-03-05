// ─── Investment Card ───
import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card, { CardDivider, CardRow } from '@/components/shared/Card';
import MetricTile from '@/components/shared/MetricTile';
import { MiniBarChart } from '@/components/shared/MiniChart';
import { AlertBadge } from '@/components/shared/AlertBadge';
import { formatINR, formatPct } from '@/utils/formatters';
import { assetTypes } from '@/config/theme';
import { TrendingUp } from 'lucide-react';

export default function InvestmentCard({ onEdit }) {
  const { assets, gains, assetAllocation } = useFinanceStore();

  // SIP assets
  const sipAssets = assets.filter((a) => a.sipAmount && a.sipAmount > 0);
  const totalSIP = sipAssets.reduce((s, a) => s + a.sipAmount, 0);

  // Returns by category
  const categoryReturns = {};
  for (const asset of assets) {
    if (!categoryReturns[asset.type]) {
      categoryReturns[asset.type] = { invested: 0, current: 0 };
    }
    categoryReturns[asset.type].invested += asset.investedValue || 0;
    categoryReturns[asset.type].current += asset.value || 0;
  }

  const returnsByType = Object.entries(categoryReturns)
    .map(([type, data]) => ({
      type,
      label: assetTypes[type]?.label || type,
      color: assetTypes[type]?.color || '#94A3B8',
      invested: data.invested,
      current: data.current,
      gain: data.current - data.invested,
      returnPct: data.invested > 0 ? (data.current - data.invested) / data.invested : 0,
    }))
    .filter((r) => r.invested > 0)
    .sort((a, b) => b.current - a.current);

  // Top concentration
  const topAsset = assetAllocation[0];
  const isConcentrated = topAsset && topAsset.pct > 0.5;

  return (
    <Card title="Investments" icon={TrendingUp} iconColor="#A78BFA" onEdit={onEdit} module="investments">
      {/* Portfolio summary */}
      <div className="flex items-start gap-5">
        <MetricTile
          label="Portfolio Value"
          value={formatINR(gains.totalCurrent, true)}
          color="#A78BFA"
          size="md"
        />
        <MetricTile
          label="Total Return"
          value={`${gains.pctGain >= 0 ? '+' : ''}${formatPct(gains.pctGain)}`}
          color={gains.pctGain >= 0 ? '#10B981' : '#EF4444'}
          size="md"
          subtext={`${gains.absoluteGain >= 0 ? '+' : ''}${formatINR(gains.absoluteGain, true)}`}
        />
      </div>

      <CardDivider />

      {/* Returns by asset type */}
      <p className="section-label mb-2">Returns by Category</p>
      <div className="space-y-2">
        {returnsByType.slice(0, 5).map((r) => (
          <div key={r.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
              <span className="text-[11px] text-muted truncate">{r.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-200">
                {formatINR(r.current, true)}
              </span>
              <span
                className={`text-[10px] font-mono font-medium min-w-[48px] text-right ${
                  r.returnPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {r.returnPct >= 0 ? '+' : ''}{formatPct(r.returnPct)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Concentration warning */}
      {isConcentrated && (
        <>
          <CardDivider />
          <div className="px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20">
            <p className="text-[11px] text-amber-400">
              ⚠ <span className="font-medium">{topAsset.label}</span> is{' '}
              {Math.round(topAsset.pct * 100)}% of your portfolio — consider diversifying
            </p>
          </div>
        </>
      )}

      <CardDivider />

      {/* Active SIPs */}
      <div className="flex items-center justify-between mb-2">
        <p className="section-label">Active SIPs</p>
        <AlertBadge type="info" text={`${formatINR(totalSIP, true)}/mo`} />
      </div>
      {sipAssets.length > 0 ? (
        <div className="space-y-1.5">
          {sipAssets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between">
              <span className="text-[11px] text-muted truncate max-w-[60%]">{asset.name}</span>
              <span className="text-[11px] font-mono text-slate-200">
                {formatINR(asset.sipAmount)}/mo
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-dim">No active SIPs found</p>
      )}
    </Card>
  );
}
