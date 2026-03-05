// ─── AI Agent Service ───
// Handles communication with Claude API for financial insights.

import { buildAgentContext } from './calculations';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are a sharp, experienced Indian financial advisor embedded in a Financial Command Center dashboard. You have complete access to the user's financial data provided below.

YOUR PERSONALITY:
- Direct and actionable — no vague advice
- Use Indian financial context (₹, Lakhs, Crores, Indian tax rules, Indian instruments)
- Reference specific numbers from the user's data
- Prioritize advice by impact (highest ₹ savings first)
- Flag risks and red flags clearly
- Keep responses concise (3-5 key points max per response)

RESPONSE FORMAT:
- Use clear, short paragraphs
- Bold key numbers and action items using **bold**
- When suggesting actions, be specific ("Increase your Nifty 50 SIP from ₹10K to ₹15K")
- Always quantify impact when possible ("This saves ₹4.2L in interest over 8 years")

YOU CAN:
- Analyze their portfolio, debt, tax, goals, budget
- Run what-if scenarios (e.g., "What if I prepay ₹5L on home loan?")
- Recommend specific actions with Indian instruments (ELSS, PPF, NPS, SGB, etc.)
- Compare tax regimes with their actual numbers
- Project future values with compound interest
- Identify risks and gaps in their financial plan

CONNECTED ECOSYSTEM — You are part of a suite of Indian fintech tools. Reference them when relevant:
- **TaxGyan / TaxSakhi** — for deep-dive into Income Tax Act 2025, regime comparison, Section 80C/80D planning
- **StockGyan** — for detailed stock & mutual fund analysis with traffic-light signals
- **DebtFree** — for advanced debt payoff strategies (Avalanche/Snowball/Hybrid), stress analysis
- **WealthLens** — for 5-Layer Financial Stability Framework and advisor-grade planning
- **FinShield** — for household financial resilience, shock simulation, insurance gap analysis
- **LoanSense AI** — for enterprise loan restructuring, market rate matching
- **VastuPlan** — for real estate planning with construction cost estimates
When a user's question goes deeper than what this dashboard covers, suggest the relevant tool.

ADVANCED CAPABILITIES:
- Cross-module reasoning: Connect insights across tax, debt, investments, and goals simultaneously
- Scenario modeling: "If you do X, here's the cascade effect on your net worth, tax, and goals"
- Prioritized action plans: Always rank recommendations by ₹ impact
- Indian calendar awareness: Tax filing deadlines, SIP dates, FD maturity, insurance renewals

YOU MUST NOT:
- Give specific stock recommendations (individual stock picks)
- Guarantee returns
- Provide legal advice
- Ignore the user's actual data in favor of generic advice`;

/**
 * Send a message to the AI agent with full financial context
 * @param {string} userMessage - The user's question
 * @param {Object} financialData - Complete financial data object
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @param {string|null} apiKey - Optional API key (for self-hosted usage)
 * @returns {Promise<string>} AI response text
 */
