// ─── AI Agent Service ───
// Hybrid: Claude API when key available, smart rule-based fallback always works.

import { buildAgentContext } from './calculations';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are a sharp Indian financial advisor in a Financial Command Center. You have the user's complete data.

RULES:
- Direct and actionable, Indian context (₹, Lakhs, Crores)
- Reference specific numbers from data
- Prioritize by ₹ impact
- Bold key numbers with **bold**
- 3-5 key points max
- Specific actions: "Increase Nifty 50 SIP from ₹10K to ₹15K"
- Quantify impact: "Saves ₹4.2L in interest over 8 years"

CAN: Analyze portfolio/debt/tax/goals/budget, what-if scenarios, project future values, compare tax regimes
CANNOT: Stock picks, guarantee returns, legal advice`;

export const sendAgentMessage = async (userMessage, financialData, conversationHistory = [], apiKey = null) => {
  const context = buildAgentContext(financialData);

  // Try Claude API if key available
  if (apiKey) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: MODEL, max_tokens: 1000,
          system: `${SYSTEM_PROMPT}\n\nUSER DATA:\n${JSON.stringify(context, null, 2)}`,
          messages: [...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n');
        if (text) return text;
      }
    } catch (err) { console.log('API unavailable, using rule engine:', err.message); }
  }

  // Also try without key (works in claude.ai artifacts)
  if (!apiKey) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL, max_tokens: 1000,
          system: `${SYSTEM_PROMPT}\n\nUSER DATA:\n${JSON.stringify(context, null, 2)}`,
          messages: [...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n');
        if (text) return text;
      }
    } catch {}
  }

  return generateRuleBasedResponse(userMessage, context);
};

function generateRuleBasedResponse(question, ctx) {
  const q = question.toLowerCase();
  const fmt = (n) => { if (n >= 1e7) return `₹${(n/1e7).toFixed(2)} Cr`; if (n >= 1e5) return `₹${(n/1e5).toFixed(2)} L`; if (n >= 1e3) return `₹${(n/1e3).toFixed(0)}K`; return `₹${n.toLocaleString('en-IN')}`; };

  if (q.includes('retire')) {
    const age = ctx.profile?.age || 30, retAge = ctx.profile?.retirementAge || 55, years = retAge - age;
    const mi = ctx.income?.monthly || 0, sr = ctx.budget?.savingsRate || 0, ms = mi * sr, nw = ctx.snapshot?.netWorth || 0;
    const proj = nw * Math.pow(1.1, years) + ms * ((Math.pow(1 + 0.1/12, years*12) - 1) / (0.1/12));
    const need = (ctx.budget?.monthlyExpenses || 0) * 12 * 25;
    return `**Retirement at ${retAge} (${years} years away):**\n\nCurrent net worth: **${fmt(nw)}**\nMonthly savings: **${fmt(Math.round(ms))}** (${Math.round(sr*100)}%)\n\nProjected corpus: **${fmt(Math.round(proj))}** (10% CAGR)\nRequired: **${fmt(Math.round(need))}** (25x expenses)\n\n${proj >= need ? '✅ **On track!** Keep savings rate above 25%.' : `⚠️ **Gap: ${fmt(Math.round(need-proj))}.** Increase SIPs to close it.`}`;
  }

  if (q.includes('prepay') || q.includes('home loan')) {
    const hl = ctx.debts?.find(d => /home/i.test(d.name));
    if (!hl) return "No home loan found. Add one via the Debt card.";
    const mr = hl.rate/100/12;
    let r = `**Home Loan Prepayment:**\n\n${hl.name}: **${fmt(hl.outstanding)}** at ${hl.rate}% | EMI ${fmt(hl.emi)}/mo\n\n`;
    [300000,500000,1000000].forEach(amt => { if (amt >= hl.outstanding) return; const no = hl.outstanding - amt; const nt = Math.ceil(-Math.log(1-(no*mr)/hl.emi)/Math.log(1+mr)); const saved = hl.remainingMonths - nt; r += `• Prepay **${fmt(amt)}** → ${saved} months earlier, ~**${fmt(Math.round(hl.emi*saved*0.4))}** interest saved\n`; });
    return r;
  }

  if (q.includes('tax') || q.includes('regime') || q.includes('80c')) {
    const t = ctx.tax; if (!t) return "Add income data to get tax analysis.";
    return `**Tax Analysis:**\n\nGross Income: **${fmt(t.grossIncome)}**\nNew Regime: **${fmt(t.newRegimeTax)}** | Old Regime: **${fmt(t.oldRegimeTax)}**\n\n**${t.betterRegime === 'new' ? 'New' : 'Old'} regime saves ${fmt(t.savings)}**\n\n80C: ${fmt(t.section80C_used)} / ₹1.5L${t.section80C_remaining > 0 ? `\n⚠️ **${fmt(t.section80C_remaining)} unused!** ELSS/PPF before March 31.` : '\n✅ Fully utilized.'}`;
  }

  if (q.includes('invest') || q.includes('where should') || q.includes('1 lakh')) {
    let r = '**Where to invest:**\n\n';
    const ef = ctx.emergencyFund;
    if (ef && ef.monthsCovered < 6) r += `**1. Emergency Fund FIRST** — ${ef.monthsCovered.toFixed(1)} months (need 6). Liquid fund.\n\n`;
    if (ctx.tax?.section80C_remaining > 0) r += `**2. ELSS** — ${fmt(ctx.tax.section80C_remaining)} saves tax + equity exposure.\n\n`;
    r += '**3. Nifty 50 Index SIP** — ₹5-10K/mo for long-term wealth.\n**4. NPS** — Extra ₹50K deduction under 80CCD(1B).\n';
    return r;
  }

  if (q.includes('save') || q.includes('expense') || q.includes('cut')) {
    const b = ctx.budget; if (!b) return "Add budget data for savings advice.";
    return `**Savings Analysis:**\n\nIncome: **${fmt(b.monthlyExpenses + b.surplus)}** | Expenses: **${fmt(b.monthlyExpenses)}**\nSavings Rate: **${Math.round(b.savingsRate*100)}%** ${b.savingsRate >= 0.3 ? '✅' : '⚠️'}\n\n${b.savingsRate < 0.3 ? `Need ${fmt(Math.round((b.monthlyExpenses+b.surplus)*0.3 - b.surplus))}/mo more to hit 30%. Cut wants by 20% = ${fmt(Math.round(b.wants*0.2))}/mo saved.` : `Great rate! Increase SIPs by ${fmt(Math.round(b.surplus*0.3))} to accelerate.`}`;
  }

  if (q.includes('risk') || q.includes('summary') || q.includes('action') || q.includes('what should') || q.includes('overview')) {
    let r = `**Health Score: ${ctx.snapshot?.healthScore}/100**\n\n`;
    const checks = [];
    if (ctx.emergencyFund?.monthsCovered < 3) checks.push({ s: '🔴', t: `Emergency fund: ${ctx.emergencyFund.monthsCovered.toFixed(1)} months (need 6)` });
    if (ctx.debtSummary?.debtToIncome > 50) checks.push({ s: '🔴', t: `DTI: ${ctx.debtSummary.debtToIncome}% (danger >50%)` });
    if (ctx.budget?.savingsRate < 0.15) checks.push({ s: '🔴', t: `Savings rate: ${Math.round(ctx.budget.savingsRate*100)}% (need >15%)` });
    if (ctx.tax?.section80C_remaining > 0) checks.push({ s: '🟡', t: `80C unused: ${fmt(ctx.tax.section80C_remaining)}` });
    if (ctx.emergencyFund?.monthsCovered >= 3 && ctx.emergencyFund?.monthsCovered < 6) checks.push({ s: '🟡', t: `Emergency fund: ${ctx.emergencyFund.monthsCovered.toFixed(1)} months (target 6)` });
    if (checks.length) checks.forEach(c => { r += `${c.s} ${c.t}\n`; });
    else r += '✅ No critical issues.\n';
    r += `\nNet Worth: **${fmt(ctx.snapshot?.netWorth||0)}** | Surplus: **${fmt(ctx.budget?.surplus||0)}/mo**`;
    return r;
  }

  return `I can help with:\n\n• **"Can I retire at 50?"** — Corpus projection\n• **"Prepay ₹5L on home loan"** — Interest savings\n• **"Which tax regime?"** — Comparison\n• **"How to invest ₹1L?"** — Priority recommendations\n• **"Top risks"** — Health score analysis\n• **"Action plan"** — Prioritized steps\n\nJust ask naturally!`;
}

export const generateInsights = (data) => {
  const insights = [];
  const ctx = data.snapshot ? data : {};
  const ef = ctx.emergencyFund || data.emergencyFund;
  const ds = ctx.debtSummary || data.debtSummary;
  const tax = ctx.tax || data.tax;
  const budget = ctx.budget || data.budget;
  const aa = ctx.assetAllocation || data.assetAllocation;
  const goals = ctx.goals || data.goals;

  if (ef) { if (ef.monthsCovered < 3) insights.push({ type:'danger',module:'emergency',title:'Emergency fund critically low',detail:`${ef.monthsCovered?.toFixed?.(1)||ef.monthsCovered} months (need 6)`,action:'Build liquid assets urgently.' }); else if (ef.monthsCovered < 6) insights.push({ type:'warn',module:'emergency',title:'Emergency fund below target',detail:`${ef.monthsCovered?.toFixed?.(1)||ef.monthsCovered} months (target 6)`,action:'Redirect surplus to liquid fund.' }); }
  if (ds) { const d = ds.debtToIncome > 1 ? ds.debtToIncome : ds.debtToIncome * 100; if (d > 50) insights.push({ type:'danger',module:'debt',title:'High debt-to-income',detail:`${Math.round(d)}% of income`,action:'Pay off highest-rate debt.' }); else if (d > 35) insights.push({ type:'warn',module:'debt',title:'Debt needs attention',detail:`${Math.round(d)}% (healthy <35%)`,action:'Accelerate payoff.' }); }
  if (tax?.section80C_remaining > 0) insights.push({ type:'info',module:'tax',title:`₹${Math.round(tax.section80C_remaining/1000)}K 80C unused`,detail:`${Math.round(tax.section80C_used/1000)}K of ₹1.5L used`,action:'Invest in ELSS before March 31.' });
  if (tax?.savings > 10000) insights.push({ type:'success',module:'tax',title:`${tax.betterRegime==='new'?'New':'Old'} regime saves ₹${Math.round(tax.savings/1000)}K`,detail:`New: ₹${Math.round(tax.newRegimeTax/1000)}K vs Old: ₹${Math.round(tax.oldRegimeTax/1000)}K`,action:`File under ${tax.betterRegime} regime.` });
  if (aa?.[0]?.pct > 60) insights.push({ type:'warn',module:'investment',title:`${aa[0].type} is ${aa[0].pct}% of portfolio`,detail:'Concentration risk >60%',action:'Diversify.' });
  if (budget?.savingsRate < 0.15) insights.push({ type:'danger',module:'budget',title:`Savings rate ${Math.round(budget.savingsRate*100)}%`,detail:'Below 15%',action:'Target 30%+.' });
  if (goals) { goals.filter(g => !g.onTrack && g.shortfall > 0).slice(0,2).forEach(g => insights.push({ type:'warn',module:'goals',title:`${g.name} off-track`,detail:`Gap ₹${Math.round(g.shortfall/1e5)}L`,action:`SIP ₹${Math.round(g.requiredSIP/1000)}K/mo needed.` })); }
  return insights;
};

export const quickQuestions = [
  'Can I retire at 50?', 'What if I prepay ₹5L on home loan?', 'How should I invest ₹1L?',
  'Which tax regime is better?', 'Top 3 risks?', 'How to save more?', 'Give me an action plan', 'Summarize my finances',
];
