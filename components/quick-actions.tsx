"use client"

import { Code, Bug, Shield, Search, BarChart3, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  onSelect: (prompt: string) => void
  disabled: boolean
}

const actions = [
  {
    icon: Code,
    label: "Generate",
    description: "Code generation",
    prompt:
      "Generate a Python REST API with Flask that has CRUD operations for a task manager, including proper error handling, input validation, and documentation.",
  },
  {
    icon: Bug,
    label: "Debug",
    description: "Augment debug",
    prompt:
      "Use Augment Code to debug this code, identify root cause, and fix:\n\n```javascript\nasync function fetchData(url) {\n  const res = fetch(url);\n  const data = res.json();\n  return data;\n}\n```",
  },
  {
    icon: Shield,
    label: "Security",
    description: "Vulnerability audit",
    prompt:
      "Perform a thorough security review of this code, identify all vulnerabilities, and provide secure alternatives:\n\n```python\ndef login(request):\n    username = request.POST['username']\n    password = request.POST['password']\n    query = f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\"\n    return db.execute(query)\n```",
  },
  {
    icon: Search,
    label: "Cody",
    description: "Codebase search",
    prompt:
      "Search my codebase and provide a comprehensive health report. Analyze the architecture, identify code quality issues, find dead code, and suggest the top 5 improvements.",
  },
  {
    icon: BarChart3,
    label: "Cortex",
    description: "DORA metrics",
    prompt:
      "Retrieve DORA metrics and engineering velocity data for our team over the last 30 days. Show deployment frequency, lead time, change failure rate, and mean time to recovery with benchmark comparisons.",
  },
  {
    icon: Wand2,
    label: "Refactor",
    description: "Augment insights",
    prompt:
      "Use Augment Code to analyze and refactor this code for better readability, performance, and modern patterns:\n\n```typescript\nfunction findDuplicates(arr: number[]): number[] {\n  const result = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j] && !result.includes(arr[i])) {\n        result.push(arr[i]);\n      }\n    }\n  }\n  return result;\n}\n```",
  },
]

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {actions.map((action) => {
        const ActionIcon = action.icon
        return (
          <Button
            key={action.label}
            variant="outline"
            disabled={disabled}
            onClick={() => onSelect(action.prompt)}
            className="h-auto flex-col items-start gap-1 py-3 px-3 text-left border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 active:scale-[0.98] transition-all min-h-[72px]"
          >
            <ActionIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-medium text-foreground leading-tight">{action.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{action.description}</span>
          </Button>
        )
      })}
    </div>
  )
}
