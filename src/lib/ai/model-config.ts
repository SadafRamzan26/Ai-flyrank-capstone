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
// to ensure uninterrupted availability.
export const FREE_MODEL_CANDIDATES = [
  process.env.AI_MODEL_ID || "minimax/minimax-m2.7:free",
  "minimax/minimax-m3:free",
  "nvidia/nemotron-3.5-lightning:free",
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
// Defines the Mine AI persona, formatting rules, and guardrails.
export const systemPrompt = `You are Mine AI, an intelligent, versatile AI assistant built for high-performance software engineering, clear explanations, and productive problem-solving.

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
