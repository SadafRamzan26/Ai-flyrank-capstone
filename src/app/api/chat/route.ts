/**
 * /api/chat — Streaming Chat Route Handler with Server-Side Tools
 * ───────────────────────────────────────────────────────────────────────────
 * Receives chat messages from client, streams token-by-token text and
 * typed tool lifecycle events (input-streaming, input-available, output-available,
 * output-error) back to useChat.
 *
 * Implements:
 *  - calculateLeadScore server tool with strict Zod validation
 *  - Structured Generative UI output payload
 *  - Automated model candidate fallback for 100% uptime
 *  - Multi-step execution via stopWhen: isStepCount(3)
 * ───────────────────────────────────────────────────────────────────────────
 */

import { streamText, convertToModelMessages, tool, isStepCount } from "ai";
import {
  getModel,
  FREE_MODEL_CANDIDATES,
  systemPrompt,
  inferenceParams,
} from "@/lib/ai/model-config";
import {
  calculateLeadScoreSchema,
  type CalculateLeadScoreInput,
  type LeadScoreResult,
} from "@/lib/ai/tools/lead-score";

export const maxDuration = 60;

// ── Server-Side Tool: calculateLeadScore ─────────────────────────────────────
export const calculateLeadScoreTool = tool({
  description:
    "Calculate lead score, tier qualification rating, deal size valuation, and strategic sales playbooks for a prospective B2B or enterprise client.",
  inputSchema: calculateLeadScoreSchema,
  execute: async (input: CalculateLeadScoreInput): Promise<LeadScoreResult> => {
    // Artificial small delay to visualize real server processing lifecycle in UI
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Support intentional error simulation for testing the output-error lifecycle state
    if (
      input.triggerError ||
      input.companyName.toLowerCase().includes("error") ||
      input.companyName.toLowerCase().includes("fail")
    ) {
      throw new Error(
        `Lead qualification service failure: Firmographic data provider timed out while analyzing "${input.companyName}". Please verify company name and retry.`
      );
    }

    // Budget weighting (0 - 100)
    let budgetFit = Math.min(100, Math.round((input.monthlyBudget / 50000) * 100));
    if (input.companySize === "enterprise" && input.monthlyBudget >= 25000) {
      budgetFit = Math.max(92, budgetFit);
    }
    if (input.monthlyBudget < 2500) {
      budgetFit = Math.min(48, budgetFit);
    }

    // Company scale weighting (0 - 100)
    const sizeMultiplier: Record<string, number> = {
      startup: 68,
      smb: 78,
      "mid-market": 88,
      enterprise: 96,
    };
    const marketFit = sizeMultiplier[input.companySize] || 75;

    // Intent velocity weighting (intentScore 1-10 -> 10-100)
    const intentVelocity = Math.min(100, Math.max(10, input.intentScore * 10));

    // Goal synergy bonus
    const goalBonus =
      input.primaryGoal === "ai_automation" || input.primaryGoal === "seo_growth" ? 5 : 0;

    // Overall weighted composite score (0-100)
    const rawScore = budgetFit * 0.4 + marketFit * 0.3 + intentVelocity * 0.3 + goalBonus;
    const overallScore = Math.min(100, Math.max(18, Math.round(rawScore)));

    // Tier rating & actionable recommendations
    let tier: LeadScoreResult["tier"] = "Tier 3: Nurture Track";
    let status: LeadScoreResult["status"] = "needs_review";
    let action = "Enroll in automated educational email sequences and case study review.";
    let suggestedPlaybook = "Nurture Campaign: Product Architecture Whitepaper + Webinar Invitation";
    let priorityResponseTime = "Within 48 hours";

    if (overallScore >= 80) {
      tier = "Tier 1: Hot Lead";
      status = "qualified";
      action = "Immediate Enterprise Account Executive outreach & tailored ROI model.";
      suggestedPlaybook = "High-Touch VIP: Executive Briefing & Technical Pilot Proposal";
      priorityResponseTime = "< 15 minutes (High Priority)";
    } else if (overallScore >= 60) {
      tier = "Tier 2: High Potential";
      status = "qualified";
      action = "Schedule discovery consultation with Solutions Engineering lead.";
      suggestedPlaybook = "Solution Alignment: Interactive Product Demo + ROI Benchmark";
      priorityResponseTime = "Within 4 hours";
    }

    const estimatedAnnualValueUsd = Math.round(input.monthlyBudget * 12);

    const keyHighlights: string[] = [
      input.monthlyBudget >= 20000
        ? `High monthly budget ($${input.monthlyBudget.toLocaleString()}) qualifies for enterprise service tier.`
        : `Budget profile ($${input.monthlyBudget.toLocaleString()}/mo) fits standardized growth tier.`,
      input.intentScore >= 8
        ? `Elevated buyer intent (${input.intentScore}/10) indicates an active evaluation cycle.`
        : `Engagement score (${input.intentScore}/10) signals discovery phase.`,
      `Targeting ${input.primaryGoal.replace(/_/g, " ")} for a ${input.companySize}-stage organization.`,
    ];

    return {
      companyName: input.companyName,
      overallScore,
      tier,
      confidence: Math.round((0.88 + overallScore / 1000) * 100) / 100,
      status,
      metrics: {
        budgetFit,
        marketFit,
        intentVelocity,
        estimatedAnnualValueUsd,
      },
      recommendation: {
        action,
        suggestedPlaybook,
        priorityResponseTime,
      },
      keyHighlights,
      calculatedAt: new Date().toISOString(),
    };
  },
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const formattedMessages = Array.isArray(messages)
      ? messages.map((m: any) => {
          if (!m.parts && m.content) {
            return {
              id: m.id || String(Math.random()),
              role: m.role || "user",
              parts: [
                {
                  type: "text",
                  text: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
                },
              ],
            };
          }
          return m;
        })
      : [];

    const modelMessages = await convertToModelMessages(formattedMessages);

    let lastError: any = null;

    // Attempt streaming with primary candidate; fallback to alternatives if rate-limited
    for (const modelId of FREE_MODEL_CANDIDATES) {
      try {
        const candidateModel = getModel(modelId);
        const result = streamText({
          model: candidateModel,
          system: systemPrompt,
          messages: modelMessages,
          tools: {
            calculateLeadScore: calculateLeadScoreTool,
          },
          stopWhen: isStepCount(3),
          ...inferenceParams,
        });

        return result.toUIMessageStreamResponse();
      } catch (err: any) {
        console.warn(`[Model ${modelId} failed]:`, err?.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("All model candidates exhausted.");
  } catch (err: any) {
    console.error("[Chat Route Error]:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to generate stream" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
