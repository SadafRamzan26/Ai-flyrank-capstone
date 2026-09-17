"use client";

import React from "react";
import {
  Sparkles,
  Bot,
  Calculator,
  Code2,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

interface ChatEmptyStateProps {
  onSelectSuggestion: (promptText: string) => void | Promise<void>;
}

interface SuggestionItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  category: string;
  badgeColor: string;
  prompt: string;
}

const SUGGESTIONS: SuggestionItem[] = [
  {
    icon: Calculator,
    title: "Score Enterprise Lead",
    category: "Generative UI Tool",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    prompt:
      "Score lead for Tesla: enterprise size, $100,000 monthly budget, ai_automation goal, intent score 9",
  },
  {
    icon: TrendingUp,
    title: "Qualify Growth Lead",
    category: "B2B Analytics",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    prompt:
      "Calculate lead score for Stripe: mid-market scale, $35k budget, performance_marketing, intent 8",
  },
  {
    icon: Code2,
    title: "Compare Architectures",
    category: "Engineering",
    badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    prompt:
      "Compare Next.js Server Actions vs Route Handlers with real-time streaming",
  },
  {
    icon: AlertTriangle,
    title: "Test Error Lifecycle",
    category: "Edge-Case Testing",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    prompt:
      "Test error lifecycle: Calculate lead score for ErrorCorp with fail trigger",
  },
];

export default function ChatEmptyState({ onSelectSuggestion }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[62vh] sm:min-h-[65vh] text-center px-4 py-8 animate-fade-in select-none">
      {/* ── Welcoming Brand Hero ────────────────────────────────────── */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-xl shadow-purple-500/20">
          <div className="w-full h-full rounded-[22px] bg-zinc-950 flex items-center justify-center">
            <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
          </div>
        </div>
        <span className="absolute -bottom-2 -right-2 flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white shadow-lg border-2 border-zinc-950">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-3 shadow-sm">
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>Mine AI • Next-Gen Streaming Engine</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        How can I help you today?
      </h2>

      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
        Ask technical engineering questions, analyze code, or evaluate sales opportunities with
        real-time server-side tools and structured Generative UI.
      </p>

      {/* ── Clickable Suggestions Grid ───────────────────────────────── */}
      <div className="w-full max-w-xl text-left">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-3 px-1">
          Try asking about:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUGGESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion(item.prompt)}
                className="group relative flex flex-col p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-purple-500/40 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-purple-500/5 active:scale-[0.98] text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${item.badgeColor}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.category}</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors mb-1">
                  {item.title}
                </h3>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  &ldquo;{item.prompt}&rdquo;
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
