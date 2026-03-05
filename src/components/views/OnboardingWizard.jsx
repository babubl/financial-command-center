// ─── Onboarding Wizard ───
// First-run experience. Guides user through entering their financial data.
// No AI needed — just clean, fast forms.

import React, { useState } from 'react';
import { useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { generateId, formatINR } from '@/utils/formatters';
import { assetTypes, loanTypes } from '@/config/theme';
import {
  User,
  Wallet,
  CreditCard,
  TrendingUp,
  Target,
  PieChart,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle,
  ArrowRight,
  SkipForward,
} from 'lucide-react';

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'profile', label: 'About You', icon: User },
  { id: 'income', label: 'Income', icon: Wallet },
  { id: 'assets', label: 'Assets', icon: TrendingUp },
  { id: 'loans', label: 'Loans', icon: CreditCard },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'budget', label: 'Budget', icon: PieChart },
];

// ═══════════════════════════════════════
// Quick asset templates for one-click add
// ═══════════════════════════════════════
const assetTemplates = [
  { type: 'equity', name: 'Stocks (Zerodha/Groww)', icon: '📈' },
  { type: 'mutualFund', name: 'Mutual Fund SIP', icon: '📊' },
  { type: 'mutualFund', name: 'ELSS Tax Saver', icon: '🏛️' },
  { type: 'realEstate', name: 'Property / Flat', icon: '🏠' },
  { type: 'gold', name: 'Gold / SGB', icon: '🥇' },
  { type: 'fd', name: 'Fixed Deposit', icon: '🔒' },
  { type: 'ppfEpf', name: 'PPF', icon: '🛡️' },
  { type: 'ppfEpf', name: 'EPF Balance', icon: '🏦' },
  { type: 'nps', name: 'NPS', icon: '📋' },
  { type: 'cash', name: 'Savings Account', icon: '💰' },
];

const loanTemplates = [
  { type: 'home', name: 'Home Loan', icon: '🏠' },
  { type: 'car', name: 'Car Loan', icon: '🚗' },
  { type: 'personal', name: 'Personal Loan', icon: '💳' },
  { type: 'education', name: 'Education Loan', icon: '🎓' },
  { type: 'credit', name: 'Credit Card Debt', icon: '💳' },
];

const goalTemplates = [
  { name: 'Retirement', target: 50000000, year: 2050, priority: 'critical', icon: '🏖️' },
  { name: 'Child Education', target: 3000000, year: 2038, priority: 'high', icon: '🎓' },
  { name: 'Emergency Fund', target: 1200000, year: 2027, priority: 'critical', icon: '🆘' },
  { name: 'Dream Vacation', target: 500000, year: 2027, priority: 'medium', icon: '✈️' },
  { name: 'New Car', target: 1500000, year: 2029, priority: 'low', icon: '🚗' },
  { name: 'House Down Payment', target: 2000000, year: 2030, priority: 'high', icon: '🏠' },
];

const budgetTemplates = [
  { category: 'housing', label: 'Rent / Maintenance', amount: 0 },
  { category: 'emi', label: 'EMIs (auto-calculated)', amount: 0 },
  { category: 'food', label: 'Groceries & Dining', amount: 0 },
  { category: 'transport', label: 'Fuel / Uber / Metro', amount: 0 },
  { category: 'utilities', label: 'Electric + Internet + Phone', amount: 0 },
  { category: 'medical', label: 'Medical', amount: 0 },
  { category: 'education', label: 'School / Tuition', amount: 0 },
  { category: 'entertainment', label: 'Entertainment / OTT', amount: 0 },
  { category: 'shopping', label: 'Shopping', amount: 0 },
  { category: 'insurance', label: 'Insurance Premiums', amount: 0 },
  { category: 'investment', label: 'SIPs / Investments', amount: 0 },
  { category: 'other', label: 'Miscellaneous', amount: 0 },
];

