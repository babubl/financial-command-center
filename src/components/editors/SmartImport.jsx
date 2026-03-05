// ─── Smart Import (CSV Template + JSON) ───
// No AI needed. Reads structured CSV/Excel/JSON directly.
// Auto-detects column headers and asset types.

import React, { useState } from 'react';
import Modal from '@/components/shared/Modal';
import { useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { useApiKey } from '@/store/ApiKeyContext';
import { generateId, formatINR } from '@/utils/formatters';
import { Upload, Download, CheckCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

function parseCSVLine(line) {
  const result = []; let current = ''; let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { result.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('---'));
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  const rows = lines.slice(1).filter(l => !l.startsWith('Type,') && !l.startsWith('Name,')).map(line => {
    const vals = parseCSVLine(line); const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
  return { headers, rows };
}

function parseNum(v) {
  if (!v) return 0;
  let s = String(v).replace(/[₹,\s"]/g, '');
  if (/cr/i.test(s)) return parseFloat(s) * 10000000;
  if (/l(?:akh)?s?$/i.test(s)) return parseFloat(s) * 100000;
  if (/k$/i.test(s)) return parseFloat(s) * 1000;
  return Number(s) || 0;
}

function guessAssetType(name, type) {
  const t = (type + ' ' + name).toLowerCase();
  if (/mutual|mf|sip|index|flexi|elss|balanced|debt fund|liquid/i.test(t)) return 'mutualFund';
  if (/stock|equity|share|zerodha|groww|demat/i.test(t)) return 'equity';
  if (/real estate|property|flat|house|plot|land/i.test(t)) return 'realEstate';
  if (/gold|sgb|sovereign/i.test(t)) return 'gold';
  if (/fd|fixed deposit/i.test(t)) return 'fd';
  if (/ppf|epf|pf|provident/i.test(t)) return 'ppfEpf';
  if (/nps|pension/i.test(t)) return 'nps';
  if (/saving|current|bank|cash/i.test(t)) return 'cash';
  return 'equity';
}

function guessLoanType(name, type) {
  const t = (type + ' ' + name).toLowerCase();
  if (/home|housing/i.test(t)) return 'home';
  if (/car|vehicle/i.test(t)) return 'car';
  if (/education|student/i.test(t)) return 'education';
  if (/credit/i.test(t)) return 'credit';
  return 'personal';
}

function guessExpenseCategory(label) {
  const l = (label || '').toLowerCase();
  if (/rent|house|maintenance/i.test(l)) return 'housing';
  if (/food|grocer|dining/i.test(l)) return 'food';
  if (/fuel|uber|transport|travel/i.test(l)) return 'transport';
  if (/electric|internet|phone|util/i.test(l)) return 'utilities';
  if (/medical|doctor/i.test(l)) return 'medical';
  if (/school|tuition|education/i.test(l)) return 'education';
  if (/movie|ott|entertainment/i.test(l)) return 'entertainment';
  if (/shop|amazon/i.test(l)) return 'shopping';
  if (/insurance/i.test(l)) return 'insurance';
  if (/emi|loan/i.test(l)) return 'emi';
  if (/sip|invest/i.test(l)) return 'investment';
  return 'other';
}

function mapCSVToData(headers, rows) {
  const result = { assets: [], liabilities: [], goals: [], budget: [] };
  const h = headers.join(',');
  if (/current.*value|invested|nav|sip|corpus|market/i.test(h) || (/type/i.test(h) && /value/i.test(h))) {
    result.assets = rows.map(r => {
      const name = r.name || r.asset_name || r.scheme || r.fund_name || r.description || Object.values(r)[1] || '';
      return { id: generateId(), type: guessAssetType(name, r.type || r.asset_type || r.category || ''), name: String(name),
        value: parseNum(r.current_value || r.value || r.market_value || r.balance || Object.values(r)[2]),
        investedValue: parseNum(r.invested_value || r.invested || r.cost || Object.values(r)[3]),
        sipAmount: parseNum(r.sip_amount || r.sip || r.monthly_sip || 0) };
    }).filter(a => a.value > 0 && a.name);
  }
  if (/outstanding|emi|interest.*rate/i.test(h)) {
    result.liabilities = rows.map(r => {
      const name = r.name || r.loan_name || r.description || Object.values(r)[1] || 'Loan';
      return { id: generateId(), type: guessLoanType(name, r.type || r.loan_type || ''), name: String(name),
        principal: parseNum(r.principal || r.loan_amount || 0), outstanding: parseNum(r.outstanding || r.balance || Object.values(r)[2]),
        emi: parseNum(r.emi || r.monthly_emi || 0), rate: parseFloat(r.rate || r.interest_rate || 0) || 0,
        tenureMonths: parseInt(r.tenure_months || r.tenure || 0) || 0, remainingMonths: parseInt(r.remaining_months || r.months_left || 0) || 0 };
    }).filter(l => l.outstanding > 0);
  }
  if (/target.*amount|target.*year|goal/i.test(h)) {
    result.goals = rows.map(r => ({ id: generateId(), name: String(r.name || r.goal || Object.values(r)[0]),
      targetAmount: parseNum(r.target_amount || r.target || Object.values(r)[1]),
      currentAmount: parseNum(r.current_amount || r.saved || 0), monthlySIP: parseNum(r.monthly_sip || r.sip || 0),
      targetYear: parseInt(r.target_year || r.year || 2035) || 2035,
      expectedReturn: parseFloat(r.expected_return || 0.10) || 0.10, priority: (r.priority || 'medium').toLowerCase() })).filter(g => g.targetAmount > 0);
  }
  if (/expense|budget|monthly.*amount/i.test(h) && !/outstanding/i.test(h)) {
    result.budget = rows.map(r => {
      const label = r.label || r.name || r.description || r.category || Object.values(r)[0] || '';
      return { category: guessExpenseCategory(label), label: String(label), amount: parseNum(r.amount || r.monthly_amount || r.monthly || Object.values(r)[1]) };
    }).filter(b => b.amount > 0);
  }
  return result;
}

async function readFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'json') {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = e => { try { res({ type: 'json', data: JSON.parse(e.target.result) }); } catch { rej(new Error('Invalid JSON')); } }; r.readAsText(file); });
  }
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res({ type: 'csv', data: e.target.result }); r.onerror = () => rej(new Error('Read failed')); r.readAsText(file); });
  }
  if (ext === 'xlsx' || ext === 'xls') {
    if (!window.XLSX) { await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'; s.onload = res; s.onerror = () => rej(new Error('Failed to load Excel parser')); document.head.appendChild(s); }); }
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = e => { try { const wb = window.XLSX.read(e.target.result, { type: 'array' }); const sheets = {}; wb.SheetNames.forEach(n => { sheets[n] = window.XLSX.utils.sheet_to_csv(wb.Sheets[n]); }); res({ type: 'xlsx', data: sheets }); } catch { rej(new Error('Failed to parse Excel')); } }; r.readAsArrayBuffer(file); });
  }
  throw new Error('Unsupported file type. Use .csv, .xlsx, or .json');
}

