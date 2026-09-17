import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StreamingChat from "@/components/StreamingChat";
import InlineErrorBanner from "@/components/InlineErrorBanner";
import LeadScoreCard from "@/components/LeadScoreCard";

const chatState = {
  messages: [] as Array<Record<string, unknown>>,
  sendMessage: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  status: "ready",
  error: undefined as Error | undefined,
  setMessages: vi.fn(),
  clearError: vi.fn(),
  regenerate: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@ai-sdk/react", () => ({
  useChat: () => chatState,
}));

function renderChat() {
  return render(<StreamingChat />);
}

beforeEach(() => {
  chatState.messages = [];
  chatState.status = "ready";
  chatState.error = undefined;
  chatState.sendMessage.mockClear();
  chatState.clearError.mockClear();
  chatState.regenerate.mockClear();
});

describe("StreamingChat states", () => {
  it("renders the idle chat form with an accessible send control", () => {
    renderChat();

    expect(screen.getByPlaceholderText(/message mine ai/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("shows the pending response skeleton while a request is submitted", () => {
    chatState.status = "submitted";
    renderChat();

    expect(screen.getByLabelText("Loading AI response")).toBeInTheDocument();
    expect(screen.getByText("Reasoning with Mine AI…")).toBeInTheDocument();
  });

  it("renders streamed assistant text without making an API call", () => {
    chatState.status = "streaming";
    chatState.messages = [
      { id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "Streamed answer" }] },
    ];
    renderChat();

    expect(screen.getByText("Streamed answer")).toBeInTheDocument();
    expect(chatState.sendMessage).not.toHaveBeenCalled();
  });

  it("renders an error alert and retries through its accessible button", async () => {
    const user = userEvent.setup();
    chatState.error = new Error("Network connection disrupted");
    renderChat();

    expect(screen.getByRole("alert")).toHaveTextContent("Network Connection Disrupted");
    await user.click(screen.getByRole("button", { name: "Retry Message" }));
    expect(chatState.regenerate).toHaveBeenCalledOnce();
  });

  it("keeps the send control disabled until the validated message field has content", async () => {
    const user = userEvent.setup();
    renderChat();
    const input = screen.getByPlaceholderText(/message mine ai/i);
    const send = screen.getByRole("button", { name: "Send message" });

    expect(send).toBeDisabled();
    await user.type(input, "Hello AI");
    expect(send).toBeEnabled();
    await user.click(send);
    await waitFor(() => expect(chatState.sendMessage).toHaveBeenCalledWith({ text: "Hello AI" }));
  });
});

describe("generative UI tool result", () => {
  it("validates and presents a lead score result", () => {
    render(
      <LeadScoreCard
        data={{
          companyName: "Acme",
          overallScore: 92,
          tier: "Tier 1: Hot Lead",
          confidence: 0.95,
          status: "qualified",
          metrics: { budgetFit: 90, marketFit: 95, intentVelocity: 92, estimatedAnnualValueUsd: 120000 },
          recommendation: {
            action: "Book an executive discovery call",
            suggestedPlaybook: "Enterprise acceleration",
            priorityResponseTime: "< 15 minutes",
          },
          keyHighlights: ["Strong buying intent"],
          calculatedAt: "2026-09-17T00:00:00.000Z",
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Acme" })).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("Book an executive discovery call")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy Report" })).toBeInTheDocument();
  });
});

describe("InlineErrorBanner", () => {
  it("categorizes rate-limit errors and exposes dismissal", async () => {
    const onDismiss = vi.fn();
    render(<InlineErrorBanner error={new Error("429 rate limit")} onRetry={vi.fn()} onDismiss={onDismiss} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Upstream Rate Limit Reached");
    await userEvent.setup().click(screen.getByRole("button", { name: "Dismiss error notice" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});