export default function OnboardingWizard({ onComplete }) {
  const dispatch = useFinanceDispatch();
  const [stepIdx, setStepIdx] = useState(0);

  // ─── Form State ───
  const [profile, setProfile] = useState({
    name: '', age: '', retirementAge: '55', taxRegime: 'new', city: '', dependents: '0',
  });
  const [income, setIncome] = useState({
    salary: '', rental: '', interest: '', dividends: '', freelance: '',
    bonus: '', otherIncome: '',
  });
  const [assets, setAssets] = useState([]);
  const [loans, setLoans] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budget, setBudget] = useState(budgetTemplates.map((b) => ({ ...b })));

  const currentStep = STEPS[stepIdx];

  const canProceed = () => {
    if (currentStep.id === 'profile') return profile.name.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const handleSkipToEnd = () => {
    handleFinish();
  };

  const handleFinish = () => {
    // Build the full data object
    const data = {
      profile: {
        name: profile.name.trim() || 'User',
        age: Number(profile.age) || 30,
        retirementAge: Number(profile.retirementAge) || 55,
        taxRegime: profile.taxRegime,
        city: profile.city.trim() || '',
        dependents: Number(profile.dependents) || 0,
      },
      income: {
        monthly: {
          salary: parseNum(income.salary),
          rental: parseNum(income.rental),
          interest: parseNum(income.interest),
          dividends: parseNum(income.dividends),
          freelance: parseNum(income.freelance),
        },
        annual: {
          bonus: parseNum(income.bonus),
          otherIncome: parseNum(income.otherIncome),
        },
      },
      assets: assets.filter((a) => a.value > 0).map((a, i) => ({
        id: generateId() + i,
        type: a.type,
        name: a.name,
        value: a.value,
        investedValue: a.investedValue || a.value,
        sipAmount: a.sipAmount || 0,
      })),
      liabilities: loans.filter((l) => l.outstanding > 0).map((l, i) => ({
        id: generateId() + i,
        type: l.type,
        name: l.name,
        principal: l.principal || l.outstanding,
        outstanding: l.outstanding,
        emi: l.emi || 0,
        rate: l.rate || 0,
        tenureMonths: l.tenureMonths || 0,
        remainingMonths: l.remainingMonths || 0,
      })),
      goals: goals.filter((g) => g.targetAmount > 0).map((g, i) => ({
        id: generateId() + i,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount || 0,
        monthlySIP: g.monthlySIP || 0,
        targetYear: g.targetYear || 2035,
        expectedReturn: g.expectedReturn || 0.10,
        priority: g.priority || 'medium',
      })),
      budget: {
        expenses: budget.filter((b) => b.amount > 0).map((b) => ({
          category: b.category,
          label: b.label,
          amount: b.amount,
        })),
      },
      insurance: {
        term: { cover: 0, premium: 0, provider: '' },
        health: { cover: 0, premium: 0, provider: '' },
      },
      taxDeductions: {
        section80C: { epf: 0, ppf: 0, elss: 0, liPremium: 0, tuitionFees: 0, hlPrincipal: 0 },
        section80D: { selfFamily: 0, parents: 0 },
        section80CCD1B: 0,
        section24b: 0,
      },
    };

    dispatch({ type: ACTIONS.IMPORT_DATA, payload: data });
    onComplete();
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        {currentStep.id !== 'welcome' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {STEPS.slice(1).map((s, i) => {
                const Icon = s.icon;
                const isActive = i + 1 === stepIdx;
                const isDone = i + 1 < stepIdx;
                return (
                  <div key={s.id} className="flex items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isDone ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : isActive ? 'bg-cyan/20 border border-cyan/40 text-cyan'
                      : 'bg-navy-800 border border-navy-500/30 text-dim'
                    }`}>
                      {isDone ? <CheckCircle size={12} /> : <Icon size={12} />}
                    </div>
                    {i < STEPS.length - 2 && (
                      <div className={`w-8 h-0.5 rounded ${isDone ? 'bg-emerald-500/40' : 'bg-navy-500/30'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-dim text-center">{stepIdx} of {STEPS.length - 1}</p>
          </div>
        )}

        {/* Card */}
        <div className="glass-card p-6 md:p-8">
          {/* ─── WELCOME ─── */}
          {currentStep.id === 'welcome' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/25 flex items-center justify-center mx-auto mb-5">
                <Sparkles size={28} className="text-cyan" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                Financial Command Center
              </h1>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed mb-8">
                Your complete financial picture in one place. Let's set up your dashboard — it takes about 3 minutes.
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan/20 border border-cyan/30 text-cyan font-medium text-sm hover:bg-cyan/30 transition-all"
                >
                  Set Up My Dashboard <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => { onComplete(); }}
                  className="text-xs text-dim hover:text-muted transition-colors"
                >
                  Skip — explore with sample data
                </button>
              </div>
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {currentStep.id === 'profile' && (
            <div>
              <StepHeader icon={User} title="About You" subtitle="Basic info to personalize your dashboard" />
              <div className="space-y-4 mt-5">
                <Field label="Your Name *" value={profile.name}
                  onChange={(v) => setProfile({ ...profile, name: v })} placeholder="e.g., Babu" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Age" value={profile.age} type="number"
                    onChange={(v) => setProfile({ ...profile, age: v })} placeholder="35" />
                  <Field label="Retirement Age" value={profile.retirementAge} type="number"
                    onChange={(v) => setProfile({ ...profile, retirementAge: v })} placeholder="55" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" value={profile.city}
                    onChange={(v) => setProfile({ ...profile, city: v })} placeholder="Chennai" />
                  <Field label="Dependents" value={profile.dependents} type="number"
                    onChange={(v) => setProfile({ ...profile, dependents: v })} placeholder="2" />
                </div>
                <div>
                  <label className="input-label">Tax Regime</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['new', 'old'].map((r) => (
                      <button key={r} onClick={() => setProfile({ ...profile, taxRegime: r })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-center border transition-all ${
                          profile.taxRegime === r
                            ? 'border-cyan/40 bg-cyan/10 text-cyan'
                            : 'border-navy-500/30 bg-navy-900/40 text-muted hover:border-navy-500/50'
                        }`}>
                        {r === 'new' ? 'New Regime' : 'Old Regime'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── INCOME ─── */}
          {currentStep.id === 'income' && (
            <div>
              <StepHeader icon={Wallet} title="Your Income" subtitle="Monthly take-home and other sources" />
              <div className="space-y-3 mt-5">
                <Field label="Monthly Salary (take-home)" value={income.salary} type="number" prefix="₹"
                  onChange={(v) => setIncome({ ...income, salary: v })} placeholder="185000"
                  hint="After TDS. E.g., 1.85L = 185000" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Rental Income /mo" value={income.rental} type="number" prefix="₹"
                    onChange={(v) => setIncome({ ...income, rental: v })} placeholder="0" />
                  <Field label="Interest Income /mo" value={income.interest} type="number" prefix="₹"
                    onChange={(v) => setIncome({ ...income, interest: v })} placeholder="0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Dividends /mo" value={income.dividends} type="number" prefix="₹"
                    onChange={(v) => setIncome({ ...income, dividends: v })} placeholder="0" />
                  <Field label="Freelance /mo" value={income.freelance} type="number" prefix="₹"
                    onChange={(v) => setIncome({ ...income, freelance: v })} placeholder="0" />
                </div>
                <div className="border-t border-navy-500/30 pt-3">
                  <p className="section-label mb-2">Annual</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Bonus /year" value={income.bonus} type="number" prefix="₹"
                      onChange={(v) => setIncome({ ...income, bonus: v })} placeholder="350000" />
                    <Field label="Other Income /year" value={income.otherIncome} type="number" prefix="₹"
                      onChange={(v) => setIncome({ ...income, otherIncome: v })} placeholder="0" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ASSETS ─── */}
          {currentStep.id === 'assets' && (
            <div>
              <StepHeader icon={TrendingUp} title="Your Assets"
                subtitle="Tap to add. Enter current value and invested amount." />
              {/* Templates */}
              <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
                {assetTemplates.map((t, i) => {
                  const alreadyAdded = assets.some((a) => a.templateIdx === i);
                  return (
                    <button key={i}
                      onClick={() => {
                        if (!alreadyAdded) {
                          setAssets([...assets, { ...t, templateIdx: i, value: 0, investedValue: 0, sipAmount: 0 }]);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        alreadyAdded
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-navy-500/30 bg-navy-900/40 text-muted hover:border-cyan/30 hover:text-cyan'
                      }`}>
                      <span>{t.icon}</span> {t.name}
                      {alreadyAdded && <CheckCircle size={10} />}
                    </button>
                  );
                })}
              </div>
              {/* Asset entries */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {assets.map((a, i) => (
                  <div key={i} className="px-3 py-3 rounded-lg bg-navy-900/40 border border-navy-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-200">{a.icon} {a.name}</span>
                      <button onClick={() => setAssets(assets.filter((_, j) => j !== i))}
                        className="text-dim hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <MiniField label="Current Value" value={a.value}
                        onChange={(v) => { const u = [...assets]; u[i].value = parseNum(v); setAssets(u); }} />
                      <MiniField label="Invested" value={a.investedValue}
                        onChange={(v) => { const u = [...assets]; u[i].investedValue = parseNum(v); setAssets(u); }} />
                      {['mutualFund', 'nps'].includes(a.type) && (
                        <MiniField label="SIP /mo" value={a.sipAmount}
                          onChange={(v) => { const u = [...assets]; u[i].sipAmount = parseNum(v); setAssets(u); }} />
                      )}
                    </div>
                  </div>
                ))}
                {assets.length === 0 && (
                  <p className="text-xs text-dim text-center py-4">Tap the buttons above to add your assets</p>
                )}
              </div>
              {assets.length > 0 && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-navy-800/50 flex justify-between">
                  <span className="text-[11px] text-muted">Total Assets</span>
                  <span className="text-xs font-mono font-bold text-cyan">
                    {formatINR(assets.reduce((s, a) => s + (a.value || 0), 0), true)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── LOANS ─── */}
          {currentStep.id === 'loans' && (
            <div>
              <StepHeader icon={CreditCard} title="Loans & Debt" subtitle="Add any active loans or credit card debt" />
              <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
                {loanTemplates.map((t, i) => (
                  <button key={i}
                    onClick={() => setLoans([...loans, { ...t, outstanding: 0, emi: 0, rate: 0, principal: 0, tenureMonths: 0, remainingMonths: 0 }])}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-navy-500/30 bg-navy-900/40 text-muted hover:border-cyan/30 hover:text-cyan transition-all">
                    <span>{t.icon}</span> {t.name}
                    <Plus size={10} />
                  </button>
                ))}
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {loans.map((l, i) => (
                  <div key={i} className="px-3 py-3 rounded-lg bg-navy-900/40 border border-navy-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-200">{l.icon} {l.name}</span>
                      <button onClick={() => setLoans(loans.filter((_, j) => j !== i))}
                        className="text-dim hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <MiniField label="Outstanding" value={l.outstanding}
                        onChange={(v) => { const u = [...loans]; u[i].outstanding = parseNum(v); u[i].principal = u[i].principal || parseNum(v); setLoans(u); }} />
                      <MiniField label="EMI /mo" value={l.emi}
                        onChange={(v) => { const u = [...loans]; u[i].emi = parseNum(v); setLoans(u); }} />
                      <MiniField label="Rate %" value={l.rate}
                        onChange={(v) => { const u = [...loans]; u[i].rate = parseFloat(v) || 0; setLoans(u); }} />
                    </div>
                  </div>
                ))}
                {loans.length === 0 && (
                  <p className="text-xs text-dim text-center py-4">No loans? Great! You can skip this step.</p>
                )}
              </div>
            </div>
          )}

          {/* ─── GOALS ─── */}
          {currentStep.id === 'goals' && (
            <div>
              <StepHeader icon={Target} title="Financial Goals" subtitle="What are you saving for?" />
              <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
                {goalTemplates.map((t, i) => {
                  const alreadyAdded = goals.some((g) => g.name === t.name);
                  return (
                    <button key={i}
                      onClick={() => {
                        if (!alreadyAdded) {
                          setGoals([...goals, { ...t, targetAmount: t.target, currentAmount: 0, monthlySIP: 0, targetYear: t.year, expectedReturn: 0.10 }]);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        alreadyAdded
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-navy-500/30 bg-navy-900/40 text-muted hover:border-cyan/30 hover:text-cyan'
                      }`}>
                      <span>{t.icon}</span> {t.name}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {goals.map((g, i) => (
                  <div key={i} className="px-3 py-3 rounded-lg bg-navy-900/40 border border-navy-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-200">{g.icon} {g.name}</span>
                      <button onClick={() => setGoals(goals.filter((_, j) => j !== i))}
                        className="text-dim hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <MiniField label="Target Amount" value={g.targetAmount}
                        onChange={(v) => { const u = [...goals]; u[i].targetAmount = parseNum(v); setGoals(u); }} />
                      <MiniField label="Saved So Far" value={g.currentAmount}
                        onChange={(v) => { const u = [...goals]; u[i].currentAmount = parseNum(v); setGoals(u); }} />
                      <MiniField label="Target Year" value={g.targetYear}
                        onChange={(v) => { const u = [...goals]; u[i].targetYear = parseInt(v) || 2035; setGoals(u); }} />
                    </div>
                  </div>
                ))}
                {goals.length === 0 && (
                  <p className="text-xs text-dim text-center py-4">Tap goals above to add them</p>
                )}
              </div>
            </div>
          )}

          {/* ─── BUDGET ─── */}
          {currentStep.id === 'budget' && (
            <div>
              <StepHeader icon={PieChart} title="Monthly Budget" subtitle="Rough estimates are fine — you can refine later" />
              <div className="space-y-2 mt-5 max-h-[350px] overflow-y-auto pr-1">
                {budget.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] text-muted w-44 flex-shrink-0 truncate">{b.label}</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-dim">₹</span>
                      <input type="number" value={b.amount || ''}
                        onChange={(e) => {
                          const u = [...budget];
                          u[i].amount = parseNum(e.target.value);
                          setBudget(u);
                        }}
                        className="input-field text-xs py-1.5 pl-5 text-right" placeholder="0" />
                    </div>
                  </div>
                ))}
              </div>
              {budget.some((b) => b.amount > 0) && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-navy-800/50 flex justify-between">
                  <span className="text-[11px] text-muted">Total Monthly Expenses</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {formatINR(budget.reduce((s, b) => s + (b.amount || 0), 0), true)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── Navigation ─── */}
          {currentStep.id !== 'welcome' && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-500/30">
              <button onClick={handleBack} className="flex items-center gap-1 text-xs text-muted hover:text-slate-100 transition-colors">
                <ChevronLeft size={14} /> Back
              </button>

              <button onClick={handleSkipToEnd} className="flex items-center gap-1 text-[10px] text-dim hover:text-muted transition-colors">
                <SkipForward size={12} /> Skip & finish with what I have
              </button>

              {stepIdx < STEPS.length - 1 ? (
                <button onClick={handleNext} disabled={!canProceed()}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan text-xs font-medium hover:bg-cyan/30 disabled:opacity-40 transition-all">
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={handleFinish}
                  className="flex items-center gap-1 px-5 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all">
                  <CheckCircle size={14} /> Launch Dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function StepHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/25 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-cyan" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-100">{title}</h2>
        <p className="text-[11px] text-dim">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, hint, prefix }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-dim">{prefix}</span>}
        <input type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input-field ${prefix ? 'pl-6' : ''}`} />
      </div>
      {hint && <p className="text-[9px] text-dim mt-1">{hint}</p>}
    </div>
  );
}

function MiniField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[9px] text-dim mb-0.5 block">{label}</label>
      <input type="number" value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="input-field text-[11px] py-1.5" />
    </div>
  );
}

function parseNum(v) {
  if (!v) return 0;
  const s = String(v).replace(/[₹,\s]/g, '');
  return Number(s) || 0;
}
