// ─── API Key Banner ───
// Compact, non-intrusive banner at top of dashboard.
// Shows only when no API key is set. Dismissible.

import React, { useState } from 'react';
import { useApiKey } from '@/store/ApiKeyContext';
import { Sparkles, X, Check, ExternalLink } from 'lucide-react';

export default function ApiKeyBanner() {
  const { apiKey, setApiKey, hasKey } = useApiKey();
  const [input, setInput] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (hasKey || dismissed) return null;

  return (
    <div className="mx-5 mt-4 px-4 py-3 rounded-xl bg-purple-500/8 border border-purple-500/20 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-purple-300">
              Enable AI Features
            </p>
            <p className="text-[11px] text-purple-400/60 mt-0.5 leading-relaxed">
              Add your Anthropic API key to unlock AI-powered chat advisor and smart Excel import.
              {' '}
              <button onClick={() => setExpanded(!expanded)} className="text-purple-400 underline underline-offset-2">
                {expanded ? 'Hide' : 'How to get a key'}
              </button>
            </p>

            {expanded && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-navy-900/40 border border-navy-500/20 text-[11px] text-muted leading-relaxed">
                <p>1. Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-cyan inline-flex items-center gap-0.5">console.anthropic.com <ExternalLink size={9} /></a></p>
                <p>2. Sign up or sign in</p>
                <p>3. Settings → API Keys → Create Key</p>
                <p>4. Copy the key (starts with <span className="font-mono text-slate-300">sk-ant-...</span>)</p>
                <p className="mt-1 text-[10px] text-dim">New accounts get free credits. Key is stored only in your browser session — cleared when you close the tab.</p>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="input-field text-xs py-1.5 flex-1 max-w-[280px]"
                onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) setApiKey(input.trim()); }}
              />
              <button
                onClick={() => { if (input.trim()) setApiKey(input.trim()); }}
                disabled={!input.trim()}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium hover:bg-purple-500/30 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <Check size={12} /> Save
              </button>
            </div>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-dim hover:text-muted transition-colors flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Small indicator for components that need API key
 * Shows inline "needs API key" or "AI ready" status
 */
export function AiStatus({ className = '' }) {
  const { hasKey } = useApiKey();
  if (hasKey) {
    return (
      <span className={`inline-flex items-center gap-1 text-[9px] text-emerald-400 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> AI Ready
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] text-dim ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-dim" /> No API Key
    </span>
  );
}
