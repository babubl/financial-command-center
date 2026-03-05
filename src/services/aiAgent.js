// ─── AI Agent Service ───
// Hybrid agent: Rule-based analysis works WITHOUT any API.
// Claude API enhances it when available (no key needed in claude.ai artifacts).

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

YOU MUST NOT:
- Give specific stock recommendations (individual stock picks)
- Guarantee returns
- Provide legal advice
- Ignore the user's actual data in favor of generic advice`;

/**
 * Send a message to the AI agent.
 * Works without API key in claude.ai artifact context.
 * Falls back to rule-based responses if API fails.
 */
export const sendAgentMessage = async (userMessage, financialData, conversationHistory = []) => {
  const context = buildAgentContext(financialData);

  // First try: Claude API (works without key in claude.ai artifacts)
  try {
    const systemPrompt = `${SYSTEM_PROMPT}\n\nUSER'S FINANCIAL DATA (as of ${new Date().toLocaleDateString('en-IN')}):\n${JSON.stringify(context, null, 2)}`;

    const messages = [
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.content
        ?.filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n') || '';

      if (text) return text;
    }
  } catch (err) {
    console.log('AI API unavailable, using rule-based agent:', err.message);
  }

  // Fallback: Rule-based intelligent responses
  return generateRuleBasedResponse(userMessage, context);
};

/**
 * Smart rule-based response engine.
 * Handles common questions using actual user data — no API needed.
 */
