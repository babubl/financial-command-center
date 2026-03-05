// ─── Mini Charts ───
// Lightweight SVG charts for dashboard cards.
import React from 'react';

/**
 * Mini Donut Chart
 * @param {Array} data - [{ value, color, label }]
 * @param {number} size - Diameter in px
 * @param {number} thickness - Ring thickness
 * @param {string} centerText - Text in center
 */
export function MiniDonut({ data, size = 100, thickness = 14, centerText, centerSubtext }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let accumulated = 0;
  const segments = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const offset = accumulated;
    accumulated += pct;
    return {
      ...d,
      pct,
      dashArray: `${pct * circumference} ${circumference}`,
      dashOffset: -(offset * circumference),
    };
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(30,41,59,0.5)"
          strokeWidth={thickness}
        />
        {/* Segments */}
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={seg.dashArray}
            strokeDashoffset={seg.dashOffset}
            strokeLinecap="butt"
            className="transition-all duration-500"
            style={{ opacity: 0.85 }}
          />
        ))}
      </svg>
      {/* Center text */}
      {(centerText || centerSubtext) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerText && (
            <span className="text-xs font-mono font-bold text-slate-100">{centerText}</span>
          )}
          {centerSubtext && (
            <span className="text-[9px] text-dim">{centerSubtext}</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Mini Progress Bar
 * @param {number} value - Current value (0-1)
 * @param {string} color - Bar color
 * @param {string} bgColor - Background color
 * @param {number} height - Bar height
 */
export function MiniProgress({ value, color = '#22D3EE', bgColor = 'rgba(30,41,59,0.6)', height = 6, className = '' }) {
  const pct = Math.min(1, Math.max(0, value)) * 100;

  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`} style={{ height, background: bgColor }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: color,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}

/**
 * Mini Horizontal Bar Chart
 * @param {Array} data - [{ label, value, color, maxValue? }]
 * @param {number} barHeight
 */
export function MiniBarChart({ data, barHeight = 8, showLabels = true, showValues = true }) {
  const maxValue = Math.max(...data.map((d) => d.maxValue || d.value), 1);

  return (
    <div className="space-y-2 w-full">
      {data.map((item, i) => (
        <div key={i}>
          {(showLabels || showValues) && (
            <div className="flex items-center justify-between mb-1">
              {showLabels && (
                <span className="text-[11px] text-muted truncate">{item.label}</span>
              )}
              {showValues && (
                <span className="text-[11px] font-mono text-dim">{item.displayValue || item.value}</span>
              )}
            </div>
          )}
          <div className="w-full rounded-full overflow-hidden" style={{ height: barHeight, background: 'rgba(30,41,59,0.6)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (item.value / maxValue) * 100)}%`,
                background: item.color || '#22D3EE',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Legend for donut/charts
 */
export function ChartLegend({ items, compact = false }) {
  return (
    <div className={`flex flex-wrap gap-x-3 ${compact ? 'gap-y-1' : 'gap-y-2'}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: item.color }}
          />
          <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} text-muted`}>
            {item.label}
          </span>
          {item.value && (
            <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-mono text-dim`}>
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
