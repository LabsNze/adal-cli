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
  // Bold
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
  // Italic
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // Links
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
              className="inline rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary"
            >
              {segment.content}
            </code>
          )
        }
        const html = formatTextWithMarkdown(segment.content)
        return (
          <span
            key={i}
            className="whitespace-pre-wrap leading-relaxed"
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
  codebaseSearch: "Cody: Searching Codebase",
  codebaseInsights: "Cody: Analyzing Codebase",
}

interface MessageItemProps {
  message: UIMessage
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user"
  const text = getUIMessageText(message)

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground border border-border"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Body */}
      <div className={`flex-1 min-w-0 space-y-1 ${isUser ? "flex flex-col items-end" : ""}`}>
        <p className="text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "AdaL Agent"}
        </p>
        <div
          className={`rounded-xl text-sm ${
            isUser
              ? "bg-primary text-primary-foreground px-4 py-3 max-w-[85%]"
              : "bg-card text-card-foreground px-4 py-3 border border-border max-w-full"
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
                  className="flex items-center gap-2.5 text-xs rounded-lg px-3 py-2.5 my-2 border border-border/50 bg-secondary/50"
                >
                  <Wrench className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-foreground/80">{displayName}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    {isComplete && (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Complete</span>
                      </>
                    )}
                    {isRunning && (
                      <>
                        <Loader2 className="h-3 w-3 text-amber-400 animate-spin" />
                        <span className="text-amber-400">Running</span>
                      </>
                    )}
                  </span>
                </div>
              )
            }
            return null
          })}
          {/* Show empty state for assistant messages with no text yet */}
          {!isUser && !text.trim() && message.parts.every((p) => p.type !== "tool-invocation") && (
            <span className="text-muted-foreground">Thinking...</span>
          )}
        </div>
      </div>
    </div>
  )
}