function generateRuleBasedResponse(question, ctx) {
  const q = question.toLowerCase();
  const fmt = (n) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  // ─── Retirement ───
  if (q.includes('retire') || q.includes('retirement')) {
    const age = ctx.profile?.age || 30;
    const retAge = ctx.profile?.retirementAge || 55;
    const years = retAge - age;
    const monthlyIncome = ctx.income?.monthly || 0;
    const savingsRate = ctx.budget?.savingsRate || 0;
    const monthlySavings = monthlyIncome * savingsRate;
    const currentNW = ctx.snapshot?.netWorth || 0;

    const futureNW = currentNW * Math.pow(1.10, years) + monthlySavings * ((Math.pow(1 + 0.10/12, years * 12) - 1) / (0.10/12));
    const monthlyExpenses = ctx.budget?.monthlyExpenses || 0;
    const retirementCorpus = monthlyExpenses * 12 * 25; // 25x rule

    return `**Retirement Analysis (Age ${retAge}):**\n\n` +
      `You have **${years} years** to retirement.\n\n` +
      `**Current net worth:** ${fmt(currentNW)}\n` +
      `**Monthly savings:** ${fmt(Math.round(monthlySavings))} (${Math.round(savingsRate * 100)}% savings rate)\n\n` +
      `**Projected corpus at ${retAge}:** ~${fmt(Math.round(futureNW))} (assuming 10% CAGR)\n` +
      `**Required corpus:** ~${fmt(Math.round(retirementCorpus))} (25x annual expenses)\n\n` +
      (futureNW >= retirementCorpus
        ? `✅ You're **on track** for retirement. Keep your savings rate above 25%.`
        : `⚠️ **Gap of ${fmt(Math.round(retirementCorpus - futureNW))}.** Consider increasing SIPs by ${fmt(Math.round((retirementCorpus - futureNW) / ((Math.pow(1 + 0.10/12, years * 12) - 1) / (0.10/12))))} /month.`);
  }

  // ─── Prepayment ───
  if (q.includes('prepay') || q.includes('pre-pay') || q.includes('home loan')) {
    const homeLoan = ctx.debts?.find((d) => d.name?.toLowerCase().includes('home'));
    if (!homeLoan) return "I don't see a home loan in your data. Add one through the Debt card to get prepayment analysis.";

    const monthlyRate = homeLoan.rate / 100 / 12;
    const prepayAmounts = [300000, 500000, 1000000];
    let response = `**Home Loan Prepayment Analysis:**\n\n` +
      `**Loan:** ${homeLoan.name}\n` +
      `**Outstanding:** ${fmt(homeLoan.outstanding)} at ${homeLoan.rate}%\n` +
      `**EMI:** ${fmt(homeLoan.emi)}/mo | **Remaining:** ${homeLoan.remainingMonths} months\n\n`;

    for (const amt of prepayAmounts) {
      if (amt >= homeLoan.outstanding) continue;
      const newOutstanding = homeLoan.outstanding - amt;
      const newTenure = Math.ceil(-Math.log(1 - (newOutstanding * monthlyRate) / homeLoan.emi) / Math.log(1 + monthlyRate));
      const monthsSaved = homeLoan.remainingMonths - newTenure;
      const interestSaved = homeLoan.emi * monthsSaved - amt + (homeLoan.outstanding - newOutstanding);
      response += `- **Prepay ${fmt(amt)}** → Save ~${fmt(Math.round(Math.max(0, interestSaved)))} in interest, close **${monthsSaved} months** earlier\n`;
    }
    return response;
  }

  // ─── Tax ───
  if (q.includes('tax') || q.includes('regime') || q.includes('80c')) {
    const tax = ctx.tax;
    if (!tax) return "I need your income data to analyze taxes. Update your income in the dashboard.";

    return `**Tax Analysis (FY 2025-26):**\n\n` +
      `**Gross Income:** ${fmt(tax.grossIncome)}\n\n` +
      `**New Regime Tax:** ${fmt(tax.newRegimeTax)}\n` +
      `**Old Regime Tax:** ${fmt(tax.oldRegimeTax)}\n\n` +
      `**Better Regime:** ${tax.betterRegime === 'new' ? 'New' : 'Old'} — saves you **${fmt(tax.savings)}**\n\n` +
      `**Section 80C:** ${fmt(tax.section80C_used)} / ₹1,50,000 used\n` +
      (tax.section80C_remaining > 0
        ? `⚠️ **${fmt(tax.section80C_remaining)} of 80C unused!** Invest in ELSS or PPF before March 31 to save ~${fmt(Math.round(tax.section80C_remaining * 0.312))} in tax.`
        : `✅ Section 80C fully utilized.`);
  }

  // ─── Invest ───
  if (q.includes('invest') || q.includes('₹1l') || q.includes('1 lakh') || q.includes('where should')) {
    const ef = ctx.emergencyFund;
    const tax = ctx.tax;
    let response = `**Investment Recommendation (based on your data):**\n\n`;

    if (ef && ef.monthsCovered < 6) {
      response += `**1. Emergency Fund FIRST** — You only have ${ef.monthsCovered.toFixed(1)} months covered (need 6). Park ${fmt(ef.gap)} in a liquid fund before investing elsewhere.\n\n`;
    }
    if (tax && tax.section80C_remaining > 0) {
      response += `**2. ELSS Tax Saver** — ${fmt(Math.min(tax.section80C_remaining, 150000))} in ELSS saves tax AND gives equity exposure (3-year lock-in).\n\n`;
    }
    response += `**3. Index Fund SIP** — Nifty 50 or Nifty Next 50 index fund for long-term wealth. Start with ₹5-10K/month SIP.\n\n`;
    response += `**4. NPS** — Additional ₹50K gets you extra tax deduction under 80CCD(1B).\n`;

    return response;
  }

  // ─── Savings ───
  if (q.includes('saving') || q.includes('save more') || q.includes('cut') || q.includes('expense')) {
    const budget = ctx.budget;
    if (!budget) return "Add your monthly budget to get savings advice.";

    return `**Savings Analysis:**\n\n` +
      `**Monthly Income:** ${fmt(budget.monthlyExpenses + budget.surplus)}\n` +
      `**Monthly Expenses:** ${fmt(budget.monthlyExpenses)}\n` +
      `**Savings Rate:** ${Math.round(budget.savingsRate * 100)}% ${budget.savingsRate >= 0.3 ? '✅' : '⚠️'}\n\n` +
      `**Wants spending:** ${fmt(budget.wants)} (${Math.round((budget.wants / (budget.monthlyExpenses + budget.surplus)) * 100)}% of income)\n\n` +
      (budget.savingsRate < 0.3
        ? `To reach **30% savings rate**, you need to save ${fmt(Math.round((budget.monthlyExpenses + budget.surplus) * 0.3 - budget.surplus))}/month more. Look at wants spending — even a 20% cut saves ${fmt(Math.round(budget.wants * 0.2))}/month.`
        : `Great savings rate! Consider increasing SIPs by ${fmt(Math.round(budget.surplus * 0.3))} to accelerate wealth building.`);
  }

  // ─── Risk / Summary ───
  if (q.includes('risk') || q.includes('summary') || q.includes('summarize') || q.includes('overview') || q.includes('what should') || q.includes('action plan')) {
    const insights = generateInsights({ snapshot: ctx.snapshot, emergencyFund: ctx.emergencyFund, debtSummary: ctx.debtSummary, tax: ctx.tax, goals: ctx.goals, budget: ctx.budget, insurance: ctx.insurance, assetAllocation: ctx.assetAllocation });
    const dangers = insights.filter((i) => i.type === 'danger');
    const warns = insights.filter((i) => i.type === 'warn');

    let response = `**Your Financial Health: ${ctx.snapshot?.healthScore}/100**\n\n`;

    if (dangers.length > 0) {
      response += `**🔴 Critical Issues:**\n`;
      dangers.forEach((d) => { response += `- ${d.title}: ${d.action}\n`; });
      response += `\n`;
    }
    if (warns.length > 0) {
      response += `**🟡 Needs Attention:**\n`;
      warns.forEach((w) => { response += `- ${w.title}: ${w.action}\n`; });
      response += `\n`;
    }
    if (dangers.length === 0 && warns.length === 0) {
      response += `✅ No critical issues found. Your finances are in good shape!\n`;
    }

    response += `\n**Quick Numbers:**\n` +
      `- Net Worth: ${fmt(ctx.snapshot?.netWorth || 0)}\n` +
      `- Monthly Surplus: ${fmt(ctx.budget?.surplus || 0)}\n` +
      `- Debt-to-Income: ${ctx.debtSummary?.debtToIncome || 0}%\n`;

    return response;
  }

  // ─── Default ───
  return `Here's what I can help you with based on your data:\n\n` +
    `- **"Can I retire at 50/55/60?"** — I'll project your corpus\n` +
    `- **"What if I prepay ₹5L on home loan?"** — Interest savings calculation\n` +
    `- **"Which tax regime is better?"** — Side-by-side comparison\n` +
    `- **"How should I invest ₹1L?"** — Priority-based recommendation\n` +
    `- **"How can I save more?"** — Budget analysis with suggestions\n` +
    `- **"What are my top risks?"** — Health score breakdown\n` +
    `- **"Give me an action plan"** — Prioritized recommendations\n\n` +
    `Just ask naturally — I have all your financial data loaded.`;
}

