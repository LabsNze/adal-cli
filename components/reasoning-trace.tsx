"use client";

import type { UIMessage } from "ai";
import { Brain, GitBranch, Zap, ArrowRight } from "lucide-react";

interface ReasoningTraceProps {
  messages: UIMessage[];
  algorithm: string;
}

const algorithmLabels: Record<string, { label: string; icon: typeof Brain }> = {
  cot: { label: "Chain-of-Thought", icon: ArrowRight },
  tot: { label: "Tree-of-Thought", icon: GitBranch },
  got: { label: "Graph-of-Thought", icon: Brain },
  react: { label: "ReAct", icon: Zap },
  selfask: { label: "Self-Ask", icon: Brain },
  custom: { label: "Custom Hybrid", icon: Brain },
};

export function ReasoningTrace({ messages, algorithm }: ReasoningTraceProps) {
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const config = algorithmLabels[algorithm] || algorithmLabels.cot;
  const Icon = config.icon;

  if (assistantMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
        <Brain className="h-8 w-8 mb-3 opacity-50" />
        <p className="text-sm">Reasoning trace will appear here</p>
        <p className="text-xs mt-1 opacity-60">
          Start a conversation to see the agent think
        </p>
      </div>
    );
  }

  const steps: Array<{ step: number; text: string; hasToolUse: boolean }> = [];
  assistantMessages.forEach((msg, idx) => {
    const text =
      msg.parts
        ?.filter(
          (p): p is { type: "text"; text: string } => p.type === "text"
        )
        .map((p) => p.text)
        .join("") || "";
    const hasToolUse = msg.parts?.some((p) => p.type === "tool-invocation") ?? false;
    if (text.trim()) {
      steps.push({ step: idx + 1, text: text.slice(0, 200), hasToolUse });
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <Icon className="h-3.5 w-3.5" />
        <span className="font-mono">{config.label}</span>
        <span className="ml-auto opacity-60">
          {steps.length} step{steps.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="relative">
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.step} className="flex gap-3 relative">
              <div
                className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  step.hasToolUse
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-primary/20 text-primary border border-primary/30"
                }`}
              >
                {step.step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                  {step.text}
                </p>
                {step.hasToolUse && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-amber-400 font-mono">
                    <Zap className="h-2.5 w-2.5" />
                    Tool invoked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
