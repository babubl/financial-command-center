// ─── AlertBadge & InsightCard ───
import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info, Zap } from 'lucide-react';

const typeConfig = {
  danger: {
    icon: AlertTriangle,
    bg: 'bg-red-500/8',
    border: 'border-red-500/20',
    iconColor: 'text-red-400',
    textColor: 'text-red-300',
    badge: 'bg-red-500/15 text-red-400',
  },
  warn: {
    icon: AlertCircle,
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-300',
    badge: 'bg-amber-500/15 text-amber-400',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-400',
  },
  info: {
    icon: Info,
    bg: 'bg-cyan/8',
    border: 'border-cyan/20',
    iconColor: 'text-cyan',
    textColor: 'text-cyan/80',
    badge: 'bg-cyan/15 text-cyan',
  },
};

/**
 * Small inline badge
 */
export function AlertBadge({ type = 'info', text }) {
  const config = typeConfig[type] || typeConfig.info;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.badge}`}>
      {text}
    </span>
  );
}

/**
 * Full insight card for the dashboard
 */
export function InsightCard({ insight, compact = false }) {
  const config = typeConfig[insight.type] || typeConfig.info;
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-start gap-2 px-3 py-2 rounded-lg ${config.bg} border ${config.border}`}>
        <Icon size={14} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="min-w-0">
          <p className={`text-xs font-medium ${config.textColor}`}>{insight.title}</p>
          {insight.action && (
            <p className="text-[11px] text-dim mt-0.5">{insight.action}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 rounded-xl ${config.bg} border ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
          <Icon size={14} className={config.iconColor} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${config.textColor}`}>{insight.title}</p>
          {insight.detail && (
            <p className="text-xs text-muted mt-1">{insight.detail}</p>
          )}
          {insight.action && (
            <div className="flex items-center gap-1.5 mt-2">
              <Zap size={10} className="text-cyan" />
              <p className="text-xs text-cyan/80">{insight.action}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Insight list
 */
export function InsightList({ insights, compact = false, maxItems = 5 }) {
  const displayed = insights.slice(0, maxItems);

  return (
    <div className={`space-y-${compact ? '1.5' : '2.5'}`}>
      {displayed.map((insight, i) => (
        <InsightCard key={i} insight={insight} compact={compact} />
      ))}
      {insights.length > maxItems && (
        <p className="text-[11px] text-dim text-center">
          +{insights.length - maxItems} more insights
        </p>
      )}
    </div>
  );
}
