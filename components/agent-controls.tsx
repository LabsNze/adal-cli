"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  GitBranch,
  Brain,
  Zap,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface AgentControlsProps {
  algorithm: string;
  setAlgorithm: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  isStreaming: boolean;
}

const algorithms = [
  {
    value: "cot",
    label: "Chain-of-Thought",
    icon: ArrowRight,
    desc: "Step-by-step linear reasoning",
  },
  {
    value: "tot",
    label: "Tree-of-Thought",
    icon: GitBranch,
    desc: "Explore multiple solution branches",
  },
  {
    value: "got",
    label: "Graph-of-Thought",
    icon: Brain,
    desc: "Map concept relationships",
  },
  {
    value: "react",
    label: "ReAct",
    icon: Zap,
    desc: "Reason and act iteratively",
  },
  {
    value: "selfask",
    label: "Self-Ask",
    icon: HelpCircle,
    desc: "Decompose via sub-questions",
  },
  {
    value: "custom",
    label: "Custom Hybrid",
    icon: Sparkles,
    desc: "Best of all approaches",
  },
];

export function AgentControls({
  algorithm,
  setAlgorithm,
  temperature,
  setTemperature,
  isStreaming,
}: AgentControlsProps) {
  const selectedAlgo = algorithms.find((a) => a.value === algorithm);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Reasoning Algorithm
        </Label>
        <Select
          value={algorithm}
          onValueChange={setAlgorithm}
          disabled={isStreaming}
        >
          <SelectTrigger className="bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {algorithms.map((algo) => {
              const Icon = algo.icon;
              return (
                <SelectItem key={algo.value} value={algo.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{algo.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedAlgo && (
          <p className="text-xs text-muted-foreground">{selectedAlgo.desc}</p>
        )}
      </div>

      <Separator className="bg-border/50" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Temperature
          </Label>
          <span className="text-xs font-mono text-foreground tabular-nums">
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
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Agent Status
        </Label>
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`h-2 w-2 rounded-full ${
              isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <span className="text-foreground">
            {isStreaming ? "Processing..." : "Ready"}
          </span>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Capabilities
        </Label>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-emerald-400" />
            Code generation and expansion
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-emerald-400" />
            Autonomous code review
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-emerald-400" />
            Multi-algorithm reasoning
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-emerald-400" />
            Real-time reasoning traces
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-emerald-400" />
            Interactive code assistance
          </li>
        </ul>
      </div>
    </div>
  );
}
