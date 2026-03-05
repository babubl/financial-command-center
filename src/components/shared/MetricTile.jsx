// ─── MetricTile ───
// Compact stat display used across all cards.
import React from 'react';

/**
 * @param {string} label - Small uppercase label
 * @param {string} value - Main display value (formatted)
 * @param {string} [subtext] - Optional secondary text
 * @param {string} [color] - Custom color for the value
 * @param {string} [trend] - 'up' | 'down' | null — shows a small arrow
 * @param {React.ReactNode} [icon] - Optional left icon
 * @param {string} [size] - 'sm' | 'md' | 'lg'
 */
export default function MetricTile({
  label,
  value,
  subtext,
  color,
  trend,
  icon,
  size = 'md',
  className = '',
}) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      {icon && (
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-navy-600/50 border border-navy-500/40 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="section-label mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`metric-value ${sizeClasses[size]}`}
            style={color ? { color } : undefined}
          >
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend === 'up' ? '▲' : '▼'}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-[11px] text-dim mt-0.5 leading-tight">{subtext}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Horizontal row of MetricTiles with dividers
 */
export function MetricRow({ children, className = '' }) {
  const items = React.Children.toArray(children);
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {items.map((child, i) => (
        <React.Fragment key={i}>
          {child}
          {i < items.length - 1 && (
            <div className="w-px h-10 bg-navy-500/40 self-center flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
