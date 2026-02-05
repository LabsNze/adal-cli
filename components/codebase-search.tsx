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
import type { UIMessage } from "ai"

interface CodebaseSearchProps {
  onSearch: (prompt: string) => void
  onInsight: (prompt: string) => void
  isStreaming: boolean
  messages: UIMessage[]
}

const searchTypes = [
  {
    value: "symbol",
    label: "Symbol",
    icon: FileCode,
    desc: "Find functions, classes, variables by name",
  },
  {
    value: "pattern",
    label: "Pattern",
    icon: Search,
    desc: "Regex/glob pattern matching",
  },
  {
    value: "reference",
    label: "References",
    icon: GitFork,
    desc: "Find all usages of a symbol",
  },
  {
    value: "definition",
    label: "Definition",
    icon: ArrowRight,
    desc: "Go to where it is defined",
  },
  {
    value: "semantic",
    label: "Semantic",
    icon: Layers,
    desc: "Natural language code search",
  },
]

const insightTypes = [
  {
    value: "architecture",
    label: "Architecture",
    icon: Network,
    desc: "Module structure and boundaries",
    color: "text-blue-400",
  },
  {
    value: "dependencies",
    label: "Dependencies",
    icon: GitFork,
    desc: "Import/export graph",
    color: "text-cyan-400",
  },
  {
    value: "complexity",
    label: "Complexity",
    icon: BarChart3,
    desc: "Cyclomatic and cognitive scores",
    color: "text-amber-400",
  },
  {
    value: "patterns",
    label: "Patterns",
    icon: Layers,
    desc: "Design pattern detection",
    color: "text-emerald-400",
  },
  {
    value: "ownership",
    label: "Ownership",
    icon: Users,
    desc: "Contributor analysis",
    color: "text-orange-400",
  },
  {
    value: "health",
    label: "Health",
    icon: HeartPulse,
    desc: "Quality scorecard",
    color: "text-red-400",
  },
]

export function CodebaseSearch({
  onSearch,
  onInsight,
  isStreaming,
  messages,
}: CodebaseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("semantic")
  const [fileFilter, setFileFilter] = useState("")

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return
    const filterPart = fileFilter.trim()
      ? ` Filter to files matching: ${fileFilter.trim()}.`
      : ""
    const prompt = `Search my codebase for: "${searchQuery}" using ${searchType} search.${filterPart} Show me the relevant code with file paths and explain how it connects to the broader system.`
    onSearch(prompt)
    setSearchQuery("")
  }, [searchQuery, searchType, fileFilter, onSearch])

  const handleInsight = useCallback(
    (type: string, target?: string) => {
      const targetStr = target || "the entire codebase"
      const prompt = `Analyze ${targetStr} and provide a ${type} insight report. Include detailed metrics, visual diagrams, and prioritized recommendations.`
      onInsight(prompt)
    },
    [onInsight]
  )

  // Count Cody tool invocations from messages
  const codyToolCount = messages.reduce((count, msg) => {
    if (msg.role !== "assistant" || !msg.parts) return count
    return (
      count +
      msg.parts.filter(
        (p) =>
          p.type === "tool-invocation" &&
          (p.toolInvocation.toolName === "codebaseSearch" ||
            p.toolInvocation.toolName === "codebaseInsights")
      ).length
    )
  }, 0)

  return (
    <div className="space-y-5">
      {/* Cody Badge */}
      <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 border border-border/50 px-3 py-2.5">
        <Search className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-mono text-foreground/80">
          Sourcegraph Cody
        </span>
        {codyToolCount > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
            {codyToolCount} search{codyToolCount !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-2.5">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Code Search
        </Label>
        <div className="space-y-2">
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
                  handleSearch()
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={searchType}
              onValueChange={setSearchType}
              disabled={isStreaming}
            >
              <SelectTrigger className="bg-secondary/50 border-border h-9 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {searchTypes.map((st) => {
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
              onClick={handleSearch}
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

        {/* Search type description */}
        {searchType && (
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {searchTypes.find((s) => s.value === searchType)?.desc}
          </p>
        )}
      </div>

      <Separator className="bg-border/30" />

      {/* Quick Searches */}
      <div className="space-y-2.5">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Quick Searches
        </Label>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            {
              label: "Find dead code",
              prompt:
                'Search my codebase for dead code -- unused exports, unreachable functions, and orphaned modules. Show me what can be safely removed.',
            },
            {
              label: "Find TODO/FIXME",
              prompt:
                'Search my codebase for all TODO, FIXME, HACK, and XXX comments. Organize them by priority and suggest which ones to address first.',
            },
            {
              label: "Find security issues",
              prompt:
                'Search my codebase for security vulnerabilities -- hardcoded secrets, SQL injection risks, XSS vectors, unsafe deserialization, and missing input validation.',
            },
            {
              label: "Find duplicated code",
              prompt:
                'Search my codebase for code duplication -- similar functions, copy-pasted logic, and repeated patterns that could be refactored into shared utilities.',
            },
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              disabled={isStreaming}
              onClick={() => onSearch(item.prompt)}
              className="h-auto justify-start text-left px-3 py-2 text-xs text-foreground/70 hover:text-foreground hover:bg-accent/50"
            >
              <Search className="h-3 w-3 mr-2 shrink-0 text-primary/60" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Codebase Insights */}
      <div className="space-y-2.5">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Codebase Insights
        </Label>
        <div className="grid grid-cols-2 gap-1.5">
          {insightTypes.map((insight) => {
            const InsightIcon = insight.icon
            return (
              <Button
                key={insight.value}
                variant="outline"
                size="sm"
                disabled={isStreaming}
                onClick={() => handleInsight(insight.value)}
                className="h-auto flex-col items-start gap-1 py-2.5 px-3 text-left border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors"
              >
                <InsightIcon className={`h-3.5 w-3.5 ${insight.color}`} />
                <span className="text-[11px] font-medium text-foreground">
                  {insight.label}
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight">
                  {insight.desc}
                </span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
