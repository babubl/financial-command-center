// ─── Connected Ecosystem ───
// Links to other tools in the financial suite.

export const ecosystemApps = [
  {
    id: 'taxgyan',
    name: 'TaxGyan 2026',
    description: 'Income Tax Act 2025 guide with regime comparison',
    url: 'https://babubl.github.io/taxgyan',
    color: '#F59E0B',
    module: 'tax',
  },
  {
    id: 'taxsakhi',
    name: 'TaxSakhi V2',
    description: 'Guided tax planning wizard for salaried employees',
    url: 'https://babubl.github.io/taxsakhi',
    color: '#10B981',
    module: 'tax',
  },
  {
    id: 'taxjugaad',
    name: 'TaxJugaad',
    description: 'Cross-border tax guide for NRI professionals',
    url: 'https://babubl.github.io/taxjugaad',
    color: '#22D3EE',
    module: 'tax',
  },
  {
    id: 'stockgyan',
    name: 'StockGyan 2.0',
    description: 'Indian stock & mutual fund analysis platform',
    url: 'https://babubl.github.io/stockgyan',
    color: '#A78BFA',
    module: 'investments',
  },
  {
    id: 'debtfree',
    name: 'DebtFree',
    description: 'AI-powered debt stress analyzer with payoff strategies',
    url: 'https://play.google.com/store/apps/details?id=com.debtfree',
    color: '#EF4444',
    module: 'debt',
  },
  {
    id: 'wealthlens',
    name: 'WealthLens',
    description: '5-Layer Financial Stability Framework for advisors',
    url: 'https://babubl.github.io/wealthlens',
    color: '#F5C542',
    module: 'goals',
  },
  {
    id: 'finshield',
    name: 'FinShield',
    description: 'Household resilience planner with shock simulation',
    url: 'https://babubl.github.io/finshield',
    color: '#60A5FA',
    module: 'budget',
  },
  {
    id: 'loansense',
    name: 'LoanSense AI',
    description: 'Enterprise loan restructuring for SMEs and CAs',
    url: 'https://babubl.github.io/loansense',
    color: '#FB923C',
    module: 'debt',
  },
  {
    id: 'privacyshield',
    name: 'PrivacyShield',
    description: 'DPDP Act 2023 compliance platform for banks/NBFCs',
    url: 'https://babubl.github.io/privacyshield',
    color: '#34D399',
    module: 'other',
  },
];

/**
 * Get relevant ecosystem apps for a given module
 */
export const getAppsForModule = (module) => {
  return ecosystemApps.filter((app) => app.module === module);
};
