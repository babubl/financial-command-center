// ─── Agent Message ───
// Renders individual chat messages with basic markdown support.
import React, { useMemo } from 'react';
import { Bot, User } from 'lucide-react';

/**
 * Parse basic markdown: **bold**, `code`, bullet points, newlines
 */
function parseMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      elements.push(<br key={`br-${lineIdx}`} />);
    }

    // Bullet points
    const bulletMatch = line.match(/^[-•]\s+(.*)$/);
    if (bulletMatch) {
      elements.push(
        <span key={`line-${lineIdx}`} className="flex items-start gap-1.5 ml-1">
          <span className="text-cyan/60 mt-0.5 text-[8px]">●</span>
          <span>{parseInline(bulletMatch[1], lineIdx)}</span>
        </span>
      );
      return;
    }

    // Numbered items
    const numMatch = line.match(/^(\d+)[.)]\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <span key={`line-${lineIdx}`} className="flex items-start gap-1.5 ml-1">
          <span className="text-cyan/60 text-[10px] font-mono min-w-[14px]">{numMatch[1]}.</span>
          <span>{parseInline(numMatch[2], lineIdx)}</span>
        </span>
      );
      return;
    }

    elements.push(
      <span key={`line-${lineIdx}`}>{parseInline(line, lineIdx)}</span>
    );
  });

  return elements;
}

function parseInline(text, keyPrefix = 0) {
  const parts = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code `code`
    const codeMatch = remaining.match(/`(.+?)`/);

    let firstMatch = null;
    let matchType = null;

    if (boldMatch && (!codeMatch || boldMatch.index <= codeMatch.index)) {
      firstMatch = boldMatch;
      matchType = 'bold';
    } else if (codeMatch) {
      firstMatch = codeMatch;
      matchType = 'code';
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    // Text before match
    if (firstMatch.index > 0) {
      parts.push(remaining.slice(0, firstMatch.index));
    }

    if (matchType === 'bold') {
      parts.push(
        <strong key={`${keyPrefix}-b-${idx}`} className="font-semibold text-slate-100">
          {firstMatch[1]}
        </strong>
      );
    } else if (matchType === 'code') {
      parts.push(
        <code
          key={`${keyPrefix}-c-${idx}`}
          className="px-1 py-0.5 rounded bg-navy-600/80 text-cyan text-[11px] font-mono"
        >
          {firstMatch[1]}
        </code>
      );
    }

    remaining = remaining.slice(firstMatch.index + firstMatch[0].length);
    idx++;
  }

  return parts;
}

export default function AgentMessage({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  const content = useMemo(() => {
    if (isUser) return message.content;
    return parseMarkdown(message.content);
  }, [message.content, isUser]);

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-navy-600 border border-navy-500'
            : 'bg-purple-500/15 border border-purple-500/25'
        }`}
      >
        {isUser ? (
          <User size={13} className="text-muted" />
        ) : (
          <Bot size={13} className="text-purple-400" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
          isUser
            ? 'bg-cyan/10 border border-cyan/20 text-slate-100 rounded-tr-sm'
            : isError
            ? 'bg-red-500/8 border border-red-500/20 text-red-300 rounded-tl-sm'
            : 'bg-navy-700/60 border border-navy-500/40 text-slate-300 rounded-tl-sm'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

/**
 * Typing indicator
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
        <Bot size={13} className="text-purple-400" />
      </div>
      <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-navy-700/60 border border-navy-500/40">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
