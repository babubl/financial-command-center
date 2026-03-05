// ─── Agent Panel ───
// Sliding chat sidebar — works immediately, no API key needed.
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFinance, useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { sendAgentMessage } from '@/services/aiAgent';
import AgentMessage, { TypingIndicator } from './AgentMessage';
import AgentSuggestions, { InsightSuggestions } from './AgentSuggestions';
import {
  X,
  Send,
  Trash2,
  Bot,
  Sparkles,
} from 'lucide-react';

export default function AgentPanel() {
  const data = useFinance();
  const dispatch = useFinanceDispatch();
  const { insights, fullData } = useFinanceStore();
  const isOpen = data._ui?.agentOpen;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    dispatch({ type: ACTIONS.TOGGLE_AGENT });
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSend = useCallback(async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput('');

    const userMsg = { role: 'user', content: messageText, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendAgentMessage(messageText, fullData, history);

      const assistantMsg = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `Something went wrong. Try asking again or rephrase your question.`,
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, fullData]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionSelect = (question) => {
    handleSend(question);
  };

  if (!isOpen) return null;

  const hasMessages = messages.length > 0;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 z-50 animate-slide-in-right flex flex-col bg-navy-800/95 backdrop-blur-xl border-l border-navy-500/50 shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-500/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <Bot size={16} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              Financial Advisor
              <Sparkles size={12} className="text-purple-400" />
            </h3>
            <p className="text-[10px] text-dim">Knows your complete financial picture</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasMessages && (
            <button
              onClick={handleClearChat}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Clear chat"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-dim hover:text-slate-100 hover:bg-navy-700 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!hasMessages ? (
          <div className="h-full flex flex-col justify-between">
            <div className="text-center pt-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Bot size={24} className="text-purple-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-1">
                Your Financial Advisor
              </h4>
              <p className="text-xs text-muted max-w-[260px] mx-auto leading-relaxed">
                I can see your complete financial picture. Ask me anything — retirement planning, loan prepayment, tax optimization, or where to invest next.
              </p>
            </div>

            <div className="space-y-4 pb-2">
              <InsightSuggestions
                insights={insights}
                onSelect={handleSuggestionSelect}
                disabled={isLoading}
              />
              <AgentSuggestions
                onSelect={handleSuggestionSelect}
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <AgentMessage key={`${msg.timestamp}-${i}`} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick follow-ups */}
      {hasMessages && !isLoading && (
        <div className="px-4 py-2 border-t border-navy-500/20">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['What should I do next?', 'Top 3 risks?', 'How to save more?', 'Action plan'].map((q, i) => (
              <button key={i} onClick={() => handleSuggestionSelect(q)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-navy-700/40 border border-navy-500/25 text-[10px] text-muted hover:text-purple-300 hover:border-purple-500/25 transition-colors whitespace-nowrap">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-navy-500/40 bg-navy-900/30">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            rows={1}
            className="input-field resize-none pr-10 min-h-[38px] max-h-[100px] text-[13px] flex-1"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30'
                : 'bg-navy-700/50 border border-navy-500/30 text-dim cursor-not-allowed'
            }`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
