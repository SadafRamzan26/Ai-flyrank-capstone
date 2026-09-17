"use client";

/**
 * StreamingChat.tsx
 * ───────────────────────────────────────────────────────────────────────────
 * Production-grade streaming AI chat interface for Mine AI.
 * Powered by Vercel AI SDK v7 (`useChat` from `@ai-sdk/react`) and OpenRouter.
 *
 * Features:
 *  ✓ Branding: "Mine AI"
 *  ✓ Token-by-token streaming updates
 *  ✓ Sleek pulsing thinking indicator (zero layout flash)
 *  ✓ Resilient stop button (persists partial text, re-enables input instantly)
 *  ✓ Sticky auto-scroll with floating "Jump to latest" button
 *  ✓ Streaming-safe markdown rendering with auto-closing code blocks
 *  ✓ Mobile responsive (375px+)
 * ───────────────────────────────────────────────────────────────────────────
 */

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  SendHorizonal,
  Square,
  ArrowDown,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  AlertCircle,
  Loader2,
  Wrench,
} from "lucide-react";
import LeadScoreCard from "@/components/LeadScoreCard";
import ToolErrorCard from "@/components/ToolErrorCard";
import ChatEmptyState from "@/components/ChatEmptyState";
import MessageSkeleton from "@/components/MessageSkeleton";
import InlineErrorBanner from "@/components/InlineErrorBanner";
import SmartButton from "@/components/SmartButton";
import type { LeadScoreResult } from "@/lib/ai/tools/lead-score";

// ── Helpers: Typed Tool Part Detection & Lifecycle ─────────────────────────
function isToolPart(part: any): boolean {
  if (!part || typeof part !== "object") return false;
  return (
    (typeof part.type === "string" && part.type.startsWith("tool-")) ||
    part.type === "dynamic-tool"
  );
}

function getPartToolName(part: any): string {
  if (part.type === "dynamic-tool") return part.toolName || "tool";
  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
    return part.type.replace(/^tool-/, "");
  }
  return "tool";
}

