"use client";

import { ArrowUp, Check, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SmartButtonState = "idle" | "loading" | "success" | "error";

interface SmartButtonProps {
  onSubmit?: () => Promise<void> | void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

function fakeSubmit(): Promise<void> {
  const delay = 650 + Math.floor(Math.random() * 601);

  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      Math.random() < 0.2 ? reject(new Error("Simulated submission failure")) : resolve();
    }, delay);
  });
}

export default function SmartButton({
  onSubmit = fakeSubmit,
  disabled = false,
  label = "Send message",
  className = "",
}: SmartButtonProps) {
  const [state, setState] = useState<SmartButtonState>("idle");
  const requestId = useRef(0);

  useEffect(() => {
    if (state !== "success") return;

    const timer = window.setTimeout(() => setState("idle"), 900);
    return () => window.clearTimeout(timer);
  }, [state]);

  const handleClick = async () => {
    if (disabled || state === "loading" || state === "success") return;

    const currentRequest = ++requestId.current;
    setState("loading");

    try {
      await onSubmit();
      if (currentRequest === requestId.current) setState("success");
    } catch {
      if (currentRequest === requestId.current) setState("error");
    }
  };

  const isError = state === "error";
  const isBusy = state === "loading" || state === "success";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isBusy}
      aria-live="polite"
      aria-busy={state === "loading"}
      aria-label={isError ? "Retry submission" : label}
      className={`smart-button ${isError ? "smart-button--error" : ""} ${
        state === "success" ? "smart-button--success" : ""
      } ${className}`}
    >
      <span className="smart-button__content" data-state={state}>
        <span className="smart-button__label">{isError ? "Retry" : label}</span>
        <span className="smart-button__spinner" aria-hidden="true">
          <Loader2 className="smart-button__icon smart-button__icon--spin" />
        </span>
        <span className="smart-button__check" aria-hidden="true">
          <Check className="smart-button__icon" />
        </span>
        <span className="smart-button__retry" aria-hidden="true">
          <RotateCcw className="smart-button__icon" />
        </span>
      </span>
      <span className="sr-only">
        {state === "loading" ? "Submitting" : state === "success" ? "Submitted" : isError ? "Submission failed" : label}
      </span>
      {state === "idle" && <ArrowUp className="smart-button__send" aria-hidden="true" />}
      <span className="smart-button__tooltip" role="tooltip">
        {isError ? "Retry" : label}
      </span>
    </button>
  );
}