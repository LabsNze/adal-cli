"use client"

import { Code, FileCode, Bug, Lightbulb, Layers, Shield, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  onSelect: (prompt: string) => void
  disabled: boolean
}

const actions = [
  {
    icon: Code,
    label: "Generate Code",
    description: "REST API with CRUD",
    prompt:
      "Generate a Python REST API with Flask that has CRUD operations for a task manager, including proper error handling, input validation, and documentation.",
  },
  {
    icon: FileCode,
    label: "Expand Snippet",
    description: "Signature to full impl",
    prompt:
      "Expand this code snippet into a complete, robust implementation with error handling, types, validation, and documentation:\n\n```python\ndef authenticate_user(username, password):\n    pass\n```",
  },
  {
    icon: Bug,
    label: "Debug Code",
    description: "Find and fix bugs",
    prompt:
      "Review and debug this code, identify all potential issues, and provide fixes:\n\n```javascript\nasync function fetchData(url) {\n  const res = fetch(url);\n  const data = res.json();\n  return data;\n}\n```",
  },
  {
    icon: Shield,
    label: "Security Review",
    description: "Audit vulnerabilities",
    prompt:
      "Perform a thorough security review of this code, identify all vulnerabilities, and provide secure alternatives:\n\n```python\ndef login(request):\n    username = request.POST['username']\n    password = request.POST['password']\n    query = f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\"\n    return db.execute(query)\n```",
  },
  {
    icon: Lightbulb,
    label: "Optimize Code",
    description: "Improve performance",
    prompt:
      "Optimize this code for performance and readability, explain the improvements:\n\n```typescript\nfunction findDuplicates(arr: number[]): number[] {\n  const result = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j] && !result.includes(arr[i])) {\n        result.push(arr[i]);\n      }\n    }\n  }\n  return result;\n}\n```",
  },
  {
    icon: Layers,
    label: "Design Pattern",
    description: "TypeScript patterns",
    prompt:
      "Implement the Observer design pattern in TypeScript with a practical example for a real-time notification system. Include proper type safety, error handling, and usage examples.",
  },
  {
    icon: Search,
    label: "Codebase Search",
    description: "Cody-powered insights",
    prompt:
      "Search my codebase and provide a comprehensive health report. Analyze the architecture, identify code quality issues, find dead code, and suggest the top 5 improvements I should prioritize.",
  },
]

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {actions.map((action) => {
        const ActionIcon = action.icon
        return (
          <Button
            key={action.label}
            variant="outline"
            disabled={disabled}
            onClick={() => onSelect(action.prompt)}
            className="h-auto flex-col items-start gap-1.5 py-3.5 px-3.5 text-left border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors"
          >
            <ActionIcon className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-foreground">{action.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{action.description}</span>
          </Button>
        )
      })}
    </div>
  )
}
