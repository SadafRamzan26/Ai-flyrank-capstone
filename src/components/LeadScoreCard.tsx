"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  DollarSign,
  Zap,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import type { LeadScoreResult, CalculateLeadScoreInput } from "@/lib/ai/tools/lead-score";

interface LeadScoreCardProps {
  data: LeadScoreResult;
  input?: CalculateLeadScoreInput;
}

export default function LeadScoreCard({ data, input }: LeadScoreCardProps) {
  const [copied, setCopied] = useState(false);

  const isHot = data.overallScore >= 80;
  const isWarm = data.overallScore >= 60 && data.overallScore < 80;

  const tierBadgeColor = isHot
    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
    : isWarm
    ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
    : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";

  const scoreRingColor = isHot
    ? "from-emerald-400 to-teal-500"
    : isWarm
    ? "from-amber-400 to-orange-500"
    : "from-indigo-400 to-purple-500";

  const scoreTextColor = isHot
    ? "text-emerald-300"
    : isWarm
    ? "text-amber-300"
    : "text-indigo-300";

  const handleCopy = () => {
    const summary = `Lead Score Report for ${data.companyName}
Overall Score: ${data.overallScore}/100 (${data.tier})
Confidence: ${(data.confidence * 100).toFixed(0)}%
Estimated Annual Value: $${data.metrics.estimatedAnnualValueUsd.toLocaleString()}
Recommended Action: ${data.recommendation.action}
Playbook: ${data.recommendation.suggestedPlaybook}
Response SLA: ${data.recommendation.priorityResponseTime}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full my-3 rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/95 via-zinc-950/90 to-zinc-900/80 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-200 hover:border-zinc-700/80 text-zinc-100">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/30">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">
                {data.companyName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${tierBadgeColor} shadow-sm`}
              >
                <Award className="w-3 h-3" />
                {data.tier}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>Confidence: {(data.confidence * 100).toFixed(0)}%</span>
              <span>•</span>
              <span className="capitalize">{input?.companySize || "B2B"}</span>
              <span>•</span>
              <span className="capitalize">{input?.primaryGoal?.replace(/_/g, " ") || "Growth"}</span>
            </p>
          </div>
        </div>

        {/* Copy Report button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 hover:text-white border border-zinc-700/50 transition-all active:scale-95 shadow-sm"
          title="Copy structured lead summary to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Report</span>
            </>
          )}
        </button>
      </div>

      {/* ── Key Score & Metric Highlights ─────────────────────────── */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Score Radial Badge (Left Col) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
          
          <div className="relative flex items-center justify-center mb-2">
            <div
              className={`w-20 h-20 rounded-full p-1 bg-gradient-to-tr ${scoreRingColor} shadow-lg shadow-purple-500/10 flex items-center justify-center`}
            >
              <div className="w-full h-full rounded-full bg-zinc-950 flex flex-col items-center justify-center">
                <span className={`text-2xl sm:text-3xl font-black ${scoreTextColor} tracking-tight leading-none`}>
                  {data.overallScore}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mt-0.5">
                  / 100
                </span>
              </div>
            </div>
          </div>

          <span className="text-xs font-medium text-zinc-200 mt-1">
            Overall Qualification Score
          </span>
          <span className="text-[11px] text-zinc-400 mt-0.5">
            {isHot ? "Immediate Conversion Target" : isWarm ? "High Engagement Potential" : "Long-term Nurturing Pipeline"}
          </span>
        </div>

        {/* Quantitative Metric Breakdown Bars (Right Col) */}
        <div className="md:col-span-8 space-y-3 p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
          {/* Metric 1: Budget Fit */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Budget Fit Score
              </span>
              <span className="font-semibold text-zinc-200">
                {data.metrics.budgetFit}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${data.metrics.budgetFit}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Market Scale Fit */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Market & Organization Fit
              </span>
              <span className="font-semibold text-zinc-200">
                {data.metrics.marketFit}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-500"
                style={{ width: `${data.metrics.marketFit}%` }}
              />
            </div>
          </div>

          {/* Metric 3: Intent Velocity */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Buyer Intent Velocity
              </span>
              <span className="font-semibold text-zinc-200">
                {data.metrics.intentVelocity}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                style={{ width: `${data.metrics.intentVelocity}%` }}
              />
            </div>
          </div>

          {/* Metric 4: Estimated Deal Size */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Estimated Annual Contract Value:</span>
            <span className="font-bold text-emerald-400 text-sm">
              ${data.metrics.estimatedAnnualValueUsd.toLocaleString()} / yr
            </span>
          </div>
        </div>
      </div>

      {/* ── Key Highlights & Recommendations ──────────────────────── */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3">
        {/* Recommended Action Card */}
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Recommended Next Action</span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed font-medium">
              {data.recommendation.action}
            </p>
            <p className="text-[11px] text-zinc-400">
              Playbook: <span className="text-zinc-300 font-mono">{data.recommendation.suggestedPlaybook}</span>
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/60 text-zinc-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{data.recommendation.priorityResponseTime}</span>
          </div>
        </div>

        {/* Highlights Checklist */}
        <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
            Qualification Factors
          </span>
          <div className="space-y-1.5">
            {data.keyHighlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
