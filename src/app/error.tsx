"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, RotateCcw, Home, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log exception to client console for telemetry
    console.error("[Route Error Boundary caught]:", error);
  }, [error]);

  const handleCopyDiagnostics = () => {
    const info = `Mine AI Error Diagnostic
Timestamp: ${new Date().toISOString()}
Message: ${error.message}
Digest: ${error.digest || "N/A"}
Stack: ${error.stack || "N/A"}`;
    navigator.clipboard.writeText(info);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500/30">
      <div className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-zinc-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Application Error
            </h1>
            <p className="text-xs text-zinc-400">
              An unexpected exception was caught by the route boundary.
            </p>
          </div>
        </div>

        {/* User-friendly message */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed mb-5">
          <p className="font-medium text-zinc-200 mb-1">What happened?</p>
          <p className="break-words">
            {error.message || "An unexpected error occurred while rendering this page."}
          </p>
          {error.digest && (
            <p className="mt-2 text-[11px] font-mono text-zinc-500">
              Error Digest: <span className="text-zinc-400">{error.digest}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-purple-500/20 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-medium text-xs sm:text-sm transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
        </div>

        {/* Technical Diagnostics Accordion */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1"
            >
              <span>{showDetails ? "Hide technical diagnostics" : "Show technical diagnostics"}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <button
                type="button"
                onClick={handleCopyDiagnostics}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy Stack"}</span>
              </button>
            )}
          </div>

          {showDetails && (
            <pre className="mt-2 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[10px] font-mono text-zinc-400 overflow-x-auto max-h-48 leading-relaxed scrollbar-thin">
              {error.stack || error.message || "No stack trace available"}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
