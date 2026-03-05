// ─── Agent Suggestions ───
// Quick-action chips that users can tap to ask common questions.
import React from 'react';
import { quickQuestions } from '@/services/aiAgent';
import {
  Clock,
  Home,
  Lightbulb,
  GraduationCap,
  Receipt,
  ShieldAlert,
  TrendingUp,
  Landmark,
} from 'lucide-react';

const questionIcons = [
  Clock,
  Home,
  Lightbulb,
  GraduationCap,
  Receipt,
  ShieldAlert,
  TrendingUp,
  Landmark,
];

export default function AgentSuggestions({ onSelect, disabled = false }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-dim uppercase tracking-widest px-1">Quick Questions</p>
      <div className="flex flex-wrap gap-1.5">
        {quickQuestions.map((q, i) => {
          const Icon = questionIcons[i % questionIcons.length];
          return (
            <button
              key={i}
              onClick={() => !disabled && onSelect(q)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                         bg-navy-700/40 border border-navy-500/30
                         text-[11px] text-muted
                         hover:bg-purple-500/10 hover:border-purple-500/25 hover:text-purple-300
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              <Icon size={11} className="flex-shrink-0 opacity-60" />
              <span className="truncate">{q}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Contextual suggestions based on current insights
 */
export function InsightSuggestions({ insights, onSelect, disabled = false }) {
  if (!insights || insights.length === 0) return null;

  const suggestions = insights.slice(0, 3).map((insight) => {
    const questions = {
      emergency: 'How can I build my emergency fund faster?',
      debt: 'What\'s the best strategy to reduce my debt?',
      tax: 'How can I optimize my tax savings this year?',
      investment: 'How should I rebalance my portfolio?',
      goals: 'Which goals should I prioritize funding?',
      budget: 'Where can I cut expenses to save more?',
      insurance: 'Do I have enough insurance coverage?',
    };
    return {
      text: questions[insight.module] || `Tell me more about: ${insight.title}`,
      type: insight.type,
    };
  });

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-dim uppercase tracking-widest px-1">Based on Your Alerts</p>
      {suggestions.map((s, i) => {
        const typeColors = {
          danger: 'hover:border-red-500/30 hover:text-red-300',
          warn: 'hover:border-amber-500/30 hover:text-amber-300',
          info: 'hover:border-cyan/30 hover:text-cyan',
          success: 'hover:border-emerald-500/30 hover:text-emerald-300',
        };
        return (
          <button
            key={i}
            onClick={() => !disabled && onSelect(s.text)}
            disabled={disabled}
            className={`w-full text-left px-3 py-2 rounded-lg
                       bg-navy-700/30 border border-navy-500/25
                       text-[11px] text-muted
                       ${typeColors[s.type] || ''}
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200`}
          >
            {s.text}
          </button>
        );
      })}
    </div>
  );
}
