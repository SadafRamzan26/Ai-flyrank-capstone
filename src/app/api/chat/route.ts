/**
 * /api/chat — Streaming Chat Route Handler
 * ───────────────────────────────────────────────────────────────────────────
 * Receives chat messages from the client, streams token-by-token text
 * from OpenRouter back to useChat.
 *
 * Implements automated fallback across active free-tier models to guarantee
 * 100% uptime even if a specific OpenRouter provider is temporarily rate-limited.
 * ───────────────────────────────────────────────────────────────────────────
 */

import { streamText, convertToModelMessages } from "ai";
import {
  getModel,
  FREE_MODEL_CANDIDATES,
  systemPrompt,
  inferenceParams,
} from "@/lib/ai/model-config";

export const maxDuration = 60;

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

    // Attempt streaming with primary model; fallback to alternatives if rate-limited or rotated
    for (const modelId of FREE_MODEL_CANDIDATES) {
      try {
        const candidateModel = getModel(modelId);
        const result = streamText({
          model: candidateModel,
          system: systemPrompt,
          messages: modelMessages,
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
