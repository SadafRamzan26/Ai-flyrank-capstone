"use client";

import React, { useState } from "react";
import { AlertCircle, RotateCcw, X, WifiOff } from "lucide-react";

interface InlineErrorBannerProps {
  error: Error | string;
  onRetry: () => void | Promise<void>;
  onDismiss?: () => void;
  isRetrying?: boolean;
}

export default function InlineErrorBanner({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
}: InlineErrorBannerProps) {
  const [retryingLocal, setRetryingLocal] = useState(false);

  const rawMessage = typeof error === "string" ? error : error?.message || "An unexpected network or API error occurred.";
  const isNetworkIssue = rawMessage.toLowerCase().includes("network") || rawMessage.toLowerCase().includes("fetch");
  const isRateLimit = rawMessage.includes("429") || rawMessage.toLowerCase().includes("rate limit");

  const displayTitle = isRateLimit
    ? "Upstream Rate Limit Reached"
    : isNetworkIssue
    ? "Network Connection Disrupted"
    : "Generation Encountered An Error";

  const handleRetryClick = async () => {
    try {
      setRetryingLocal(true);
      await onRetry();
    } finally {
      setRetryingLocal(false);
    }
  };

  const busy = isRetrying || retryingLocal;

  return (
    <div
      role="alert"
      className="w-full my-3 p-3.5 sm:p-4 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-zinc-950/90 to-zinc-900/90 shadow-xl backdrop-blur-md animate-fade-in text-zinc-100"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mt-0.5 shadow-sm">
            {isNetworkIssue ? <WifiOff className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>

          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-semibold text-red-200">
              {displayTitle}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed break-words font-mono text-[11px]">
              {rawMessage}
            </p>
            <p className="text-[11px] text-zinc-400">
              Click &ldquo;Retry&rdquo; to re-attempt this message, or adjust your prompt.
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Dismiss error notice"
            aria-label="Dismiss error notice"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-red-500/20 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleRetryClick}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-md shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
          <span>{busy ? "Retrying Message…" : "Retry Message"}</span>
        </button>
      </div>
    </div>
  );
}
