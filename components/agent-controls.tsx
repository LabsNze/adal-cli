"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ArrowRight,
  GitBranch,
  Brain,
  Zap,
  HelpCircle,
  Sparkles,
  Shield,
  Code,
  Bug,
  FlaskConical,
  Search,
  BarChart3,
  Wand2,
} from "lucide-react"

interface AgentControlsProps {
  algorithm: string
  setAlgorithm: (val: string) => void
  temperature: number
  setTemperature: (val: number) => void
  isStreaming: boolean
}

const algorithms = [
  {
    value: "cot",
    label: "Chain-of-Thought",
    icon: ArrowRight,
    desc: "Step-by-step linear reasoning for straightforward tasks",
    best: "General coding, explanations",
  },
  {
    value: "tot",
    label: "Tree-of-Thought",
    icon: GitBranch,
    desc: "Explores multiple solution branches and picks the best",
    best: "Architecture, complex logic",
  },
  {
    value: "got",
    label: "Graph-of-Thought",
    icon: Brain,
    desc: "Maps concept relationships and dependency graphs",
    best: "System design, refactoring",
  },
  {
    value: "react",
    label: "ReAct",
    icon: Zap,
    desc: "Iteratively reasons and acts, refining with each step",
    best: "Debugging, iterative improvement",
  },
  {
    value: "selfask",
    label: "Self-Ask",
    icon: HelpCircle,
    desc: "Decomposes problems via targeted sub-questions",
    best: "Research, complex requirements",
  },
  {
    value: "custom",
    label: "Custom Hybrid",
    icon: Sparkles,
    desc: "Combines multiple strategies for maximum thoroughness",
    best: "Complex multi-faceted tasks",
  },
]

export function AgentControls({
  algorithm,
  setAlgorithm,
  temperature,
  setTemperature,
  isStreaming,
}: AgentControlsProps) {
  const selectedAlgo = algorithms.find((a) => a.value === algorithm)

  return (
    <div className="space-y-6">
      {/* Algorithm Selection */}
      <div className="space-y-2.5">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Reasoning Algorithm
        </Label>
        <Select value={algorithm} onValueChange={setAlgorithm} disabled={isStreaming}>
          <SelectTrigger className="bg-secondary/50 border-border h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {algorithms.map((algo) => {
              const AlgoIcon = algo.icon
              return (
                <SelectItem key={algo.value} value={algo.value}>
                  <div className="flex items-center gap-2">
                    <AlgoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{algo.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {selectedAlgo && (
          <div className="space-y-1 rounded-lg bg-muted/20 border border-border/30 px-3 py-2.5">
            <p className="text-xs text-foreground/70">{selectedAlgo.desc}</p>
            <p className="text-[10px] text-muted-foreground">
              Best for: <span className="text-foreground/60">{selectedAlgo.best}</span>
            </p>
          </div>
        )}
      </div>

      <Separator className="bg-border/30" />

      {/* Temperature Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Temperature
          </Label>
          <span className="text-xs font-mono text-primary tabular-nums bg-primary/10 rounded px-1.5 py-0.5">
            {temperature.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[temperature]}
          onValueChange={([val]) => setTemperature(val)}
          min={0}
          max={1}
          step={0.1}
          disabled={isStreaming}
          className="py-1"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Precise (0.0)</span>
          <span>Balanced (0.5)</span>
          <span>Creative (1.0)</span>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Agent Status */}
      <div className="space-y-2.5">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Agent Status
        </Label>
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 border border-border/30 px-3 py-2.5">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <span className="text-sm text-foreground">{isStreaming ? "Processing..." : "Ready"}</span>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Capabilities */}
      <div className="space-y-2.5">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Agent Capabilities
        </Label>
        <div className="space-y-2">
          {[
            { icon: Code, label: "Code generation and expansion", color: "text-blue-400" },
            { icon: Bug, label: "Debugging and error analysis", color: "text-red-400" },
            { icon: Shield, label: "Security review and auditing", color: "text-emerald-400" },
            { icon: Brain, label: "Multi-algorithm reasoning", color: "text-cyan-400" },
            { icon: FlaskConical, label: "Test case generation", color: "text-amber-400" },
            { icon: Search, label: "Cody codebase search & insights", color: "text-primary" },
            { icon: BarChart3, label: "Cortex engineering metrics & AI impact", color: "text-violet-400" },
            { icon: Wand2, label: "Augment personalized debugging & insights", color: "text-teal-400" },
            { icon: Sparkles, label: "Design pattern guidance", color: "text-pink-400" },
          ].map((cap) => {
            const CapIcon = cap.icon
            return (
              <div key={cap.label} className="flex items-center gap-2.5 text-xs text-foreground/70">
                <CapIcon className={`h-3.5 w-3.5 ${cap.color}`} />
                {cap.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
