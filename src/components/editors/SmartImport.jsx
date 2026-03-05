// ─── Smart Import ───
// AI-powered data import that accepts any format and maps to dashboard schema.
// Supports: Excel (.xlsx/.csv), copy-paste text, any messy format.

import React, { useState, useCallback } from 'react';
import Modal, { ModalFooter } from '@/components/shared/Modal';
import { useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { generateId, formatINR } from '@/utils/formatters';
import {
  Upload,
  FileSpreadsheet,
  ClipboardPaste,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  X,
} from 'lucide-react';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const PARSE_PROMPT = `You are a financial data parser for an Indian personal finance dashboard.

The user will provide raw financial data in ANY format — Excel columns, CSV, messy text, bank statements, broker reports, etc.

Your job: Parse it into a structured JSON that matches this EXACT schema. Return ONLY valid JSON, no markdown, no explanation, no backticks.

SCHEMA:
{
  "profile": {
    "name": "string",
    "age": number,
    "retirementAge": number,
    "taxRegime": "new" | "old",
    "city": "string",
    "dependents": number
  },
  "assets": [
    {
      "type": "equity" | "mutualFund" | "realEstate" | "gold" | "fd" | "ppfEpf" | "nps" | "cash",
      "name": "string (descriptive)",
      "value": number (current value in INR),
      "investedValue": number (cost basis in INR),
      "sipAmount": number (monthly SIP, only for MF/NPS, 0 if none)
    }
  ],
  "liabilities": [
    {
      "type": "home" | "car" | "personal" | "education" | "gold" | "credit",
      "name": "string",
      "principal": number (original loan amount),
      "outstanding": number (current outstanding),
      "emi": number (monthly EMI),
      "rate": number (annual interest rate as percentage like 8.5),
      "tenureMonths": number (total tenure),
      "remainingMonths": number
    }
  ],
  "income": {
    "monthly": {
      "salary": number,
      "rental": number,
      "interest": number,
      "dividends": number,
      "freelance": number
    },
    "annual": {
      "bonus": number,
      "otherIncome": number
    }
  },
  "goals": [
    {
      "name": "string",
      "targetAmount": number,
      "currentAmount": number,
      "monthlySIP": number,
      "targetYear": number,
      "expectedReturn": number (decimal like 0.12 for 12%),
      "priority": "critical" | "high" | "medium" | "low"
    }
  ],
  "budget": {
    "expenses": [
      { "category": "housing" | "food" | "transport" | "utilities" | "medical" | "education" | "entertainment" | "shopping" | "insurance" | "emi" | "investment" | "other", "amount": number, "label": "string" }
    ]
  },
  "insurance": {
    "term": { "cover": number, "premium": number, "provider": "string" },
    "health": { "cover": number, "premium": number, "provider": "string" }
  },
  "taxDeductions": {
    "section80C": { "epf": 0, "ppf": 0, "elss": 0, "liPremium": 0, "tuitionFees": 0, "hlPrincipal": 0 },
    "section80D": { "selfFamily": 0, "parents": 0 },
    "section80CCD1B": 0,
    "section24b": 0
  }
}

RULES:
- All amounts in INR (Indian Rupees). Remove commas, ₹ symbols.
- If "Lakhs" or "L" appears, multiply by 100000. If "Cr" or "Crore", multiply by 10000000.
- Classify assets intelligently: stocks/shares → equity, MF/SIP/index fund → mutualFund, property/flat/house → realEstate, SGB/gold → gold, FD/fixed deposit → fd, PPF/EPF/PF → ppfEpf, NPS → nps, savings/current account → cash.
- Classify loans: home/housing → home, car/vehicle → car, personal → personal, education/student → education, credit card → credit.
- If data for a section is not provided, use empty arrays or zeros — do NOT omit the key.
- If invested value is not given, estimate it as 85% of current value for equity/MF, 100% for FD/PPF, 70% for real estate.
- Infer what you can. If someone says "salary 1.85L/month", that means 185000.
- For partial data (e.g., only investments), fill other sections with zeros/empty.
- Return ONLY the JSON object. No other text.`;

/**
 * Read file as text (CSV/TSV) or use SheetJS for Excel
 */
async function readFileContent(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  if (ext === 'xlsx' || ext === 'xls') {
    // Dynamic import SheetJS from CDN
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Excel parser'));
        document.head.appendChild(script);
      });
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = window.XLSX.read(e.target.result, { type: 'array' });
          let allText = '';
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const csv = window.XLSX.utils.sheet_to_csv(sheet);
            allText += `\n--- Sheet: ${sheetName} ---\n${csv}\n`;
          }
          resolve(allText);
        } catch (err) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

/**
 * Call Claude API to parse raw data into structured format
 */
async function parseWithAI(rawData, apiKey) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } : {}),
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: PARSE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Parse this financial data into the required JSON schema:\n\n${rawData}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content
    ?.filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  // Clean and parse JSON
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Add IDs to parsed data
 */
