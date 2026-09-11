"use client";

import React from "react";
import { Bot, Sparkles } from "lucide-react";

export default function MessageSkeleton() {
  return (
    <div
      aria-label="Loading AI response"
      className="flex gap-2.5 sm:gap-3.5 justify-start items-start animate-fade-in w-full transition-all duration-200"
    >
      {/* ── Assistant Avatar ────────────────────────────────────────── */}
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 shadow-sm mt-0.5">
        <Bot className="w-4 h-4 animate-pulse" />
      </div>

      {/* ── Message Bubble Geometry Match (Zero CLS) ───────────────── */}
      <div className="relative w-full max-w-[88%] sm:max-w-[82%] px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-2xl rounded-tl-sm bg-zinc-900/90 border border-zinc-800/90 shadow-sm space-y-3">
        {/* Shimmering Status Badge */}
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-[11px] font-medium text-purple-300/90 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Reasoning with Mine AI…
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>

        {/* Paragraph 1 Simulation */}
        <div className="space-y-2">
          <div className="h-3.5 w-11/12 rounded-md skeleton-shimmer" />
          <div className="h-3.5 w-full rounded-md skeleton-shimmer" />
          <div className="h-3.5 w-4/5 rounded-md skeleton-shimmer" />
        </div>

        {/* Paragraph 2 Simulation (Compact) */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-9/12 rounded-md skeleton-shimmer" />
          <div className="h-3.5 w-1/2 rounded-md skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
