"use client"

import { useState, useCallback } from "react"
import { Check, Copy, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  code: string
  language?: string
}

const languageLabels: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  py: "Python",
  python: "Python",
  rust: "Rust",
  go: "Go",
  java: "Java",
  cpp: "C++",
  c: "C",
  cs: "C#",
  csharp: "C#",
  rb: "Ruby",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  plaintext: "Text",
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = code
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [code])

  const displayLang = language ? languageLabels[language.toLowerCase()] || language : "Code"

  return (
    <div className="relative rounded-lg border border-border bg-secondary/50 overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1.5">
          <FileCode className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] font-mono text-muted-foreground">{displayLang}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1 px-2 text-muted-foreground hover:text-foreground min-h-[28px]"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
          <span className="sr-only">{copied ? "Copied to clipboard" : "Copy code"}</span>
        </Button>
      </div>
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <pre className="p-3 text-[13px] leading-relaxed">
          <code className="font-mono text-foreground/90">{code}</code>
        </pre>
      </div>
    </div>
  )
}