const TEMPLATES = {
  assets: { fn: 'fcc_assets.csv', c: `Type,Name,Current Value,Invested Value,SIP Amount\nMutual Fund,Nifty 50 Index Fund,540000,420000,10000\nEquity,Direct Stocks,820000,650000,0\nFD,SBI FD,500000,500000,0\nGold,SGB 2029,350000,280000,0\nPPF/EPF,PPF Account,680000,580000,0\nCash,Savings Account,185000,185000,0` },
  loans: { fn: 'fcc_loans.csv', c: `Type,Name,Outstanding,EMI,Interest Rate,Remaining Months\nHome,Home Loan SBI,3650000,38500,8.5,168\nCar,Car Loan HDFC,280000,12800,9.2,24` },
  budget: { fn: 'fcc_budget.csv', c: `Label,Monthly Amount\nRent & Maintenance,8000\nGroceries & Dining,15000\nFuel & Transport,8000\nUtilities,5500\nMedical,3000\nEducation,12000\nEntertainment,6000\nShopping,8000\nInsurance,4500\nSIPs & Investments,35000\nMiscellaneous,5000` },
  goals: { fn: 'fcc_goals.csv', c: `Name,Target Amount,Current Amount,Monthly SIP,Target Year,Priority\nRetirement,50000000,2400000,15000,2046,critical\nChild Education,3000000,220000,8000,2040,high\nEmergency Fund,1200000,227000,5000,2028,critical` },
};

