"use client"

import type { UIMessage } from "ai"
import { Brain, GitBranch, Zap, ArrowRight, HelpCircle, Sparkles, Wrench } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  analyzeRequirements: "Analyze Requirements",
  reviewCode: "Review Code",
  expandCodeSnippet: "Expand Code",
  generateTests: "Generate Tests",
}

export function ReasoningTrace({ messages, algorithm }: ReasoningTraceProps) {
  const assistantMessages = messages.filter((m) => m.role === "assistant")
  const config = algorithmConfig[algorithm] || algorithmConfig.cot
  const Icon = config.icon

  if (assistantMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 mb-4">
          <Brain className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground/70">No reasoning trace yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          Start a conversation to see the agent&apos;s reasoning process
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
        preview: text.trim().slice(0, 300),
        tools,
        hasTools: tools.length > 0,
      })
    }
  })

  return (
    <div className="space-y-4">
      {/* Algorithm badge */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/50 px-3 py-2">
        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
        <span className="text-xs font-mono text-foreground/80">{config.label}</span>
        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
          {steps.length} step{steps.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <ScrollArea className="max-h-[calc(100vh-320px)]">
        <div className="relative pl-7">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-5">
            {steps.map((step, idx) => (
              <div key={step.step} className="relative">
                {/* Step number circle */}
                <div
                  className={`absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border ${
                    idx === steps.length - 1
                      ? `${config.color} bg-primary/10 border-primary/30`
                      : step.hasTools
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        : "text-muted-foreground bg-muted border-border"
                  }`}
                >
                  {step.step}
                </div>

                <div className="space-y-1.5">
                  {/* Tool badges */}
                  {step.tools.map((toolName, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono"
                    >
                      <Wrench className="h-2.5 w-2.5" />
                      {toolLabels[toolName] || toolName}
                    </div>
                  ))}

                  {/* Text preview */}
                  {step.preview && (
                    <p className="text-xs text-foreground/70 leading-relaxed line-clamp-4">
                      {step.preview}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
