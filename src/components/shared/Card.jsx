// ─── Card Wrapper ───
// Consistent glass-morphism card used by all dashboard modules.
import React from 'react';
import { Pencil, ExternalLink } from 'lucide-react';
import { getAppsForModule } from '@/config/ecosystem';

export default function Card({
  title,
  icon: Icon,
  iconColor = '#22D3EE',
  children,
  onEdit,
  headerRight,
  className = '',
  noPadding = false,
  module,
}) {
  const relatedApps = module ? getAppsForModule(module) : [];

  return (
    <div className={`glass-card-hover flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{
                background: `${iconColor}15`,
                border: `1px solid ${iconColor}25`,
              }}
            >
              <Icon size={12} style={{ color: iconColor }} />
            </div>
          )}
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {headerRight}
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-6 h-6 rounded-md flex items-center justify-center text-dim hover:text-cyan hover:bg-cyan/10 transition-colors"
              title="Edit"
            >
              <Pencil size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${noPadding ? '' : 'px-4 pb-4'}`}>
        {children}
      </div>

      {/* Ecosystem Links */}
      {relatedApps.length > 0 && (
        <div className="px-4 pb-3 pt-1 border-t border-navy-500/20">
          <p className="text-[9px] text-dim uppercase tracking-widest mb-1.5">Deep Dive Tools</p>
          <div className="flex flex-wrap gap-1.5">
            {relatedApps.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all hover:scale-105"
                style={{
                  background: `${app.color}10`,
                  border: `1px solid ${app.color}25`,
                  color: app.color,
                }}
                title={app.description}
              >
                {app.name}
                <ExternalLink size={8} className="opacity-60" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Card section divider
 */
export function CardDivider() {
  return <div className="border-t border-navy-500/30 my-3" />;
}

/**
 * Card row — key-value pair
 */
export function CardRow({ label, value, valueColor, mono = true }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-muted">{label}</span>
      <span
        className={`text-[12px] font-medium ${mono ? 'font-mono' : ''}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