function dlTemplate(key) { const t = TEMPLATES[key]; if (!t) return; const b = new Blob([t.c], { type: 'text/csv' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = t.fn; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); }

export default function SmartImport({ isOpen, onClose }) {
  const dispatch = useFinanceDispatch();
  const { apiKey, hasKey } = useApiKey();
  const [step, setStep] = useState('input');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const reset = () => { setStep('input'); setFile(null); setParsedData(null); setError(null); setUseAI(false); };
  const handleClose = () => { reset(); onClose(); };

  const parseWithAI = async (rawText) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 4000,
        system: `Parse this financial data into JSON. Return ONLY valid JSON, no markdown.
Schema: { "assets": [{"type":"equity|mutualFund|realEstate|gold|fd|ppfEpf|nps|cash","name":"string","value":number,"investedValue":number,"sipAmount":number}], "liabilities": [{"type":"home|car|personal|education|credit","name":"string","outstanding":number,"emi":number,"rate":number,"remainingMonths":number,"principal":number}], "goals": [{"name":"string","targetAmount":number,"currentAmount":number,"monthlySIP":number,"targetYear":number,"expectedReturn":0.10,"priority":"critical|high|medium|low"}], "budget": [{"category":"housing|food|transport|utilities|medical|education|entertainment|shopping|insurance|emi|investment|other","label":"string","amount":number}], "income": {"monthly":{"salary":number,"rental":number},"annual":{"bonus":number}} }
Rules: All INR. Lakhs*100000, Cr*10000000. Classify intelligently. If invested value unknown, estimate 85% of current for equity/MF.`,
        messages: [{ role: 'user', content: rawText }],
      }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || 'AI parsing failed'); }
    const data = await res.json();
    const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('');
    return JSON.parse(text.replace(/```json\s*/g,'').replace(/```/g,'').trim());
  };

  const handleFile = async (f) => {
    if (!f) return; setFile(f); setError(null); setLoading(true);
    try {
      const result = await readFile(f);
      let merged = { assets: [], liabilities: [], goals: [], budget: [] };

      // AI parsing when key available and user opted in
      if (useAI && hasKey) {
        let rawText = '';
        if (result.type === 'csv') rawText = result.data;
        else if (result.type === 'xlsx') rawText = Object.entries(result.data).map(([n,c]) => `--- ${n} ---\n${c}`).join('\n');
        else if (result.type === 'json') rawText = JSON.stringify(result.data);
        const aiParsed = await parseWithAI(rawText);
        // Add IDs
        if (aiParsed.assets) aiParsed.assets = aiParsed.assets.map((a,i) => ({ ...a, id: generateId()+i }));
        if (aiParsed.liabilities) aiParsed.liabilities = aiParsed.liabilities.map((l,i) => ({ ...l, id: generateId()+i }));
        if (aiParsed.goals) aiParsed.goals = aiParsed.goals.map((g,i) => ({ ...g, id: generateId()+i }));
        setParsedData(aiParsed); setStep('preview'); setLoading(false); return;
      }

      // Standard CSV/Excel parsing
      if (result.type === 'json') { const d = result.data.data || result.data; if (d.assets) { setParsedData(d); setStep('preview'); setLoading(false); return; } }
      if (result.type === 'csv') { const { headers, rows } = parseCSV(result.data); merged = { ...merged, ...mapCSVToData(headers, rows) }; }
      if (result.type === 'xlsx') { for (const [, csv] of Object.entries(result.data)) { const { headers, rows } = parseCSV(csv); if (!rows.length) continue; const m = mapCSVToData(headers, rows); merged.assets.push(...m.assets); merged.liabilities.push(...m.liabilities); merged.goals.push(...m.goals); merged.budget.push(...m.budget); } }
      if (!merged.assets.length && !merged.liabilities.length && !merged.goals.length && !merged.budget.length) throw new Error('No recognizable data found. Try using a CSV template below.');
      setParsedData(merged); setStep('preview');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleImport = () => {
    if (!parsedData) return;
    if (parsedData.profile || parsedData.income) { dispatch({ type: ACTIONS.IMPORT_DATA, payload: parsedData }); }
    else { parsedData.assets?.forEach(a => dispatch({ type: ACTIONS.ADD_ASSET, payload: a })); parsedData.liabilities?.forEach(l => dispatch({ type: ACTIONS.ADD_LIABILITY, payload: l })); parsedData.goals?.forEach(g => dispatch({ type: ACTIONS.ADD_GOAL, payload: g })); parsedData.budget?.forEach(b => dispatch({ type: ACTIONS.ADD_BUDGET_ITEM, payload: b })); }
    setStep('done'); setTimeout(handleClose, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Data" width="max-w-2xl">
      {step === 'input' && (<div className="space-y-5">
        <div onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer?.files?.[0]); }} onDragOver={e => e.preventDefault()}
          onClick={() => document.getElementById('imp-file').click()}
          className="border-2 border-dashed border-navy-500/40 rounded-xl p-6 text-center hover:border-cyan/30 transition-colors cursor-pointer">
          <input id="imp-file" type="file" accept=".csv,.xlsx,.xls,.json,.txt" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          {loading ? <Loader2 size={24} className="mx-auto text-cyan animate-spin mb-2" /> : <Upload size={24} className="mx-auto text-dim mb-2" />}
          {file ? <><p className="text-sm font-medium text-cyan">{file.name}</p><p className="text-[10px] text-dim mt-1">{(file.size/1024).toFixed(1)} KB</p></> :
            <><p className="text-sm text-muted">Drop Excel, CSV, or JSON here</p><p className="text-[10px] text-dim mt-1">Auto-detects columns & asset types</p></>}
        </div>
        {error && <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2"><AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" /><p className="text-xs text-red-400">{error}</p></div>}

        {/* AI Toggle */}
        {hasKey && (
          <button onClick={() => setUseAI(!useAI)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all text-left ${
              useAI ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-navy-900/30 border-navy-500/20 text-muted hover:border-purple-500/20'}`}>
            <Sparkles size={14} className={useAI ? 'text-purple-400' : 'text-dim'} />
            <div>
              <p className="text-xs font-medium">{useAI ? 'AI Parsing ON' : 'Enable AI Parsing'}</p>
              <p className="text-[9px] text-dim">Handles any format — messy Excel, broker statements, anything</p>
            </div>
            <div className={`ml-auto w-8 h-4 rounded-full transition-all flex-shrink-0 ${useAI ? 'bg-purple-500/40' : 'bg-navy-600'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all mt-[1px] ${useAI ? 'ml-[17px]' : 'ml-[1px]'}`} />
            </div>
          </button>
        )}

        <div>
          <p className="section-label mb-2">Download CSV Templates</p>
          <p className="text-[11px] text-dim mb-3">Fill a template, upload it above. Columns are flexible — the app auto-detects them.</p>
          <div className="grid grid-cols-2 gap-2">
            {[{ k:'assets',l:'Assets',i:'📈',d:'Stocks, MF, FD, Gold, Property' },{ k:'loans',l:'Loans',i:'💳',d:'Home, Car, Personal loans' },{ k:'budget',l:'Budget',i:'📊',d:'Monthly expenses' },{ k:'goals',l:'Goals',i:'🎯',d:'Retirement, Education, etc.' }].map(t =>
              <button key={t.k} onClick={() => dlTemplate(t.k)} className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-navy-900/40 border border-navy-500/20 text-left hover:border-cyan/25 transition-all group">
                <span className="text-base">{t.i}</span><div><p className="text-xs font-medium text-slate-200 group-hover:text-cyan">{t.l}</p><p className="text-[9px] text-dim">{t.d}</p></div>
                <Download size={12} className="ml-auto text-dim group-hover:text-cyan flex-shrink-0 mt-0.5" />
              </button>)}
          </div>
        </div>
        <div className="px-3 py-2.5 rounded-lg bg-navy-900/30 border border-navy-500/15">
          <p className="text-[10px] text-dim uppercase tracking-wider mb-1.5">How it works</p>
          <p className="text-[11px] text-muted leading-relaxed">Auto-detects headers ("Current Value", "Market Value", "Value" all work). Smart type guessing — "Nifty 50 SIP" becomes Mutual Fund. Handles ₹, Lakhs (5.4L), Crores (1.2Cr). Multi-sheet Excel supported.</p>
        </div>
      </div>)}

      {step === 'preview' && parsedData && (<div className="space-y-4">
        <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" /><p className="text-xs text-emerald-400 font-medium">Data parsed! Review before importing.</p></div>
        {parsedData.assets?.length > 0 && <PSection title={`Assets (${parsedData.assets.length})`}>{parsedData.assets.map((a,i) => <PRow key={i} label={`${a.name} (${a.type})`} value={formatINR(a.value, true)} sub={`Invested: ${formatINR(a.investedValue, true)}${a.sipAmount ? ` | SIP: ${formatINR(a.sipAmount)}/mo` : ''}`} />)}<PRow label="Total" value={formatINR(parsedData.assets.reduce((s,a) => s+a.value, 0), true)} bold /></PSection>}
        {parsedData.liabilities?.length > 0 && <PSection title={`Loans (${parsedData.liabilities.length})`}>{parsedData.liabilities.map((l,i) => <PRow key={i} label={`${l.name}`} value={formatINR(l.outstanding, true)} sub={`EMI: ${formatINR(l.emi)}/mo @ ${l.rate}%`} />)}</PSection>}
        {parsedData.goals?.length > 0 && <PSection title={`Goals (${parsedData.goals.length})`}>{parsedData.goals.map((g,i) => <PRow key={i} label={g.name} value={formatINR(g.targetAmount, true)} sub={`Saved: ${formatINR(g.currentAmount, true)} | Year: ${g.targetYear}`} />)}</PSection>}
        {parsedData.budget?.length > 0 && <PSection title={`Budget (${parsedData.budget.length})`}>{parsedData.budget.map((b,i) => <PRow key={i} label={b.label} value={formatINR(b.amount, true)} />)}</PSection>}
        <div className="flex items-center gap-2 pt-2">
          <button onClick={reset} className="btn-ghost text-xs flex-1">Back</button>
          <button onClick={handleImport} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium text-sm hover:bg-emerald-500/30 transition-all"><CheckCircle size={14} />Import to Dashboard</button>
        </div>
      </div>)}

      {step === 'done' && <div className="py-12 text-center animate-fade-in"><CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" /><p className="text-lg font-bold text-emerald-400">Imported!</p><p className="text-xs text-dim mt-1">Dashboard updating...</p></div>}
    </Modal>
  );
}

function PSection({ title, children }) { return <div className="rounded-lg bg-navy-900/40 border border-navy-500/20 overflow-hidden"><div className="px-3 py-2 bg-navy-800/50 border-b border-navy-500/20"><p className="text-[11px] font-semibold text-slate-200 uppercase tracking-wide">{title}</p></div><div className="px-3 py-2 space-y-1">{children}</div></div>; }
function PRow({ label, value, sub, bold }) { return <div><div className="flex items-center justify-between py-0.5"><span className={`text-[11px] ${bold ? 'text-slate-200 font-medium' : 'text-muted'} truncate max-w-[60%]`}>{label}</span><span className={`text-[11px] font-mono ${bold ? 'text-cyan font-bold' : 'text-slate-200'}`}>{value}</span></div>{sub && <p className="text-[9px] text-dim -mt-0.5">{sub}</p>}</div>; }
