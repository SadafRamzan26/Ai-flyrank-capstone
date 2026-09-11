# Flyrank Tool Update Log: Server-Side Tool & Generative UI

**Date**: September 2026  
**Module**: Next.js App Router Streaming Chat (`src/app/api/chat/route.ts` & `src/components/StreamingChat.tsx`)  
**Feature**: Server-Side Tool Definition (`calculateLeadScore`) & 4-State Generative UI Lifecycle  

---

## 1. Tool Contract Specifications

- **Tool Name**: `calculateLeadScore`
- **Location**: `src/lib/ai/tools/lead-score.ts` (shared schema) & `src/app/api/chat/route.ts` (route registration)
- **Framework**: Vercel AI SDK (`ai` v7) with `tool()` helper and `@ai-sdk/react` (`useChat`)
- **Validation**: Zod strict schema (`calculateLeadScoreSchema`)

### Zod Schema Definition:
```typescript
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
```

### Structured Return Shape:
```typescript
export interface LeadScoreResult {
  companyName: string;
  overallScore: number;
  tier: "Tier 1: Hot Lead" | "Tier 2: High Potential" | "Tier 3: Nurture Track";
  confidence: number;
  status: "qualified" | "needs_review";
  metrics: {
    budgetFit: number;
    marketFit: number;
    intentVelocity: number;
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
```

---

## 2. Client-Side Lifecycle States Handled

Inside `src/components/StreamingChat.tsx`, all tool calls are tracked via typed tool parts with a smooth **200ms CSS crossfade** (`.tool-crossfade`):

1. **`input-streaming`**: AI is streaming parameter tokens. Renders pulsing radar status with streaming argument chips.
2. **`input-available`**: Parameters confirmed, server tool is executing. Renders spinner indicator with confirmed parameter payload.
3. **`output-available`**: Server execution returned structured data. Renders `<LeadScoreCard />` with radial qualification badge, metric progress bars, playbook advice, and copy button. Zero raw JSON dumps.
4. **`output-error`**: Server execution encountered an error. Renders `<ToolErrorCard />` with failure details, diagnostic breakdown, and recovery tips without crashing the chat container.

---

## 3. Verification & Testing

- **TypeScript Compilation**: `npx tsc --noEmit` passed with 0 errors.
- **Production Build**: `npm run build` compiled all static and dynamic routes (`/` and `/api/chat`) successfully in Turbopack.
- **Error Simulation**: Can be tested by invoking with company name containing `"error"` or `"fail"`, or passing `triggerError: true`.

---

## 4. FE-08: Error States, Empty States & Edge Cases

- **Empty State (`ChatEmptyState.tsx`)**: Polished empty state with 4 categorized prompt cards that automatically fill and submit the message immediately.
- **Zero-CLS Pending Skeleton (`MessageSkeleton.tsx`)**: Exact-geometry assistant skeleton with animated shimmers that smoothly transitions into real streamed tokens with zero layout shift.
- **Mid-stream/API Errors & Targeted Retry (`InlineErrorBanner.tsx`)**: Graceful inline error UI featuring a targeted retry action (`regenerate()`) re-attempting only the failed message.
- **Route Error Boundary (`src/app/error.tsx`)**: Global fallback UI with `reset()` recovery action, diagnostic stack inspection, and copy telemetry.
- **Mobile Safari Responsiveness**: `100dvh` container, `interactiveWidget: "resizes-content"`, safe-area insets (`env(safe-area-inset-bottom)`), overscroll containment, and 16px mobile textarea font to prevent involuntary iOS auto-zoom.

