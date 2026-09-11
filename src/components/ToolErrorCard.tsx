"use client";

import React, { useState } from "react";
import { AlertTriangle, RotateCcw, Copy, Check, Terminal, HelpCircle } from "lucide-react";

interface ToolErrorCardProps {
  toolName: string;
  errorText?: string;
  input?: Record<string, any>;
  onRetry?: () => void;
}

export default function ToolErrorCard({
  toolName,
  errorText,
  input,
  onRetry,
}: ToolErrorCardProps) {
  const [copied, setCopied] = useState(false);

  const fallbackMessage =
    "An unexpected error occurred while executing the server tool. The upstream service may be temporarily unavailable.";
  const displayError = errorText || fallbackMessage;

  const handleCopyDiagnostic = () => {
    const diagnostic = JSON.stringify(
      {
        tool: toolName,
        timestamp: new Date().toISOString(),
        error: displayError,
        parameters: input || null,
      },
      null,
      2
    );
    navigator.clipboard.writeText(diagnostic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full my-3 rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/40 via-zinc-950/90 to-zinc-900/90 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-200 text-zinc-100">
      {/* ── Error Header ──────────────────────────────────────────── */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-red-500/20 flex flex-wrap items-center justify-between gap-2.5 bg-red-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-red-200">
                Tool Execution Failed
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/15 text-red-300 border border-red-500/30">
                {toolName}
              </span>
            </div>
            <p className="text-[11px] text-red-300/70 mt-0.5">
              Server-side tool lifecycle reached state: <span className="font-mono">output-error</span>
            </p>
          </div>
        </div>

        {/* Copy Diagnostic Button */}
        <button
          type="button"
          onClick={handleCopyDiagnostic}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800 transition-colors"
          title="Copy diagnostic error information"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {/* ── Error Details ─────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Error Explanation */}
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-red-400/90 block mb-1">
            Failure Reason
          </span>
          <p className="text-xs text-zinc-200 leading-relaxed font-mono break-words">
            {displayError}
          </p>
        </div>

        {/* Input Parameters Recap */}
        {input && Object.keys(input).length > 0 && (
          <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              Submitted Parameters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(input).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900/70 border border-zinc-800/50 text-[11px]"
                >
                  <span className="text-zinc-400 font-mono">{key}:</span>
                  <span className="text-zinc-200 font-medium truncate max-w-[140px]">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Recovery Advice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
          <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-300 block mb-0.5">How to resolve:</span>
            <span>
              Verify the company name or parameters provided and resubmit. If you triggered this error for testing, you can remove the error keyword from the prompt.
            </span>
          </div>
        </div>

        {onRetry && (
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Retry Tool Execution</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
