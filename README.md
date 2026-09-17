# Mine AI — Next.js Streaming Chat with Generative UI & Server Tools

An enterprise-grade streaming AI chat application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and the **Vercel AI SDK**. 

It features token-by-token text streaming, resilient controls, multi-step server-side tool calling, and structured Generative UI component rendering across all 4 tool lifecycle states with fluid 200ms crossfade transitions.

## FE-AA1: SmartButton Motion Contract

`src/components/SmartButton.tsx` demonstrates an interruptible idle, loading, success, and error lifecycle. Loading uses a 240ms `cubic-bezier(0.22, 1, 0.36, 1)` slide for a quick, settled handoff; opacity uses 180ms for readable crossfades. The button keeps a stable outer footprint to avoid reflow while its content visually expands and contracts with compositor-only transforms. Success holds for 900ms before returning to idle. The default fake submit resolves after 650-1250ms and fails 20% of the time. Reduced-motion users retain color and state feedback while entrance slides and the error shake are removed.

---

## 🛠️ Server-Side Tool Contract: `calculateLeadScore`

The application exposes a server-side tool named `calculateLeadScore` designed for B2B qualification and revenue optimization. It runs securely within `/api/chat` using the Vercel AI SDK `tool` helper and is validated with `zod`.

### 1. Tool Metadata
- **Tool Name**: `calculateLeadScore`
- **Location**: [`src/lib/ai/tools/lead-score.ts`](src/lib/ai/tools/lead-score.ts) & [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts)
- **Description**: *"Calculate lead score, tier qualification rating, deal size valuation, and strategic sales playbooks for a prospective B2B or enterprise client."*

### 2. Zod Parameter Schema (`inputSchema`)

```typescript
import { z } from "zod";

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
```

### 3. Structured Return Shape (`LeadScoreResult`)

```typescript
export interface LeadScoreResult {
  companyName: string;
  overallScore: number; // Composite score from 0 to 100
  tier: "Tier 1: Hot Lead" | "Tier 2: High Potential" | "Tier 3: Nurture Track";
  confidence: number; // Statistical confidence rating (e.g. 0.95)
  status: "qualified" | "needs_review";
  metrics: {
    budgetFit: number; // 0 - 100 score based on budget thresholds
    marketFit: number; // 0 - 100 score based on company scale
    intentVelocity: number; // 0 - 100 score based on buyer intent
    estimatedAnnualValueUsd: number; // Projected annual contract value
  };
  recommendation: {
    action: string; // Executive priority action
    suggestedPlaybook: string; // Tailored enterprise sales playbook
    priorityResponseTime: string; // Inbound response SLA (e.g. "< 15 minutes")
  };
  keyHighlights: string[]; // Bulleted strategic factors
  calculatedAt: string; // ISO 8601 timestamp
}
```

---

## 🎨 Client-Side Tool Lifecycle & Generative UI

Client rendering is managed inside [`src/components/StreamingChat.tsx`](src/components/StreamingChat.tsx) via typed tool parts streamed by `useChat()`.

Transitions between all 4 states utilize a smooth **200ms CSS crossfade** (`tool-crossfade` utility) preventing layout jumps and morphing cleanly into the target component:

```
[input-streaming] ──► [input-available] ──► [output-available] (<LeadScoreCard />)
                                        └──► [output-error]     (<ToolErrorCard />)
```

| Lifecycle State | Description | Rendered Component / View |
| :--- | :--- | :--- |
| **`input-streaming`** | AI is actively formulating and streaming parameters | Animated gradient container with pulsing radar indicator & live streaming args chips |
| **`input-available`** | Tool arguments confirmed; server execution in progress | High-tech glowing status card with spinning loader & confirmed payload badges |
| **`output-available`** | Tool execution succeeded with structured data | `<LeadScoreCard />`: Radial qualification score badge, metric breakdown bars, actionable sales playbook banner, and copy button (no raw JSON dumps) |
| **`output-error`** | Tool execution failed (e.g., timeout or invalid data) | `<ToolErrorCard />`: Explicit glassmorphic alert with failure reason, submitted parameters recap, resolution guidance, and diagnostic copy |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Ensure `.env.local` contains your OpenRouter API key:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Tool Execution

You can test both success and error states directly using the pre-configured starter prompt buttons in the chat UI or by typing:

1. **Success State (`output-available`)**:
   > *"Score lead for Tesla: enterprise size, $100,000 monthly budget, ai_automation goal, intent score 9"*

2. **Error State (`output-error`)**:
   > *"Test error lifecycle: Calculate lead score for ErrorCorp with fail trigger"*

---

## 🛡️ FE-08: Error States, Empty States & Edge Cases

The chat interface implements robust systems-level resilience across edge cases:

### 1. Polished Empty State (`ChatEmptyState.tsx`)
- **Welcoming Experience**: Hero branding, value proposition, and categorized prompt cards.
- **Instant One-Click Submit**: Clicking any suggestion fills the input and **immediately triggers generation** (`sendMessage`), avoiding redundant interactions.

### 2. Zero-CLS Pending Skeletons (`MessageSkeleton.tsx`)
- **Exact Geometry Match**: Identical padding (`px-3.5 py-3 sm:px-4 sm:py-3.5`), border radii (`rounded-2xl rounded-tl-sm`), max-widths, and avatar layout matching the assistant's real response bubble.
- **Zero Layout Shifts**: Shimmering placeholders (`.skeleton-shimmer`) animate smoothly until the first stream token replaces them without bounding box jumps.

### 3. Mid-Stream/API Errors & Targeted Retry (`InlineErrorBanner.tsx`)
- **Graceful Inline Placement**: Renders directly within the message stream upon any upstream exception (e.g. HTTP 429 rate limit or network drop).
- **Targeted Retry**: Features a dedicated "Retry Message" button that invokes `regenerate()`, re-attempting only the failed message without corrupting conversational state.

### 4. Global Route Error Boundary (`src/app/error.tsx`)
- Catches unhandled client-side runtime exceptions across the Next.js App Router.
- Provides a designed recovery card with "Try Again" (`reset()`), "Reload Page", error digest display, and technical diagnostic telemetry.

### 5. Mobile Safari Optimization
- **Dynamic Viewport Height**: Uses `h-[100dvh]` to eliminate Mobile Safari URL/navigation bar overflow issues.
- **Keyboard Handling**: Configures `interactiveWidget: 'resizes-content'` in `viewport` metadata to prevent virtual keyboard overlap.
- **Zoom Prevention**: Input textarea uses `text-base sm:text-sm` (16px on mobile) to disable Mobile Safari's involuntary auto-zoom on focus.
- **Touch Safe Area**: Pinned footer respects `env(safe-area-inset-bottom)` for iPhone home indicators.
- **Overscroll Containment**: Messages container applies `overscroll-behavior-y: contain` to prevent rubber-band scroll conflicts.

---

## 🏗️ Production Build Verification

```bash
npm run build
```
Turbopack compiles the optimized production bundle with zero type or lint errors.
