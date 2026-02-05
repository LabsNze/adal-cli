"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { MessageItem } from "@/components/message-item"
import { ReasoningTrace } from "@/components/reasoning-trace"
import { AgentControls } from "@/components/agent-controls"
import { QuickActions } from "@/components/quick-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Send,
  Bot,
  Brain,
  Settings,
  Trash2,
  Terminal,
  X,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"

export default function Home() {
  const [algorithm, setAlgorithm] = useState("cot")
  const [temperature, setTemperature] = useState(0.7)
  const [input, setInput] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [desktopSidebar, setDesktopSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages: msgs }) => ({
        body: {
          messages: msgs,
          id,
          algorithm,
          temperature,
        },
      }),
    }),
  })

  const isStreaming = status === "streaming" || status === "submitted"

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = useCallback(
    (text?: string) => {
      const messageText = text || input
      if (!messageText.trim() || isStreaming) return
      sendMessage({ text: messageText })
      if (!text) {
        setInput("")
        // Refocus the textarea after sending
        setTimeout(() => textareaRef.current?.focus(), 0)
      }
    },
    [input, isStreaming, sendMessage]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 bg-card/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none font-mono">
              AdaL Code Assistant
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Autonomous Agent + Code Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Status Badge - desktop only */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-full px-3 py-1.5 border border-border/50">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            {isStreaming ? "Processing" : "Ready"}
          </div>
          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDesktopSidebar(!desktopSidebar)}
            className="hidden md:flex h-9 w-9 p-0 text-muted-foreground"
          >
            {desktopSidebar ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(true)}
            className="md:hidden h-9 w-9 p-0 text-muted-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Open settings</span>
          </Button>
          {/* Clear conversation */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear conversation</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col min-w-0">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
              <div className="max-w-lg w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto border border-primary/20">
                    <Bot className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground text-balance font-mono">
                      AI Code Assistant
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto text-pretty">
                      An autonomous agent and code assistant working together to generate solid,
                      robust, production-ready code.
                    </p>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Multi-algorithm reasoning",
                    "Code generation",
                    "Security review",
                    "Test generation",
                    "Debugging",
                  ].map((feature) => (
                    <span
                      key={feature}
                      className="text-[11px] text-muted-foreground bg-secondary/50 border border-border/50 rounded-full px-3 py-1"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <QuickActions onSelect={(prompt) => handleSubmit(prompt)} disabled={isStreaming} />
              </div>
            </div>
          ) : (
            /* Messages */
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}

                {/* Streaming indicator when no message parts exist yet */}
                {isStreaming &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === "user" && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground border border-border">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span className="text-xs ml-1">Agent is thinking...</span>
                      </div>
                    </div>
                  )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className="border-t border-border bg-card/60 backdrop-blur-md p-4 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe what you want to build, debug, review, or optimize..."
                  disabled={isStreaming}
                  className="min-h-[56px] max-h-[200px] resize-none pr-14 bg-background border-border text-base leading-relaxed"
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <Button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isStreaming}
                  size="sm"
                  className="absolute bottom-2.5 right-2.5 h-9 w-9 p-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-[11px] text-muted-foreground">
                  <span className="hidden sm:inline">Powered by Claude Sonnet. </span>
                  Shift+Enter for new line.
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {algorithm.toUpperCase()} | T:{temperature.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop */}
        {desktopSidebar && (
          <aside className="hidden md:flex flex-col w-80 lg:w-96 border-l border-border bg-card/30 shrink-0">
            <Tabs defaultValue="controls" className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-none border-b border-border h-auto p-0">
                <TabsTrigger
                  value="controls"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Controls
                </TabsTrigger>
                <TabsTrigger
                  value="trace"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs gap-1.5"
                >
                  <Brain className="h-3.5 w-3.5" />
                  Reasoning
                </TabsTrigger>
              </TabsList>
              <TabsContent value="controls" className="flex-1 overflow-auto p-4 mt-0">
                <AgentControls
                  algorithm={algorithm}
                  setAlgorithm={setAlgorithm}
                  temperature={temperature}
                  setTemperature={setTemperature}
                  isStreaming={isStreaming}
                />
              </TabsContent>
              <TabsContent value="trace" className="flex-1 overflow-auto p-4 mt-0">
                <ReasoningTrace messages={messages} algorithm={algorithm} />
              </TabsContent>
            </Tabs>
          </aside>
        )}

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setShowSidebar(false)}
              role="presentation"
            />
            {/* Panel */}
            <aside className="fixed inset-y-0 right-0 w-[85vw] max-w-sm flex flex-col z-40 bg-background border-l border-border md:hidden animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Agent Settings</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close settings</span>
                </Button>
              </div>

              <Tabs defaultValue="controls" className="flex flex-col flex-1 overflow-hidden">
                <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-none border-b border-border h-auto p-0">
                  <TabsTrigger
                    value="controls"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs gap-1.5"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Controls
                  </TabsTrigger>
                  <TabsTrigger
                    value="trace"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs gap-1.5"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    Reasoning
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="controls" className="flex-1 overflow-auto p-4 mt-0">
                  <AgentControls
                    algorithm={algorithm}
                    setAlgorithm={setAlgorithm}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    isStreaming={isStreaming}
                  />
                </TabsContent>
                <TabsContent value="trace" className="flex-1 overflow-auto p-4 mt-0">
                  <ReasoningTrace messages={messages} algorithm={algorithm} />
                </TabsContent>
              </Tabs>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
