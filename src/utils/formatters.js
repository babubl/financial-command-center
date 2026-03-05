// ─── Formatting Utilities ───

/**
 * Format number in Indian notation (Lakhs, Crores)
 */
export const formatINR = (amount, compact = false) => {
  if (amount == null || isNaN(amount)) return '₹0';

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }

  return `${sign}₹${abs.toLocaleString('en-IN')}`;
};

/**
 * Format as short form (no rupee symbol)
 */
export const formatShort = (amount) => {
  if (amount == null || isNaN(amount)) return '0';
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `${(amount / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString('en-IN');
};

/**
 * Format percentage
 */
export const formatPct = (value, decimals = 1) => {
  if (value == null || isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format percentage from already-percentage value (e.g., 8.5 → "8.5%")
 */
export const formatPctDirect = (value, decimals = 1) => {
  if (value == null || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format months into "X yr Y mo" display
 */
export const formatTenure = (months) => {
  if (!months || months <= 0) return '0 mo';
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (years === 0) return `${remaining} mo`;
  if (remaining === 0) return `${years} yr`;
  return `${years}yr ${remaining}mo`;
};

/**
 * Format date string to readable format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Days remaining until a date
 */
export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

/**
 * Get a color class based on a value's relationship to a threshold
 * positive = green when above, red when below
 * negative = red when above, green when below
 */
export const getStatusColor = (value, threshold, direction = 'positive') => {
  if (direction === 'positive') {
    if (value >= threshold * 1.2) return 'text-emerald-400';
    if (value >= threshold) return 'text-cyan';
    if (value >= threshold * 0.7) return 'text-amber-400';
    return 'text-red-400';
  } else {
    if (value <= threshold * 0.5) return 'text-emerald-400';
    if (value <= threshold) return 'text-cyan';
    if (value <= threshold * 1.3) return 'text-amber-400';
    return 'text-red-400';
  }
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