// ── Tool Lifecycle Renderer (All 4 States with 200ms Crossfade) ────────────
function ToolLifecycleRenderer({ part }: { part: any }) {
  const toolName = getPartToolName(part);
  const state: "input-streaming" | "input-available" | "output-available" | "output-error" | string =
    part.state;

  switch (state) {
    // 1. Input Streaming: AI is thinking/generating parameters
    case "input-streaming":
      return (
        <div className="tool-crossfade w-full my-3 p-3.5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-zinc-950/80 to-zinc-900/80 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
              <span className="text-xs font-semibold text-purple-200">
                AI formulating parameters for{" "}
                <span className="font-mono text-purple-300 font-bold">{toolName}</span>…
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-purple-500/15 text-purple-300 border border-purple-500/25">
              input-streaming
            </span>
          </div>

          {part.input && Object.keys(part.input).length > 0 && (
            <div className="mt-2 text-[11px] font-mono text-zinc-300 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 flex flex-wrap gap-1.5 items-center">
              <span className="text-zinc-500 text-[10px] uppercase font-sans font-semibold">Streaming Args:</span>
              {Object.entries(part.input).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-purple-300 text-[10px]">
                  {k}: <span className="text-zinc-200">{String(v)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      );

    // 2. Input Available: Processing/Calling the tool on server
    case "input-available":
      return (
        <div className="tool-crossfade w-full my-3 p-3.5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-zinc-950/80 to-zinc-900/80 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs font-semibold text-indigo-200">
                Executing server tool:{" "}
                <span className="font-mono text-indigo-300 font-bold">{toolName}</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              input-available
            </span>
          </div>

          {part.input && (
            <div className="mt-2 text-[11px] font-mono text-zinc-300 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 flex flex-wrap gap-1.5 items-center">
              <span className="text-zinc-500 text-[10px] uppercase font-sans font-semibold">Confirmed Payload:</span>
              {Object.entries(part.input).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300 text-[10px]">
                  {k}: <span className="text-zinc-200">{String(v)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      );

    // 3. Output Available: Tool success -> Render sleek Generative UI component
    case "output-available":
      return (
        <div className="tool-crossfade w-full">
          {toolName === "calculateLeadScore" && part.output ? (
            <LeadScoreCard data={part.output as LeadScoreResult} input={part.input} />
          ) : (
            <div className="my-3 p-4 rounded-2xl border border-emerald-500/30 bg-zinc-950/90 text-zinc-100 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  {toolName} Result
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  output-available
                </span>
              </div>
              <pre className="text-xs font-mono text-zinc-300 overflow-x-auto p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
                {JSON.stringify(part.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );

    // 4. Output Error: Tool execution failed -> Render explicit, graceful Error Component
    case "output-error":
      return (
        <div className="tool-crossfade w-full">
          <ToolErrorCard
            toolName={toolName}
            errorText={part.errorText}
            input={part.input}
          />
        </div>
      );

    default:
      return null;
  }
}

// ── Helper: Extract text from AI SDK v7 UIMessage ─────────────────────────
function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) {
    return (message as { content?: string }).content || "";
  }
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

// ── Helper: Render all message parts in sequence (Text & Tools) ───────────
function MessageContent({ message }: { message: UIMessage }) {
  if (!message.parts || !Array.isArray(message.parts) || message.parts.length === 0) {
    const rawContent = (message as any).content || "";
    return typeof rawContent === "string" ? (
      <MemoMarkdown content={rawContent} />
    ) : null;
  }

  return (
    <div className="space-y-3 w-full">
      {message.parts.map((part: any, index: number) => {
        if (part.type === "text") {
          if (!part.text) return null;
          return <MemoMarkdown key={`text-${index}`} content={part.text} />;
        }

        if (isToolPart(part)) {
          return (
            <ToolLifecycleRenderer
              key={part.toolCallId || `tool-${index}`}
              part={part}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

// ── Helper: Make streaming markdown safe against unclosed code blocks ─────
function makeStreamingSafe(text: string): string {
  if (!text) return "";
  const matches = text.match(/```/g);
  if (matches && matches.length % 2 !== 0) {
    return text + "\n```";
  }
  return text;
}

// ── Code block with Copy button ───────────────────────────────────────────
function CodeBlock({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { className?: string }) {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const isInline = !className;

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-purple-300 font-mono text-[0.85em] border border-zinc-700/50"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs sm:text-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400">
        <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-0.5 px-1.5 rounded hover:bg-zinc-800"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-zinc-200 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

// ── Memoized Markdown Renderer ────────────────────────────────────────────
const MemoMarkdown = React.memo(function MemoMarkdown({
  content,
}: {
  content: string;
}) {
  const safeContent = useMemo(() => makeStreamingSafe(content), [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
        h1: ({ children }) => (
          <h1 className="text-lg sm:text-xl font-bold mt-4 mb-2 text-zinc-100 border-b border-zinc-800 pb-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base sm:text-lg font-semibold mt-3 mb-1.5 text-zinc-100">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm sm:text-base font-semibold mt-2.5 mb-1 text-zinc-200">
            {children}
          </h3>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-2.5 space-y-1 text-zinc-200">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-zinc-200">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-purple-500/60 pl-3 italic text-zinc-300 my-2.5 bg-purple-500/5 py-1 rounded-r">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 underline underline-offset-2 hover:text-purple-300 transition-colors"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 rounded-lg border border-zinc-800">
            <table className="min-w-full text-xs sm:text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-zinc-800 px-3 py-2 text-left font-semibold bg-zinc-900 text-zinc-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-zinc-800 px-3 py-1.5 text-zinc-300 bg-zinc-950/40">
            {children}
          </td>
        ),
        code: CodeBlock as any,
        pre: ({ children }) => <div className="not-prose">{children}</div>,
      }}
    >
      {safeContent}
    </ReactMarkdown>
  );
});


// ── Main StreamingChat Component ──────────────────────────────────────────
export default function StreamingChat() {
  const {
    messages,
    sendMessage,
    stop,
    status,
    error,
    setMessages,
    clearError,
    regenerate,
  } = useChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll sticky state
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Loading flag: 'submitted' = waiting for first chunk, 'streaming' = actively receiving chunks
  const isGenerating = status === "submitted" || status === "streaming";

  // Check last message for thinking handoff
  const lastMessage = messages[messages.length - 1];
  const lastMessageIsAssistant = lastMessage?.role === "assistant";
  const lastAssistantText = lastMessageIsAssistant ? getMessageText(lastMessage) : "";
  const hasActiveTool =
    lastMessageIsAssistant &&
    lastMessage?.parts?.some((p: any) => isToolPart(p));

  const showThinking =
    status === "submitted" ||
    (status === "streaming" &&
      (!lastMessageIsAssistant || (lastAssistantText.length === 0 && !hasActiveTool)));

  // ── Instant Suggestion Submission (Empty State) ────────────────────────
  const handleSuggestionSubmit = useCallback(
    async (promptText: string) => {
      if (isGenerating) return;
      setInput("");
      if (clearError) clearError();
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      setIsAtBottom(true);
      setTimeout(() => scrollToBottom(true), 50);

      try {
        await sendMessage({ text: promptText });
      } catch (err) {
        console.error("Failed to send suggestion:", err);
      }
    },
    [isGenerating, clearError, sendMessage]
  );

  // ── Targeted Message Retry (Failure Recovery) ─────────────────────────
  const handleRetry = useCallback(async () => {
    if (clearError) clearError();
    setIsAtBottom(true);
    setTimeout(() => scrollToBottom(true), 50);

    if (regenerate) {
      try {
        await regenerate();
        return;
      } catch (err) {
        console.warn("useChat regenerate failed, falling back to resend:", err);
      }
    }

    // Fallback: target and re-send only the last failed user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const lastText = lastUserMsg ? getMessageText(lastUserMsg) : "";
    if (lastText) {
      await sendMessage({ text: lastText });
    }
  }, [clearError, regenerate, messages, sendMessage]);

  // ── Auto-scroll detection ──────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distanceFromBottom < 60);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomSentinelRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
    setIsAtBottom(true);
  }, []);

  // Sticky bottom scroll on message/status change
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(true);
    }
  }, [messages, status, isAtBottom, scrollToBottom]);

  // Focus input on initial mount and when generation finishes
  useEffect(() => {
    if (!isGenerating) {
      inputRef.current?.focus();
    }
  }, [isGenerating]);

  // Dynamic textarea height adjustment
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // ── Form Submission ────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isGenerating) return;

      setInput("");
      if (clearError) clearError();
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      setIsAtBottom(true);
      setTimeout(() => scrollToBottom(true), 50);

      try {
        await sendMessage({ text: trimmed });
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [input, isGenerating, sendMessage, scrollToBottom, clearError]
  );

  // ── Keyboard handling (Enter to submit, Shift+Enter for newline) ────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ── Stop Generation Handler ────────────────────────────────────────────
  const handleStop = useCallback(async () => {
    try {
      await stop();
    } catch (err) {
      console.warn("Error stopping stream:", err);
    }
  }, [stop]);

  // ── Clear Chat ─────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setMessages([]);
    if (clearError) clearError();
  }, [setMessages, clearError]);

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-full max-w-4xl mx-auto bg-zinc-950 text-zinc-100 overflow-hidden font-sans border-x border-zinc-800/60 shadow-2xl overscroll-none">
      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-3 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-zinc-100 tracking-tight">
                Mine AI
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Nemotron 3.5 • Tool-Calling Ready
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isGenerating ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                }`}
              />
              {isGenerating ? "Streaming response…" : "Active • Ready"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isGenerating}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
              title="Clear conversation"
              aria-label="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Messages Container (Mobile Momentum & Overscroll Contained) ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain-y px-3 sm:px-6 py-4 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {/* Designed Empty State with Instant-Submit Suggestions */}
        {messages.length === 0 && (
          <ChatEmptyState onSelectSuggestion={handleSuggestionSubmit} />
        )}

        {/* Message Stream */}
        {messages.map((m) => {
          const isUser = m.role === "user";
          const messageText = getMessageText(m);
          const hasToolParts = m.parts?.some((p: any) => isToolPart(p));

          if (!isUser && !messageText && !hasToolParts && showThinking) {
            return null;
          }

          return (
            <div
              key={m.id}
              className={`flex gap-2.5 sm:gap-3.5 ${
                isUser ? "justify-end" : "justify-start"
              } items-start`}
            >
              {!isUser && (
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative ${
                  hasToolParts && !isUser
                    ? "w-full max-w-[96%] sm:max-w-[92%]"
                    : "max-w-[88%] sm:max-w-[82%]"
                } px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/10 font-medium"
                    : "bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-sm shadow-sm"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap break-words">{messageText}</p>
                ) : (
                  <div className="prose-invert max-w-none break-words w-full">
                    <MessageContent message={m} />
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Zero-CLS Assistant Pending Skeleton */}
        {showThinking && (
          <div className="w-full">
            <MessageSkeleton />
          </div>
        )}

        {/* Graceful Inline Error with Targeted Retry */}
        {error && (
          <InlineErrorBanner
            error={error}
            onRetry={handleRetry}
            onDismiss={clearError}
          />
        )}

        {/* Bottom scroll sentinel */}
        <div ref={bottomSentinelRef} aria-hidden="true" className="h-1" />
      </div>

      {/* ── Floating "Jump to latest" button ──────────────────────────── */}
      {!isAtBottom && (
        <div className="relative flex justify-center pointer-events-none">
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="pointer-events-auto absolute -top-12 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/95 border border-zinc-700 text-zinc-200 text-xs font-medium shadow-xl hover:bg-zinc-700 hover:text-white transition-all transform hover:scale-105 active:scale-95"
            aria-label="Jump to latest message"
          >
            <ArrowDown className="w-3.5 h-3.5 text-purple-400" />
            <span>Jump to latest</span>
          </button>
        </div>
      )}

      {/* ── Input Box & Controls (Mobile Safari Safe Area & Zoom-Proof) ─── */}
      <footer className="flex-shrink-0 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md p-3 sm:p-4 safe-area-bottom sticky bottom-0 z-20">
        <form onSubmit={handleSend} className="w-full">
          <div className="flex items-end gap-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-1.5 sm:p-2 transition-all focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20">
            <textarea
              ref={inputRef}
              id="chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isGenerating ? "Mine AI is generating…" : "Message Mine AI… (Enter to submit, Shift+Enter for newline)"}
              disabled={false}
              className="flex-1 resize-none bg-transparent px-2.5 py-1.5 text-base sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none leading-relaxed max-h-40 min-h-[38px] scrollbar-thin scrollbar-thumb-zinc-700"
            />

            {/* Resilient Stop / Send Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-red-500/20"
                title="Stop streaming"
                aria-label="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            ) : (
              <SmartButton
                disabled={!input.trim()}
                onSubmit={handleSend}
                className="flex-shrink-0 w-10 sm:w-10 h-10 rounded-xl px-0"
              />
            )}
          </div>

          <div className="flex items-center justify-between px-2 mt-2 text-[10px] text-zinc-500 select-none">
            <span>Mine AI • Real-time Streaming Engine</span>
            <span className="hidden sm:inline">Shift+Enter for newline</span>
          </div>
        </form>
      </footer>
    </div>
  );
}
