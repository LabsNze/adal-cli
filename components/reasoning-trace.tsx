"use client"

import type { UIMessage } from "ai"
import { Brain, GitBranch, Zap, ArrowRight, HelpCircle, Sparkles, Wrench } from "lucide-react"

interface ReasoningTraceProps {
  messages: UIMessage[]
  algorithm: string
}

const algorithmConfig: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  cot: { label: "Chain-of-Thought", icon: ArrowRight, color: "text-blue-400" },
  tot: { label: "Tree-of-Thought", icon: GitBranch, color: "text-emerald-400" },
  got: { label: "Graph-of-Thought", icon: Brain, color: "text-cyan-400" },
  react: { label: "ReAct", icon: Zap, color: "text-amber-400" },
  selfask: { label: "Self-Ask", icon: HelpCircle, color: "text-orange-400" },
  custom: { label: "Custom Hybrid", icon: Sparkles, color: "text-pink-400" },
}

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function getToolInvocations(msg: UIMessage): string[] {
  if (!msg.parts || !Array.isArray(msg.parts)) return []
  return msg.parts
    .filter((p) => p.type === "tool-invocation")
    .map((p) => {
      if (p.type === "tool-invocation") {
        return p.toolInvocation.toolName
      }
      return ""
    })
    .filter(Boolean)
}

const toolLabels: Record<string, string> = {
  analyzeRequirements: "Analyze",
  reviewCode: "Review",
  expandCodeSnippet: "Expand",
  generateTests: "Tests",
  codebaseSearch: "Cody Search",
  codebaseInsights: "Cody Insights",
  cortexMetrics: "Cortex Metrics",
  cortexAIImpact: "Cortex AI",
  augmentDebug: "Augment Debug",
  augmentCodeInsight: "Augment Insight",
}

export function ReasoningTrace({ messages, algorithm }: ReasoningTraceProps) {
  const assistantMessages = messages.filter((m) => m.role === "assistant")
  const config = algorithmConfig[algorithm] || algorithmConfig.cot
  const Icon = config.icon

  if (assistantMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 mb-3">
          <Brain className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground/70">No trace yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          {"Start a conversation to see the agent's reasoning"}
        </p>
      </div>
    )
  }

  const steps: Array<{
    step: number
    preview: string
    tools: string[]
    hasTools: boolean
  }> = []

  assistantMessages.forEach((msg, idx) => {
    const text = getMessageText(msg)
    const tools = getToolInvocations(msg)
    if (text.trim() || tools.length > 0) {
      steps.push({
        step: idx + 1,
        preview: text.trim().slice(0, 200),
        tools,
        hasTools: tools.length > 0,
      })
    }
  })

  return (
    <div className="space-y-3">
      {/* Algorithm badge */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/50 px-3 py-2">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${config.color}`} />
        <span className="text-xs font-mono text-foreground/80 truncate">{config.label}</span>
        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums shrink-0">
          {steps.length} step{steps.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 overflow-auto">
        {/* Vertical line */}
        <div className="absolute left-[9px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.step} className="relative animate-fade-in">
              <div
                className={`absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold border ${
                  idx === steps.length - 1
                    ? `${config.color} bg-primary/10 border-primary/30`
                    : step.hasTools
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-muted-foreground bg-muted border-border"
                }`}
              >
                {step.step}
              </div>

              <div className="space-y-1">
                {/* Tool badges */}
                {step.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {step.tools.map((toolName, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 text-[9px] text-amber-400 font-mono bg-amber-500/10 rounded px-1.5 py-0.5"
                      >
                        <Wrench className="h-2 w-2" />
                        {toolLabels[toolName] || toolName}
                      </span>
                    ))}
                  </div>
                )}

                {/* Text preview */}
                {step.preview && (
                  <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3 break-words">
                    {step.preview}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