function addIds(parsed) {
  if (parsed.assets) {
    parsed.assets = parsed.assets.map((a, i) => ({ ...a, id: a.id || generateId() + i }));
  }
  if (parsed.liabilities) {
    parsed.liabilities = parsed.liabilities.map((l, i) => ({ ...l, id: l.id || generateId() + i }));
  }
  if (parsed.goals) {
    parsed.goals = parsed.goals.map((g, i) => ({ ...g, id: g.id || generateId() + i }));
  }
  return parsed;
}

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════

export default function SmartImport({ isOpen, onClose }) {
  const dispatch = useFinanceDispatch();

  const [step, setStep] = useState('input'); // input | parsing | preview | done
  const [inputMode, setInputMode] = useState('file'); // file | paste
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [mergeMode, setMergeMode] = useState('replace'); // replace | merge

  const reset = () => {
    setStep('input');
    setRawText('');
    setFile(null);
    setParsedData(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleParse = async () => {
    if (!apiKey) {
      setError('API key is required for AI parsing');
      return;
    }

    setStep('parsing');
    setError(null);

    try {
      let dataText = rawText;

      if (inputMode === 'file' && file) {
        dataText = await readFileContent(file);
      }

      if (!dataText.trim()) {
        throw new Error('No data to parse. Upload a file or paste your data.');
      }

      const parsed = await parseWithAI(dataText, apiKey);
      const withIds = addIds(parsed);
      setParsedData(withIds);
      setStep('preview');
    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message || 'Failed to parse data');
      setStep('input');
    }
  };

  const handleImport = () => {
    if (!parsedData) return;

    dispatch({
      type: ACTIONS.IMPORT_DATA,
      payload: parsedData,
    });

    setStep('done');
    setTimeout(() => handleClose(), 1500);
  };

  // ─── Render ───
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Smart Import" width="max-w-2xl">
      {/* Step: Input */}
      {step === 'input' && (
        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className="input-label">Anthropic API Key (for AI parsing)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="input-field text-xs"
            />
            <p className="text-[9px] text-dim mt-1">Used once for parsing, not stored.</p>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                inputMode === 'file'
                  ? 'border-cyan/40 bg-cyan/10 text-cyan'
                  : 'border-navy-500/30 bg-navy-900/40 text-muted hover:border-navy-500/50'
              }`}
            >
              <FileSpreadsheet size={14} />
              Upload File
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                inputMode === 'paste'
                  ? 'border-cyan/40 bg-cyan/10 text-cyan'
                  : 'border-navy-500/30 bg-navy-900/40 text-muted hover:border-navy-500/50'
              }`}
            >
              <ClipboardPaste size={14} />
              Paste Data
            </button>
          </div>

          {/* File Upload */}
          {inputMode === 'file' && (
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-navy-500/40 rounded-xl p-8 text-center hover:border-cyan/30 transition-colors cursor-pointer"
              onClick={() => document.getElementById('smart-import-file').click()}
            >
              <input
                id="smart-import-file"
                type="file"
                accept=".xlsx,.xls,.csv,.tsv,.txt"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Upload size={24} className="mx-auto text-dim mb-2" />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-cyan">{file.name}</p>
                  <p className="text-[10px] text-dim mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted">Drop your Excel, CSV, or text file here</p>
                  <p className="text-[10px] text-dim mt-1">Supports .xlsx, .xls, .csv, .tsv, .txt</p>
                </div>
              )}
            </div>
          )}

          {/* Paste Area */}
          {inputMode === 'paste' && (
            <div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Paste your financial data in ANY format. Examples:\n\nMutual Funds:\nNifty 50 Index - Invested 4.2L, Current 5.4L, SIP 10K/mo\nParag Parikh Flexi - Invested 3L, Current 3.8L, SIP 8K\n\nOr a table:\nName, Type, Invested, Current\nHDFC FD, FD, 500000, 500000\nSBI Stocks, Equity, 650000, 820000\n\nOr even messy text:\nI have a home loan of 36.5L at 8.5% with SBI, EMI 38500\nSalary is 1.85L/month, bonus 3.5L/year\nPPF balance 6.8L, EPF 9.2L`}
                className="input-field text-xs min-h-[200px] resize-y leading-relaxed"
              />
              <p className="text-[9px] text-dim mt-1">
                AI will understand any format — tables, lists, sentences, broker statements, anything.
              </p>
            </div>
          )}

          {/* Merge mode */}
          <div>
            <label className="input-label">Import Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMergeMode('replace')}
                className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-medium border transition-all ${
                  mergeMode === 'replace'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-navy-500/30 bg-navy-900/40 text-muted'
                }`}
              >
                Replace All Data
              </button>
              <button
                onClick={() => setMergeMode('merge')}
                className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-medium border transition-all ${
                  mergeMode === 'merge'
                    ? 'border-cyan/40 bg-cyan/10 text-cyan'
                    : 'border-navy-500/30 bg-navy-900/40 text-muted'
                }`}
              >
                Merge with Existing
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Parse Button */}
          <button
            onClick={handleParse}
            disabled={!apiKey || (inputMode === 'file' && !file) || (inputMode === 'paste' && !rawText.trim())}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium text-sm hover:bg-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            Parse with AI
          </button>
        </div>
      )}

      {/* Step: Parsing */}
      {step === 'parsing' && (
        <div className="py-12 text-center">
          <Loader2 size={32} className="mx-auto text-purple-400 animate-spin mb-4" />
          <p className="text-sm text-slate-100 font-medium">AI is reading your data...</p>
          <p className="text-xs text-dim mt-1">Classifying assets, mapping fields, calculating values</p>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && parsedData && (
        <div className="space-y-4">
          <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400" />
            <p className="text-xs text-emerald-400 font-medium">Data parsed successfully! Review before importing.</p>
          </div>

          {/* Profile */}
          {parsedData.profile?.name && (
            <PreviewSection title="Profile">
              <PreviewRow label="Name" value={parsedData.profile.name} />
              {parsedData.profile.age > 0 && <PreviewRow label="Age" value={parsedData.profile.age} />}
              {parsedData.profile.city && <PreviewRow label="City" value={parsedData.profile.city} />}
            </PreviewSection>
          )}

          {/* Assets */}
          {parsedData.assets?.length > 0 && (
            <PreviewSection title={`Assets (${parsedData.assets.length} items)`}>
              {parsedData.assets.map((a, i) => (
                <PreviewRow
                  key={i}
                  label={`${a.name} (${a.type})`}
                  value={formatINR(a.value, true)}
                  sub={`Invested: ${formatINR(a.investedValue, true)}${a.sipAmount ? ` | SIP: ${formatINR(a.sipAmount)}/mo` : ''}`}
                />
              ))}
              <PreviewRow
                label="Total Assets"
                value={formatINR(parsedData.assets.reduce((s, a) => s + (a.value || 0), 0), true)}
                bold
              />
            </PreviewSection>
          )}

          {/* Liabilities */}
          {parsedData.liabilities?.length > 0 && (
            <PreviewSection title={`Loans (${parsedData.liabilities.length})`}>
              {parsedData.liabilities.map((l, i) => (
                <PreviewRow
                  key={i}
                  label={`${l.name} (${l.type})`}
                  value={formatINR(l.outstanding, true)}
                  sub={`EMI: ${formatINR(l.emi)}/mo @ ${l.rate}%`}
                />
              ))}
            </PreviewSection>
          )}

          {/* Income */}
          {parsedData.income?.monthly?.salary > 0 && (
            <PreviewSection title="Income">
              <PreviewRow label="Monthly Salary" value={formatINR(parsedData.income.monthly.salary)} />
              {parsedData.income.monthly.rental > 0 && <PreviewRow label="Rental" value={formatINR(parsedData.income.monthly.rental)} />}
              {parsedData.income.annual?.bonus > 0 && <PreviewRow label="Annual Bonus" value={formatINR(parsedData.income.annual.bonus)} />}
            </PreviewSection>
          )}

          {/* Goals */}
          {parsedData.goals?.length > 0 && (
            <PreviewSection title={`Goals (${parsedData.goals.length})`}>
              {parsedData.goals.map((g, i) => (
                <PreviewRow
                  key={i}
                  label={g.name}
                  value={formatINR(g.targetAmount, true)}
                  sub={`Saved: ${formatINR(g.currentAmount, true)} | Target: ${g.targetYear}`}
                />
              ))}
            </PreviewSection>
          )}

          {/* Import Mode Warning */}
          {mergeMode === 'replace' && (
            <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
              <p className="text-[11px] text-amber-400">This will replace ALL existing data in the dashboard.</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button onClick={reset} className="btn-ghost text-xs flex-1">
              Back to Edit
            </button>
            <button
              onClick={handleImport}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium text-sm hover:bg-emerald-500/30 transition-all"
            >
              <CheckCircle size={14} />
              Import Data
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div className="py-12 text-center animate-fade-in">
          <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
          <p className="text-lg font-bold text-emerald-400">Data Imported!</p>
          <p className="text-xs text-dim mt-1">Dashboard is updating...</p>
        </div>
      )}
    </Modal>
  );
}

// ─── Preview Helpers ───
function PreviewSection({ title, children }) {
  return (
    <div className="rounded-lg bg-navy-900/40 border border-navy-500/20 overflow-hidden">
      <div className="px-3 py-2 bg-navy-800/50 border-b border-navy-500/20">
        <p className="text-[11px] font-semibold text-slate-200 uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-3 py-2 space-y-1">
        {children}
      </div>
    </div>
  );
}

function PreviewRow({ label, value, sub, bold }) {
  return (
    <div>
      <div className="flex items-center justify-between py-0.5">
        <span className={`text-[11px] ${bold ? 'text-slate-200 font-medium' : 'text-muted'} truncate max-w-[60%]`}>{label}</span>
        <span className={`text-[11px] font-mono ${bold ? 'text-cyan font-bold' : 'text-slate-200'}`}>{value}</span>
      </div>
      {sub && <p className="text-[9px] text-dim -mt-0.5">{sub}</p>}
    </div>
  );
}
