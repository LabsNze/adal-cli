"use client";

import { CodeBlock } from "@/components/code-block";
import { Bot, User, Wrench } from "lucide-react";
import type { UIMessage } from "ai";

function parseTextWithCodeBlocks(text: string) {
  const parts: Array<
    | { type: "text"; content: string }
    | { type: "code"; language: string; content: string }
  > = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "code",
      language: match[1] || "plaintext",
      content: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts;
}

function RenderTextContent({ text }: { text: string }) {
  const parts = parseTextWithCodeBlocks(text);

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "code") {
          return (
            <CodeBlock key={i} code={part.content} language={part.language} />
          );
        }
        return (
          <div key={i} className="whitespace-pre-wrap leading-relaxed">
            {part.content}
          </div>
        );
      })}
    </>
  );
}

interface MessageItemProps {
  message: UIMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`flex-1 space-y-1 overflow-hidden ${
          isUser ? "text-right" : ""
        }`}
      >
        <p className="text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "AdaL Agent"}
        </p>
        <div
          className={`inline-block rounded-xl px-4 py-3 text-sm ${
            isUser
              ? "bg-primary text-primary-foreground max-w-[85%] ml-auto"
              : "bg-card text-card-foreground max-w-full border border-border"
          }`}
        >
          {message.parts.map((part, index) => {
            if (part.type === "text") {
              return <RenderTextContent key={index} text={part.text} />;
            }
            if (part.type === "tool-invocation") {
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 my-2 border border-border/50"
                >
                  <Wrench className="h-3 w-3 shrink-0" />
                  <span className="font-mono">
                    {part.toolInvocation.toolName}
                  </span>
                  {part.toolInvocation.state === "output-available" && (
                    <span className="text-emerald-400 ml-auto">Done</span>
                  )}
                  {(part.toolInvocation.state === "input-available" ||
                    part.toolInvocation.state === "input-streaming") && (
                    <span className="text-amber-400 ml-auto animate-pulse">
                      Running...
                    </span>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