/**
 * Generate proactive insights based on current financial state
 */
export const generateInsights = (data) => {
  // Accept both full data and pre-built context
  const ctx = data.snapshot ? data : null;
  if (!ctx && !data.assets) return [];

  const insights = [];

  // Use context object if available, or build from raw data
  const emergencyFund = ctx?.emergencyFund || data.emergencyFund;
  const debtSummary = ctx?.debtSummary || data.debtSummary;
  const tax = ctx?.tax || data.tax;
  const goals = ctx?.goals || data.goals;
  const budget = ctx?.budget || data.budget;
  const insurance = ctx?.insurance || data.insurance;
  const assetAllocation = ctx?.assetAllocation || data.assetAllocation;

  if (emergencyFund) {
    if (emergencyFund.monthsCovered < 3) {
      insights.push({ type: 'danger', module: 'emergency', title: 'Emergency fund critically low',
        detail: `Only ${emergencyFund.monthsCovered?.toFixed?.(1) || emergencyFund.monthsCovered} months covered. Target: 6 months.`,
        action: `Build liquid assets urgently.` });
    } else if (emergencyFund.monthsCovered < 6) {
      insights.push({ type: 'warn', module: 'emergency', title: 'Emergency fund below target',
        detail: `${emergencyFund.monthsCovered?.toFixed?.(1) || emergencyFund.monthsCovered} months covered (target: 6).`,
        action: 'Redirect surplus to liquid fund.' });
    }
  }

  if (debtSummary) {
    const dti = typeof debtSummary.debtToIncome === 'number'
      ? (debtSummary.debtToIncome > 1 ? debtSummary.debtToIncome : debtSummary.debtToIncome * 100)
      : 0;
    if (dti > 50) {
      insights.push({ type: 'danger', module: 'debt', title: 'Debt-to-income ratio is high',
        detail: `EMIs consume ${Math.round(dti)}% of monthly income.`,
        action: 'Prioritize paying off highest-rate debt.' });
    } else if (dti > 35) {
      insights.push({ type: 'warn', module: 'debt', title: 'Debt load needs attention',
        detail: `EMIs are ${Math.round(dti)}% of income. Healthy is <35%.`,
        action: 'Consider accelerating high-rate loan payoff.' });
    }
  }

  if (tax) {
    if (tax.section80C_remaining > 0) {
      insights.push({ type: 'info', module: 'tax',
        title: `₹${Math.round(tax.section80C_remaining / 1000)}K of 80C room remaining`,
        detail: `Used ₹${Math.round(tax.section80C_used / 1000)}K of ₹1.5L limit.`,
        action: `Invest in ELSS before March 31.` });
    }
    if (tax.savings > 10000) {
      insights.push({ type: 'success', module: 'tax',
        title: `${tax.betterRegime === 'new' ? 'New' : 'Old'} regime saves ₹${Math.round(tax.savings / 1000)}K`,
        detail: `New: ₹${Math.round(tax.newRegimeTax / 1000)}K vs Old: ₹${Math.round(tax.oldRegimeTax / 1000)}K.`,
        action: `File under ${tax.betterRegime} regime.` });
    }
  }

  if (assetAllocation && assetAllocation.length > 0) {
    const top = assetAllocation[0];
    if (top && top.pct > 60) {
      insights.push({ type: 'warn', module: 'investment',
        title: `${top.type} is ${top.pct}% of portfolio`,
        detail: 'Single asset above 60% is concentration risk.',
        action: 'Diversify into other asset classes.' });
    }
  }

  if (goals && Array.isArray(goals)) {
    const offTrack = goals.filter((g) => !g.onTrack && g.shortfall > 0);
    for (const g of offTrack.slice(0, 2)) {
      insights.push({ type: g.shortfall > g.target * 0.3 ? 'danger' : 'warn', module: 'goals',
        title: `${g.name} is off-track`,
        detail: `Shortfall of ₹${Math.round(g.shortfall / 100000)}L at current pace.`,
        action: `Increase SIP to ₹${Math.round(g.requiredSIP / 1000)}K/month.` });
    }
  }

  if (budget && budget.savingsRate < 0.15) {
    insights.push({ type: 'danger', module: 'budget',
      title: `Savings rate is only ${Math.round(budget.savingsRate * 100)}%`,
      detail: 'Below 15% makes wealth building very difficult.',
      action: 'Target 30%+ by reducing discretionary spending.' });
  }

  if (insurance) {
    if (insurance.termGap > 0) {
      insights.push({ type: 'warn', module: 'insurance',
        title: `Term insurance gap`,
        detail: `Have ₹${Math.round((insurance.currentTermCover || insurance.termCover || 0) / 10000000)}Cr, need ₹${Math.round((insurance.recommendedTermCover || 0) / 10000000)}Cr (10x income).`,
        action: 'Get additional term cover.' });
    }
  }

  return insights;
};

/**
 * Suggested quick questions
 */
export const quickQuestions = [
  'Can I retire at 50 with my current savings rate?',
  'What if I prepay ₹5L on my home loan?',
  'How should I invest my next ₹1L?',
  'Which tax regime is better for me and why?',
  'What are my top 3 financial risks right now?',
  'How can I increase my savings rate to 40%?',
  'Give me a prioritized action plan',
  'Summarize my financial health',
];