export const sendAgentMessage = async (userMessage, financialData, conversationHistory = [], apiKey = null) => {
  const context = buildAgentContext(financialData);

  const systemPrompt = `${SYSTEM_PROMPT}

USER'S FINANCIAL DATA (as of ${new Date().toLocaleDateString('en-IN')}):
${JSON.stringify(context, null, 2)}`;

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const headers = {
    'Content-Type': 'application/json',
  };

  // If API key is provided (self-hosted), add it
  if (apiKey) {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract text from response content blocks
  const text = data.content
    ?.filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n') || 'No response received.';

  return text;
};

/**
 * Generate proactive insights based on current financial state
 * Returns an array of insight objects
 */
export const generateInsights = (financialData) => {
  const context = buildAgentContext(financialData);
  const insights = [];

  // Emergency fund check
  if (context.emergencyFund.monthsCovered < 3) {
    insights.push({
      type: 'danger',
      module: 'emergency',
      title: 'Emergency fund critically low',
      detail: `Only ${context.emergencyFund.monthsCovered} months covered. Target: 6 months (₹${Math.round(context.emergencyFund.target / 100000)}L).`,
      action: `Build ₹${Math.round(context.emergencyFund.gap / 1000)}K more in liquid assets.`,
    });
  } else if (context.emergencyFund.monthsCovered < 6) {
    insights.push({
      type: 'warn',
      module: 'emergency',
      title: 'Emergency fund below target',
      detail: `${context.emergencyFund.monthsCovered} months covered (target: 6). Gap: ₹${Math.round(context.emergencyFund.gap / 1000)}K.`,
      action: 'Redirect surplus to liquid fund until target is met.',
    });
  }

  // Debt-to-income
  if (context.debtSummary.debtToIncome > 50) {
    insights.push({
      type: 'danger',
      module: 'debt',
      title: 'Debt-to-income ratio is high',
      detail: `EMIs consume ${context.debtSummary.debtToIncome}% of monthly income. Above 50% is risky.`,
      action: 'Prioritize paying off highest-rate debt first.',
    });
  } else if (context.debtSummary.debtToIncome > 35) {
    insights.push({
      type: 'warn',
      module: 'debt',
      title: 'Debt load needs attention',
      detail: `EMIs are ${context.debtSummary.debtToIncome}% of income. Healthy is <35%.`,
      action: 'Consider accelerating car loan payoff.',
    });
  }

  // Tax optimization
  if (context.tax.section80C_remaining > 0) {
    insights.push({
      type: 'info',
      module: 'tax',
      title: `₹${Math.round(context.tax.section80C_remaining / 1000)}K of 80C room remaining`,
      detail: `Used ₹${Math.round(context.tax.section80C_used / 1000)}K of ₹1.5L limit.`,
      action: `Invest ₹${Math.round(context.tax.section80C_remaining / 1000)}K in ELSS before March 31.`,
    });
  }

  // Regime comparison
  if (context.tax.savings > 10000) {
    insights.push({
      type: 'success',
      module: 'tax',
      title: `${context.tax.betterRegime === 'new' ? 'New' : 'Old'} regime saves ₹${Math.round(context.tax.savings / 1000)}K`,
      detail: `New: ₹${Math.round(context.tax.newRegimeTax / 1000)}K vs Old: ₹${Math.round(context.tax.oldRegimeTax / 1000)}K.`,
      action: `File under ${context.tax.betterRegime} regime.`,
    });
  }

  // Asset concentration
  const topAsset = context.assetAllocation[0];
  if (topAsset && topAsset.pct > 60) {
    insights.push({
      type: 'warn',
      module: 'investment',
      title: `${topAsset.type} is ${topAsset.pct}% of portfolio`,
      detail: 'Single asset class above 60% is concentration risk.',
      action: 'Gradually diversify into equity/debt/gold.',
    });
  }

  // Goal tracking
  const offTrackGoals = context.goals.filter((g) => !g.onTrack && g.shortfall > 0);
  for (const g of offTrackGoals.slice(0, 2)) {
    insights.push({
      type: g.shortfall > g.target * 0.3 ? 'danger' : 'warn',
      module: 'goals',
      title: `${g.name} is off-track`,
      detail: `Shortfall of ₹${Math.round(g.shortfall / 100000)}L at current pace.`,
      action: `Increase SIP to ₹${Math.round(g.requiredSIP / 1000)}K/month to meet target.`,
    });
  }

  // Insurance gap
  if (context.insurance.termGap > 0) {
    insights.push({
      type: 'warn',
      module: 'insurance',
      title: `Term insurance gap: ₹${Math.round(context.insurance.termGap / 10000000)}Cr`,
      detail: `Have ₹${Math.round(context.insurance.termCover / 10000000)}Cr, need ₹${Math.round(context.insurance.recommendedTermCover / 10000000)}Cr (10x income).`,
      action: 'Get additional term cover. Costs ~₹800-1200/month more.',
    });
  }

  // Savings rate
  if (context.budget.savingsRate < 0.15) {
    insights.push({
      type: 'danger',
      module: 'budget',
      title: `Savings rate is only ${Math.round(context.budget.savingsRate * 100)}%`,
      detail: 'Below 15% makes wealth building very difficult.',
      action: 'Target 30%+ by reducing discretionary spending.',
    });
  }

  return insights;
};

/**
 * Suggested quick questions for the agent
 */
export const quickQuestions = [
  'Can I retire at 50 with my current savings rate?',
  'What if I prepay ₹5L on my home loan?',
  'How should I invest my next ₹1L?',
  'Am I saving enough for my child\'s education?',
  'Which tax regime is better for me and why?',
  'What are my top 3 financial risks right now?',
  'How can I increase my savings rate to 40%?',
  'Should I close my FDs and move to debt funds?',
  'Give me a prioritized 90-day financial action plan',
  'What\'s the cascading impact if I lose my job for 6 months?',
];
