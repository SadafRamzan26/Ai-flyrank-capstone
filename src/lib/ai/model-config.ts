/**
 * model-config.ts
 * ───────────────────────────────────────────────────────────────────────────
 * Central AI model configuration for Mine AI.
 *
 * Configured with OpenRouter via the OpenAI-compatible client (@ai-sdk/openai).
 * Uses active, high-throughput free-tier models with automated fallback support.
 *
 * All API credentials remain strictly server-side (process.env.OPENROUTER_API_KEY).
 * ───────────────────────────────────────────────────────────────────────────
 */

import { createOpenAI } from "@ai-sdk/openai";

// ── OpenRouter Client ──────────────────────────────────────────────────────
// Reads OPENROUTER_API_KEY server-side so it is never leaked to the browser.
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

// ── Available Free-Tier Model Candidates ───────────────────────────────────
// OpenRouter rotates free tiers periodically. We define prioritized active models
// with verified tool-calling support to ensure uninterrupted availability.
export const FREE_MODEL_CANDIDATES = [
  process.env.AI_MODEL_ID || "nvidia/nemotron-3.5-lightning:free",
  "nex-agi/nex-n2.5-mini:free",
  "google/gemma-4-31b-it:free",
  "liquid/lfm-2.5-2.6b:free",
] as const;

// Primary model instance
export const primaryModelId = FREE_MODEL_CANDIDATES[0];
export const model = openrouter(primaryModelId);

// Factory function to get model by ID
export function getModel(modelId: string = primaryModelId) {
  return openrouter(modelId);
}

// ── System Prompt ─────────────────────────────────────────────────────────
// Defines the Mine AI persona, formatting rules, tool execution, and guardrails.
export const systemPrompt = `You are Mine AI, an intelligent, versatile AI assistant built for high-performance software engineering, growth analytics, and productive problem-solving.

Capabilities & Tool Usage:
• You have access to the server-side tool 'calculateLeadScore'.
• Whenever a user asks to qualify a lead, calculate a lead score, analyze a sales prospect, or evaluate customer opportunity, YOU MUST call the 'calculateLeadScore' tool with relevant parameters.
• If the user does not provide all exact parameters, make intelligent, realistic inferences based on their context (e.g. default companySize to 'smb' or 'mid-market', monthlyBudget to reasonable estimates like 10000, primaryGoal to 'lead_generation' or 'seo_growth', intentScore between 1-10).
• After calling the tool, provide a concise executive summary highlighting key strategic insights and next steps.

Guidelines:
• Provide direct, clear, and well-structured answers using Markdown.
• When writing code, use clean, production-ready snippets with helpful comments.
• Never hallucinate facts or syntax; if uncertain, state so honestly.
• Keep tone encouraging, professional, and concise.`;

// ── Inference & Streaming Parameters ──────────────────────────────────────
export const inferenceParams = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 4096,
} as const;
