"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { MessageItem } from "@/components/message-item"
import { ReasoningTrace } from "@/components/reasoning-trace"
import { AgentControls } from "@/components/agent-controls"
import { QuickActions } from "@/components/quick-actions"
import { ToolsSidebar } from "@/components/tools-sidebar"
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
  Wrench,
} from "lucide-react"

export default function Home() {
  const [algorithm, setAlgorithm] = useState("cot")
  const [temperature, setTemperature] = useState(0.7)
  const [input, setInput] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [desktopSidebar, setDesktopSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const algorithmRef = useRef(algorithm)
  const temperatureRef = useRef(temperature)
  useEffect(() => {
    algorithmRef.current = algorithm
  }, [algorithm])
  useEffect(() => {
    temperatureRef.current = temperature
  }, [temperature])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages: msgs }) => ({
          body: {
            messages: msgs,
            id,
            algorithm: algorithmRef.current,
            temperature: temperatureRef.current,
          },
        }),
      }),
    []
  )

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
  })

  const isStreaming = status === "streaming" || status === "submitted"

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
      <header className="flex items-center justify-between border-b border-border px-3 py-2.5 md:px-4 md:py-3 bg-card/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Terminal className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground leading-none font-mono truncate">
              AdaL
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              AI Code Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Status dot - mobile */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground md:bg-secondary/50 md:rounded-full md:px-3 md:py-1.5 md:border md:border-border/50">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span className="hidden md:inline">{isStreaming ? "Processing" : "Ready"}</span>
          </div>
          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDesktopSidebar(!desktopSidebar)}
            className="hidden md:flex h-10 w-10"
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
            size="icon"
            onClick={() => setShowSidebar(true)}
            className="md:hidden h-10 w-10"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Open settings</span>
          </Button>
          {/* Clear */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessages([])}
              className="h-10 w-10 text-muted-foreground hover:text-destructive"
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
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 overflow-auto scrollbar-hidden">
              <div className="max-w-lg w-full space-y-6">
                <div className="text-center space-y-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto border border-primary/20">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-semibold text-foreground text-balance font-mono">
                      AI Code Assistant
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto text-pretty">
                      Autonomous agent and code assistant generating solid, production-ready code.
                    </p>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    "Multi-algorithm",
                    "Cody search",
                    "Cortex metrics",
                    "Augment Code",
                    "Security review",
                  ].map((feature) => (
                    <span
                      key={feature}
                      className="text-[11px] text-muted-foreground bg-secondary/50 border border-border/50 rounded-full px-2.5 py-1"
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
              <div className="max-w-3xl mx-auto px-3 py-4 md:px-4 md:py-6 space-y-4 md:space-y-6">
                {messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}

                {/* Streaming indicator */}
                {isStreaming &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === "user" && (
                    <div className="flex gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground border border-border">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-2.5">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span className="text-xs">Thinking...</span>
                      </div>
                    </div>
                  )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className="border-t border-border bg-card/60 backdrop-blur-md px-3 py-2.5 md:px-4 md:py-3 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What do you want to build?"
                  disabled={isStreaming}
                  className="min-h-[48px] max-h-[120px] md:max-h-[200px] resize-none pr-12 bg-background border-border text-base leading-relaxed rounded-xl"
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <Button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isStreaming}
                  size="icon"
                  className="absolute bottom-1.5 right-1.5 h-9 w-9 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <p className="text-[10px] text-muted-foreground">
                  Shift+Enter for new line
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {algorithm.toUpperCase()} | T:{temperature.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop */}
        {desktopSidebar && (
          <aside className="hidden md:flex flex-col w-80 lg:w-96 border-l border-border bg-card/30 shrink-0">
            <Tabs defaultValue="tools" className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-3 bg-transparent rounded-none border-b border-border h-auto p-0">
                <TabsTrigger
                  value="controls"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Controls
                </TabsTrigger>
                <TabsTrigger
                  value="tools"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs gap-1.5"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Tools
                </TabsTrigger>
                <TabsTrigger
                  value="trace"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs gap-1.5"
                >
                  <Brain className="h-3.5 w-3.5" />
                  Trace
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
              <TabsContent value="tools" className="flex-1 overflow-auto mt-0">
                <ToolsSidebar
                  onAction={(prompt) => handleSubmit(prompt)}
                  isStreaming={isStreaming}
                  messages={messages}
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
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setShowSidebar(false)}
              role="presentation"
            />
            <aside className="fixed inset-y-0 right-0 w-full max-w-[340px] flex flex-col z-40 bg-background border-l border-border md:hidden animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
                <span className="text-sm font-semibold text-foreground">Settings</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <Tabs defaultValue="tools" className="flex flex-col flex-1 overflow-hidden">
                <TabsList className="grid w-full grid-cols-3 bg-transparent rounded-none border-b border-border h-auto p-0 shrink-0">
                  <TabsTrigger
                    value="controls"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none min-h-[44px] text-xs gap-1"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Controls
                  </TabsTrigger>
                  <TabsTrigger
                    value="tools"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none min-h-[44px] text-xs gap-1"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Tools
                  </TabsTrigger>
                  <TabsTrigger
                    value="trace"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none min-h-[44px] text-xs gap-1"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    Trace
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="controls" className="flex-1 overflow-auto p-3 mt-0">
                  <AgentControls
                    algorithm={algorithm}
                    setAlgorithm={setAlgorithm}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    isStreaming={isStreaming}
                  />
                </TabsContent>
                <TabsContent value="tools" className="flex-1 overflow-auto mt-0">
                  <ToolsSidebar
                    onAction={(prompt) => {
                      handleSubmit(prompt)
                      setShowSidebar(false)
                    }}
                    isStreaming={isStreaming}
                    messages={messages}
                  />
                </TabsContent>
                <TabsContent value="trace" className="flex-1 overflow-auto p-3 mt-0">
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
