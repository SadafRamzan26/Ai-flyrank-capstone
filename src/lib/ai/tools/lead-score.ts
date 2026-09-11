import { z } from "zod";

/**
 * Lead Score Tool Parameter Schema
 * ───────────────────────────────────────────────────────────────────────────
 * Strict Zod schema for calculating prospective B2B client qualification score.
 */
export const calculateLeadScoreSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .describe("The name of the prospective business or organization"),
  companySize: z
    .enum(["startup", "smb", "mid-market", "enterprise"])
    .describe("Headcount scale of the company (startup: 1-20, smb: 21-100, mid-market: 101-500, enterprise: 500+)"),
  monthlyBudget: z
    .number()
    .positive("Monthly budget must be a positive number")
    .describe("Estimated monthly marketing or software budget in USD (e.g. 15000)"),
  primaryGoal: z
    .enum(["seo_growth", "ai_automation", "lead_generation", "performance_marketing"])
    .describe("Primary business objective or campaign target"),
  intentScore: z
    .number()
    .min(1)
    .max(10)
    .describe("Observed engagement/intent score from 1 (low curiosity) to 10 (urgent immediate need)"),
  triggerError: z
    .boolean()
    .optional()
    .describe("Flag to simulate upstream service failure for testing error lifecycle handling"),
});

export type CalculateLeadScoreInput = z.infer<typeof calculateLeadScoreSchema>;

/**
 * Structured Output Return Shape
 * ───────────────────────────────────────────────────────────────────────────
 * Consumed by the Generative UI LeadScoreCard component.
 */
export interface LeadScoreResult {
  companyName: string;
  overallScore: number; // 0 - 100
  tier: "Tier 1: Hot Lead" | "Tier 2: High Potential" | "Tier 3: Nurture Track";
  confidence: number; // e.g. 0.95
  status: "qualified" | "needs_review";
  metrics: {
    budgetFit: number; // 0 - 100
    marketFit: number; // 0 - 100
    intentVelocity: number; // 0 - 100
    estimatedAnnualValueUsd: number;
  };
  recommendation: {
    action: string;
    suggestedPlaybook: string;
    priorityResponseTime: string;
  };
  keyHighlights: string[];
  calculatedAt: string;
}
