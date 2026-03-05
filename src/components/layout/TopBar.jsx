// ─── TopBar ───
import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatINR } from '@/utils/formatters';
import { getHealthColor, getHealthLabel } from '@/config/theme';
import HealthScore from '@/components/shared/HealthScore';
import { Bell, Settings, User } from 'lucide-react';

export default function TopBar() {
  const { profile, netWorth, healthScore, insights, incomeCalc, budgetCalc } = useFinanceStore();

  const dangerCount = insights.filter((i) => i.type === 'danger').length;
  const warnCount = insights.filter((i) => i.type === 'warn').length;

  return (
    <header className="h-14 bg-navy-800/60 backdrop-blur-md border-b border-navy-500/40 flex items-center justify-between px-5 sticky top-0 z-30">
      {/* Left — Greeting */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Welcome back, <span className="text-cyan">{profile?.name?.split(' ')[0] || 'User'}</span>
          </h2>
          <p className="text-[11px] text-dim">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Center — Quick Stats */}
      <div className="hidden md:flex items-center gap-6">
        <QuickStat
          label="Net Worth"
          value={formatINR(netWorth.netWorth, true)}
          positive={netWorth.netWorth > 0}
        />
        <div className="w-px h-6 bg-navy-500/50" />
        <QuickStat
          label="Monthly Income"
          value={formatINR(incomeCalc.monthly, true)}
        />
        <div className="w-px h-6 bg-navy-500/50" />
        <QuickStat
          label="Savings Rate"
          value={`${Math.round(budgetCalc.savingsRate * 100)}%`}
          positive={budgetCalc.savingsRate >= 0.3}
          warn={budgetCalc.savingsRate < 0.15}
        />
      </div>

      {/* Right — Health + Alerts */}
      <div className="flex items-center gap-3">
        {/* Alert Bell */}
        <div className="relative">
          <button className="btn-ghost p-2 relative">
            <Bell size={16} className="text-muted" />
            {(dangerCount + warnCount) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-[9px] font-bold flex items-center justify-center text-white">
                {dangerCount + warnCount}
              </span>
            )}
          </button>
        </div>

        {/* Health Score Mini */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-700/50 border border-navy-500/40">
          <HealthScore score={healthScore.overall} size={28} strokeWidth={3} />
          <div className="hidden lg:block">
            <p className="text-[10px] text-dim leading-none">Health Score</p>
            <p className="text-xs font-semibold" style={{ color: getHealthColor(healthScore.overall) }}>
              {getHealthLabel(healthScore.overall)}
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="w-8 h-8 rounded-full bg-navy-600 border border-navy-500 flex items-center justify-center">
          <User size={14} className="text-muted" />
        </div>
      </div>
    </header>
  );
}

function QuickStat({ label, value, positive, warn }) {
  let valueClass = 'text-slate-100';
  if (positive) valueClass = 'text-emerald-400';
  if (warn) valueClass = 'text-amber-400';

  return (
    <div className="text-center">
      <p className="text-[10px] text-dim uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-mono font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
