"use client";

import { Code, FileCode, Bug, Lightbulb, Layers, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

const actions = [
  {
    icon: Code,
    label: "Generate Code",
    prompt: "Generate a Python REST API with Flask that has CRUD operations for a task manager with proper error handling, validation, and documentation",
  },
  {
    icon: FileCode,
    label: "Expand Snippet",
    prompt: "Expand this code snippet into a complete, robust implementation:\n\n```python\ndef authenticate_user(username, password):\n    pass\n```",
  },
  {
    icon: Bug,
    label: "Debug Code",
    prompt: "Review and debug this code, identify potential issues:\n\n```javascript\nasync function fetchData(url) {\n  const res = fetch(url);\n  const data = res.json();\n  return data;\n}\n```",
  },
  {
    icon: Shield,
    label: "Security Review",
    prompt: "Perform a security review of this code:\n\n```python\ndef login(request):\n    username = request.POST['username']\n    password = request.POST['password']\n    query = f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\"\n    return db.execute(query)\n```",
  },
  {
    icon: Lightbulb,
    label: "Optimize Code",
    prompt: "Optimize this code for performance and readability:\n\n```typescript\nfunction findDuplicates(arr: number[]): number[] {\n  const result = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j] && !result.includes(arr[i])) {\n        result.push(arr[i]);\n      }\n    }\n  }\n  return result;\n}\n```",
  },
  {
    icon: Layers,
    label: "Design Pattern",
    prompt: "Implement the Observer design pattern in TypeScript with a practical example for a real-time notification system. Include proper type safety and error handling.",
  },
];

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onSelect(action.prompt)}
            className="h-auto flex-col gap-1.5 py-3 px-3 text-left items-start border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all"
          >
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
