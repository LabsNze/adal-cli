"use client"

import { useState, useCallback } from "react"
import {
  Search,
  FileCode,
  GitFork,
  Layers,
  BarChart3,
  Network,
  Users,
  HeartPulse,
  ArrowRight,
  Loader2,
  Activity,
  Gauge,
  ShieldCheck,
  Smile,
  TrendingUp,
  Bug,
  Wand2,
  Sparkles,
  RefreshCw,
  Eye,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { UIMessage } from "ai"

interface ToolsSidebarProps {
  onAction: (prompt: string) => void
  isStreaming: boolean
  messages: UIMessage[]
}

const codySearchTypes = [
  { value: "symbol", label: "Symbol", icon: FileCode },
  { value: "pattern", label: "Pattern", icon: Search },
  { value: "reference", label: "References", icon: GitFork },
  { value: "definition", label: "Definition", icon: ArrowRight },
  { value: "semantic", label: "Semantic", icon: Layers },
]

const codyInsights = [
  { value: "architecture", label: "Architecture", icon: Network, color: "text-blue-400" },
  { value: "dependencies", label: "Dependencies", icon: GitFork, color: "text-cyan-400" },
  { value: "complexity", label: "Complexity", icon: BarChart3, color: "text-amber-400" },
  { value: "patterns", label: "Patterns", icon: Layers, color: "text-emerald-400" },
  { value: "ownership", label: "Ownership", icon: Users, color: "text-orange-400" },
  { value: "health", label: "Health", icon: HeartPulse, color: "text-red-400" },
]

const cortexMetricTypes = [
  { value: "dora", label: "DORA Metrics", icon: Activity, color: "text-blue-400", desc: "Deployment frequency, lead time, CFR, MTTR" },
  { value: "velocity", label: "Velocity", icon: TrendingUp, color: "text-emerald-400", desc: "Cycle time, PR throughput, sprint velocity" },
  { value: "quality", label: "Quality", icon: ShieldCheck, color: "text-amber-400", desc: "Defect rate, test coverage, tech debt" },
  { value: "reliability", label: "Reliability", icon: Gauge, color: "text-red-400", desc: "Uptime, incidents, latency P99" },
  { value: "developer-experience", label: "Dev Experience", icon: Smile, color: "text-pink-400", desc: "Onboarding time, build time, DX NPS" },
]

const augmentActions = [
  { value: "debug", label: "Debug Code", icon: Bug, color: "text-red-400", desc: "Personalized context-aware debugging" },
  { value: "refactor", label: "Refactor", icon: RefreshCw, color: "text-blue-400", desc: "Extract, simplify, DRY improvements" },
  { value: "conventions", label: "Conventions", icon: Eye, color: "text-cyan-400", desc: "Style and pattern compliance check" },
  { value: "performance", label: "Performance", icon: Zap, color: "text-amber-400", desc: "Bottleneck identification and optimization" },
  { value: "readability", label: "Readability", icon: Sparkles, color: "text-emerald-400", desc: "Naming, structure, clarity improvements" },
  { value: "modernize", label: "Modernize", icon: Wand2, color: "text-pink-400", desc: "Update to latest patterns and APIs" },
]

function countToolInvocations(messages: UIMessage[], toolNames: string[]): number {
  return messages.reduce((count, msg) => {
    if (msg.role !== "assistant" || !msg.parts) return count
    return (
      count +
      msg.parts.filter(
        (p) =>
          p.type === "tool-invocation" &&
          toolNames.includes(p.toolInvocation.toolName)
      ).length
    )
  }, 0)
}

export function ToolsSidebar({ onAction, isStreaming, messages }: ToolsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("semantic")
  const [fileFilter, setFileFilter] = useState("")

  const codyCount = countToolInvocations(messages, ["codebaseSearch", "codebaseInsights"])
  const cortexCount = countToolInvocations(messages, ["cortexMetrics", "cortexAIImpact"])
  const augmentCount = countToolInvocations(messages, ["augmentDebug", "augmentCodeInsight"])

  const handleCodySearch = useCallback(() => {
    if (!searchQuery.trim()) return
    const filterPart = fileFilter.trim() ? ` Filter to files matching: ${fileFilter.trim()}.` : ""
    const prompt = `Search my codebase for: "${searchQuery}" using ${searchType} search.${filterPart} Show me the relevant code with file paths and explain how it connects to the broader system.`
    onAction(prompt)
    setSearchQuery("")
  }, [searchQuery, searchType, fileFilter, onAction])

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        {/* ===== SOURCEGRAPH CODY ===== */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 border border-border/50 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-mono text-foreground/80">Sourcegraph Cody</span>
            {codyCount > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                {codyCount} call{codyCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Code Search */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Code Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbols, patterns, code..."
                disabled={isStreaming}
                className="pl-9 bg-secondary/50 border-border h-10 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleCodySearch()
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select value={searchType} onValueChange={setSearchType} disabled={isStreaming}>
                <SelectTrigger className="bg-secondary/50 border-border h-9 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {codySearchTypes.map((st) => {
                    const StIcon = st.icon
                    return (
                      <SelectItem key={st.value} value={st.value}>
                        <div className="flex items-center gap-2">
                          <StIcon className="h-3 w-3 text-muted-foreground" />
                          <span>{st.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Button
                onClick={handleCodySearch}
                disabled={!searchQuery.trim() || isStreaming}
                size="sm"
                className="h-9 px-3"
              >
                {isStreaming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">Search</span>
              </Button>
            </div>
            <Input
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              placeholder="File filter (e.g. *.ts, src/**/*.py)"
              disabled={isStreaming}
              className="bg-secondary/50 border-border h-8 text-xs text-muted-foreground"
            />
          </div>

          {/* Cody Quick Searches */}
          <div className="space-y-1.5">
            {[
              { label: "Find dead code", prompt: "Search my codebase for dead code -- unused exports, unreachable functions, and orphaned modules. Show me what can be safely removed." },
              { label: "Find TODO/FIXME", prompt: "Search my codebase for all TODO, FIXME, HACK, and XXX comments. Organize them by priority and suggest which ones to address first." },
              { label: "Security scan", prompt: "Search my codebase for security vulnerabilities -- hardcoded secrets, SQL injection risks, XSS vectors, and missing input validation." },
            ].map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                disabled={isStreaming}
                onClick={() => onAction(item.prompt)}
                className="h-auto w-full justify-start text-left px-3 py-2 text-xs text-foreground/70 hover:text-foreground hover:bg-accent/50"
              >
                <Search className="h-3 w-3 mr-2 shrink-0 text-primary/60" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Cody Insights */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Codebase Insights
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {codyInsights.map((insight) => {
                const InsightIcon = insight.icon
                return (
                  <Button
                    key={insight.value}
                    variant="outline"
                    size="sm"
                    disabled={isStreaming}
                    onClick={() =>
                      onAction(
                        `Analyze the entire codebase and provide a ${insight.value} insight report. Include detailed metrics, diagrams, and prioritized recommendations.`
                      )
                    }
                    className="h-auto flex-col items-start gap-1 py-2 px-2.5 text-left border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors"
                  >
                    <InsightIcon className={`h-3.5 w-3.5 ${insight.color}`} />
                    <span className="text-[10px] font-medium text-foreground">{insight.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* ===== CORTEX ===== */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 border border-border/50 px-3 py-2.5">
            <BarChart3 className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-mono text-foreground/80">Cortex</span>
            {cortexCount > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                {cortexCount} call{cortexCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Engineering Metrics
            </Label>
            <div className="space-y-1.5">
              {cortexMetricTypes.map((metric) => {
                const MetricIcon = metric.icon
                return (
                  <Button
                    key={metric.value}
                    variant="ghost"
                    size="sm"
                    disabled={isStreaming}
                    onClick={() =>
                      onAction(
                        `Retrieve ${metric.value} engineering metrics for our team over the last 30 days. Show a dashboard with current values, benchmarks, trend indicators, and the top 3 areas needing improvement.`
                      )
                    }
                    className="h-auto w-full justify-start text-left px-3 py-2.5 text-xs hover:bg-accent/50 gap-3"
                  >
                    <MetricIcon className={`h-3.5 w-3.5 shrink-0 ${metric.color}`} />
                    <div className="flex flex-col items-start gap-0.5 min-w-0">
                      <span className="font-medium text-foreground/80">{metric.label}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">{metric.desc}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* AI Impact */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              AI Impact Analysis
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: "productivity", label: "Productivity", color: "text-emerald-400" },
                { value: "quality", label: "Quality", color: "text-blue-400" },
                { value: "adoption", label: "Adoption", color: "text-amber-400" },
                { value: "roi", label: "ROI", color: "text-cyan-400" },
                { value: "risk", label: "Risk", color: "text-red-400" },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant="outline"
                  size="sm"
                  disabled={isStreaming}
                  onClick={() =>
                    onAction(
                      `Analyze the AI impact on our engineering team focusing on ${item.value}. Provide before/after comparison metrics, ROI calculation, risk flags, and recommendations.`
                    )
                  }
                  className="h-auto py-2 px-2.5 text-left border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors"
                >
                  <span className={`text-[10px] font-medium ${item.color}`}>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* ===== AUGMENT CODE ===== */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 border border-border/50 px-3 py-2.5">
            <Wand2 className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-xs font-mono text-foreground/80">Augment Code</span>
            {augmentCount > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                {augmentCount} call{augmentCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Personalized Code Intelligence
            </Label>
            <div className="space-y-1.5">
              {augmentActions.map((action) => {
                const ActionIcon = action.icon
                return (
                  <Button
                    key={action.value}
                    variant="ghost"
                    size="sm"
                    disabled={isStreaming}
                    onClick={() => {
                      if (action.value === "debug") {
                        onAction(
                          "Use Augment Code's personalized debugging to analyze the code I'll provide. Diagnose the root cause, explain why the bug occurs, provide the corrected code, and add guards to prevent regression."
                        )
                      } else {
                        onAction(
                          `Use Augment Code to perform a ${action.value} analysis on the code I'll provide. Adapt suggestions to match existing coding style and conventions. Provide prioritized improvements with before/after comparisons.`
                        )
                      }
                    }}
                    className="h-auto w-full justify-start text-left px-3 py-2.5 text-xs hover:bg-accent/50 gap-3"
                  >
                    <ActionIcon className={`h-3.5 w-3.5 shrink-0 ${action.color}`} />
                    <div className="flex flex-col items-start gap-0.5 min-w-0">
                      <span className="font-medium text-foreground/80">{action.label}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">{action.desc}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
