"use client"

import { CodeBlock } from "@/components/code-block"
import { Bot, User, Wrench, CheckCircle2, Loader2 } from "lucide-react"
import type { UIMessage } from "ai"

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function parseMarkdownText(text: string) {
  const segments: Array<
    | { type: "text"; content: string }
    | { type: "code"; language: string; content: string }
    | { type: "inline-code"; content: string }
  > = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index)
      parseInlineCode(textBefore, segments)
    }
    segments.push({
      type: "code",
      language: match[1] || "plaintext",
      content: match[2].trimEnd(),
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parseInlineCode(text.slice(lastIndex), segments)
  }

  return segments
}

function parseInlineCode(
  text: string,
  segments: Array<
    | { type: "text"; content: string }
    | { type: "code"; language: string; content: string }
    | { type: "inline-code"; content: string }
  >
) {
  const inlineCodeRegex = /`([^`]+)`/g
  let lastIdx = 0
  let inlineMatch

  while ((inlineMatch = inlineCodeRegex.exec(text)) !== null) {
    if (inlineMatch.index > lastIdx) {
      segments.push({ type: "text", content: text.slice(lastIdx, inlineMatch.index) })
    }
    segments.push({ type: "inline-code", content: inlineMatch[1] })
    lastIdx = inlineMatch.index + inlineMatch[0].length
  }

  if (lastIdx < text.length) {
    segments.push({ type: "text", content: text.slice(lastIdx) })
  }
}

function formatTextWithMarkdown(text: string) {
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary/80">$1</a>'
  )
  return formatted
}

function RenderTextContent({ text }: { text: string }) {
  const segments = parseMarkdownText(text)

  return (
    <div className="space-y-0">
      {segments.map((segment, i) => {
        if (segment.type === "code") {
          return <CodeBlock key={i} code={segment.content} language={segment.language} />
        }
        if (segment.type === "inline-code") {
          return (
            <code
              key={i}
              className="inline rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary break-all"
            >
              {segment.content}
            </code>
          )
        }
        const html = formatTextWithMarkdown(segment.content)
        return (
          <span
            key={i}
            className="whitespace-pre-wrap leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })}
    </div>
  )
}

const toolDisplayNames: Record<string, string> = {
  analyzeRequirements: "Analyzing Requirements",
  reviewCode: "Reviewing Code",
  expandCodeSnippet: "Expanding Code",
  generateTests: "Generating Tests",
  codebaseSearch: "Cody: Searching",
  codebaseInsights: "Cody: Analyzing",
  cortexMetrics: "Cortex: Metrics",
  cortexAIImpact: "Cortex: AI Impact",
  augmentDebug: "Augment: Debug",
  augmentCodeInsight: "Augment: Insights",
}

interface MessageItemProps {
  message: UIMessage
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user"
  const text = getUIMessageText(message)

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground border border-border"
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Message Body */}
      <div className={`flex-1 min-w-0 space-y-0.5 ${isUser ? "flex flex-col items-end" : ""}`}>
        <p className="text-[11px] font-medium text-muted-foreground px-1">
          {isUser ? "You" : "AdaL Agent"}
        </p>
        <div
          className={`rounded-xl text-sm overflow-hidden ${
            isUser
              ? "bg-primary text-primary-foreground px-3.5 py-2.5 max-w-[88%]"
              : "bg-card text-card-foreground px-3.5 py-2.5 border border-border"
          }`}
        >
          {message.parts.map((part, index) => {
            if (part.type === "text" && part.text.trim()) {
              return <RenderTextContent key={index} text={part.text} />
            }
            if (part.type === "tool-invocation") {
              const toolName = part.toolInvocation.toolName
              const displayName = toolDisplayNames[toolName] || toolName
              const isComplete = part.toolInvocation.state === "output-available"
              const isRunning =
                part.toolInvocation.state === "input-available" ||
                part.toolInvocation.state === "input-streaming"

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-[11px] rounded-lg px-2.5 py-2 my-1.5 border border-border/50 bg-secondary/50 overflow-hidden"
                >
                  <Wrench className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-foreground/80 truncate">{displayName}</span>
                  <span className="ml-auto flex items-center gap-1 shrink-0">
                    {isComplete && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                    {isRunning && <Loader2 className="h-3 w-3 text-amber-400 animate-spin" />}
                  </span>
                </div>
              )
            }
            return null
          })}
          {!isUser && !text.trim() && message.parts.every((p) => p.type !== "tool-invocation") && (
            <span className="text-muted-foreground">Thinking...</span>
          )}
        </div>
      </div>
    </div>
  )
}
