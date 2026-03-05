// ─── Goals Card ───
import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card, { CardDivider } from '@/components/shared/Card';
import MetricTile from '@/components/shared/MetricTile';
import { MiniProgress } from '@/components/shared/MiniChart';
import { AlertBadge } from '@/components/shared/AlertBadge';
import { formatINR, formatTenure } from '@/utils/formatters';
import { Target, CheckCircle, AlertTriangle } from 'lucide-react';

const priorityColors = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#22D3EE',
  low: '#94A3B8',
};

export default function GoalsCard({ onEdit }) {
  const { goalProjections } = useFinanceStore();

  const onTrackCount = goalProjections.filter((g) => g.projection.onTrack).length;
  const totalGoals = goalProjections.length;
  const totalTarget = goalProjections.reduce((s, g) => s + g.targetAmount, 0);
  const totalCurrent = goalProjections.reduce((s, g) => s + g.currentAmount, 0);
  const totalProjected = goalProjections.reduce((s, g) => s + g.projection.projectedAmount, 0);

  return (
    <Card title="Goal Tracker" icon={Target} iconColor="#10B981" onEdit={onEdit} module="goals">
      {/* Summary */}
      <div className="flex items-start gap-4">
        <MetricTile
          label="Goals Progress"
          value={`${onTrackCount}/${totalGoals}`}
          color={onTrackCount === totalGoals ? '#10B981' : '#F59E0B'}
          size="md"
          subtext="goals on track"
        />
        <MetricTile
          label="Total Target"
          value={formatINR(totalTarget, true)}
          size="sm"
          subtext={`Saved: ${formatINR(totalCurrent, true)}`}
        />
      </div>

      <CardDivider />

      {/* Individual Goals */}
      <div className="space-y-3">
        {goalProjections.map((goal) => {
          const { projection } = goal;
          const progressColor = projection.onTrack ? '#10B981' : '#F59E0B';
          const yearsLeft = Math.ceil(projection.monthsRemaining / 12);

          return (
            <div key={goal.id} className="px-3 py-2.5 rounded-lg bg-navy-900/40 border border-navy-500/20">
              {/* Goal header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: priorityColors[goal.priority] || '#94A3B8' }}
                  />
                  <span className="text-xs font-medium text-slate-100">{goal.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {projection.onTrack ? (
                    <CheckCircle size={12} className="text-emerald-400" />
                  ) : (
                    <AlertTriangle size={12} className="text-amber-400" />
                  )}
                  <span className={`text-[10px] font-medium ${projection.onTrack ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {projection.onTrack ? 'On Track' : 'Off Track'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <MiniProgress value={projection.progressPct} color={progressColor} height={5} />

              {/* Details row */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-dim">
                  {formatINR(goal.currentAmount, true)} of {formatINR(goal.targetAmount, true)}
                </span>
                <span className="text-[10px] text-dim">
                  {yearsLeft > 0 ? `${yearsLeft}yr left` : 'Due'}
                </span>
              </div>

              {/* Projection */}
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] text-muted">
                  Projected: <span className="font-mono text-slate-300">{formatINR(projection.projectedAmount, true)}</span>
                </span>
                {!projection.onTrack && projection.shortfall > 0 && (
                  <span className="text-[10px] text-amber-400 font-mono">
                    Gap: {formatINR(projection.shortfall, true)}
                  </span>
                )}
              </div>

              {/* Required SIP if off track */}
              {!projection.onTrack && projection.requiredSIP > 0 && (
                <div className="mt-1.5 px-2 py-1 rounded bg-cyan/8 border border-cyan/15">
                  <p className="text-[10px] text-cyan">
                    Need {formatINR(projection.requiredSIP)}/mo SIP to meet target
                    {goal.monthlySIP > 0 && (
                      <span className="text-dim"> (current: {formatINR(goal.monthlySIP)}/mo)</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Projection */}
      <CardDivider />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted">Total projected corpus</span>
        <span className="text-xs font-mono font-bold text-slate-100">
          {formatINR(totalProjected, true)}
        </span>
      </div>
    </Card>
  );
}
