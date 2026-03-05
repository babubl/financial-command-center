// ─── Design Tokens ───
// Central source of truth for all colors, spacing, and visual constants.

export const colors = {
  bg:           '#0A0E17',
  surface:      '#111827',
  surfaceAlt:   '#0F1629',
  card:         '#151E2D',
  cardBorder:   '#1E293B',

  cyan:         '#22D3EE',
  cyanDim:      'rgba(34,211,238,0.12)',
  cyanGlow:     'rgba(34,211,238,0.25)',

  amber:        '#F59E0B',
  amberDim:     'rgba(245,158,11,0.12)',

  emerald:      '#10B981',
  emeraldDim:   'rgba(16,185,129,0.12)',

  danger:       '#EF4444',
  dangerDim:    'rgba(239,68,68,0.12)',

  gold:         '#F5C542',
  purple:       '#A78BFA',
  purpleDim:    'rgba(167,139,250,0.12)',

  text:         '#F1F5F9',
  textMuted:    '#94A3B8',
  textDim:      '#64748B',
};

// Health score thresholds
export const healthScoreRanges = {
  excellent: { min: 80, max: 100, color: colors.emerald, label: 'Excellent' },
  good:      { min: 60, max: 79,  color: colors.cyan,    label: 'Good' },
  fair:      { min: 40, max: 59,  color: colors.amber,   label: 'Needs Attention' },
  poor:      { min: 0,  max: 39,  color: colors.danger,  label: 'Critical' },
};

export const getHealthColor = (score) => {
  if (score >= 80) return colors.emerald;
  if (score >= 60) return colors.cyan;
  if (score >= 40) return colors.amber;
  return colors.danger;
};

export const getHealthLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
};

// Asset type configuration
export const assetTypes = {
  equity:      { label: 'Equity',        color: '#22D3EE', icon: 'TrendingUp' },
  mutualFund:  { label: 'Mutual Funds',  color: '#A78BFA', icon: 'PieChart' },
  realEstate:  { label: 'Real Estate',   color: '#F59E0B', icon: 'Home' },
  gold:        { label: 'Gold',          color: '#F5C542', icon: 'Award' },
  fd:          { label: 'Fixed Deposits', color: '#10B981', icon: 'Lock' },
  ppfEpf:      { label: 'PPF / EPF',     color: '#60A5FA', icon: 'Shield' },
  cash:        { label: 'Cash / Savings', color: '#94A3B8', icon: 'Wallet' },
  nps:         { label: 'NPS',           color: '#FB923C', icon: 'Landmark' },
};

// Loan type configuration
export const loanTypes = {
  home:      { label: 'Home Loan',     color: '#F59E0B', icon: 'Home' },
  car:       { label: 'Car Loan',      color: '#22D3EE', icon: 'Car' },
  personal:  { label: 'Personal Loan', color: '#EF4444', icon: 'CreditCard' },
  education: { label: 'Education Loan', color: '#A78BFA', icon: 'GraduationCap' },
  gold:      { label: 'Gold Loan',     color: '#F5C542', icon: 'Award' },
  credit:    { label: 'Credit Card',   color: '#FB923C', icon: 'CreditCard' },
};

// Expense categories
export const expenseCategories = {
  housing:       { label: 'Housing',         color: '#F59E0B', icon: 'Home' },
  food:          { label: 'Food & Dining',   color: '#10B981', icon: 'UtensilsCrossed' },
  transport:     { label: 'Transport',       color: '#22D3EE', icon: 'Car' },
  utilities:     { label: 'Utilities',       color: '#60A5FA', icon: 'Zap' },
  medical:       { label: 'Medical',         color: '#EF4444', icon: 'Heart' },
  education:     { label: 'Education',       color: '#A78BFA', icon: 'BookOpen' },
  entertainment: { label: 'Entertainment',   color: '#FB923C', icon: 'Film' },
  shopping:      { label: 'Shopping',        color: '#F472B6', icon: 'ShoppingBag' },
  insurance:     { label: 'Insurance',       color: '#34D399', icon: 'Shield' },
  emi:           { label: 'EMIs',            color: '#FBBF24', icon: 'CreditCard' },
  investment:    { label: 'Investments',     color: '#818CF8', icon: 'TrendingUp' },
  other:         { label: 'Other',           color: '#94A3B8', icon: 'MoreHorizontal' },
};
