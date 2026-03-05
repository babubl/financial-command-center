// ─── Dashboard Grid Layout ───
import React from 'react';

export default function DashboardGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5 auto-rows-min">
      {children}
    </div>
  );
}

/**
 * Grid cell wrapper with optional spanning
 * span: 1 (default), 2 (two columns), 'full' (full width)
 */
export function GridCell({ children, span = 1, className = '' }) {
  const spanClass =
    span === 'full'
      ? 'md:col-span-2 xl:col-span-3'
      : span === 2
      ? 'md:col-span-2'
      : '';

  return (
    <div className={`min-h-0 ${spanClass} ${className}`}>
      {children}
    </div>
  );
}
