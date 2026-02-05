"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageItem } from "@/components/message-item";
import { ReasoningTrace } from "@/components/reasoning-trace";
import { AgentControls } from "@/components/agent-controls";
import { QuickActions } from "@/components/quick-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Bot,
  Brain,
  Settings,
  Trash2,
  Terminal,
} from "lucide-react";

export default function Home() {
  const [algorithm, setAlgorithm] = useState("cot");
  const [temperature, setTemperature] = useState(0.7);
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isStreaming) return;
    sendMessage({ text: messageText });
    if (!text) setInput("");
  };

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">
              AdaL Code Assistant
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Autonomous Agent + Code Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5 border border-border/50">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            {isStreaming ? "Processing" : "Ready"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden h-9 w-9 p-0"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Toggle settings</span>
          </Button>
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
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col min-w-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
              <div className="max-w-lg w-full space-y-6">
                <div className="text-center space-y-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                    <Bot className="h-7 w-7" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground text-balance">
                    AI Code Assistant
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto text-pretty">
                    An autonomous agent and code assistant working together.
                    Generate, review, expand, and optimize code with advanced
                    reasoning algorithms.
                  </p>
                </div>
                <QuickActions
                  onSelect={(prompt) => handleSubmit(prompt)}
                  disabled={isStreaming}
                />
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
                {isStreaming && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs ml-2">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me to generate, review, expand, or optimize code..."
                  disabled={isStreaming}
                  className="min-h-[52px] max-h-[200px] resize-none pr-14 bg-background border-border text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isStreaming}
                  size="sm"
                  className="absolute bottom-2 right-2 h-9 w-9 p-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 text-center">
                Powered by AI SDK + Anthropic Claude. Shift+Enter for new line.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop always visible, Mobile toggleable */}
        <aside
          className={`${
            showSidebar ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-80 lg:w-96 border-l border-border bg-card/30 shrink-0 absolute md:relative inset-0 md:inset-auto z-20 bg-background md:bg-transparent`}
        >
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
            <span className="text-sm font-medium text-foreground">
              Settings
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(false)}
              className="h-8 w-8 p-0"
            >
              <span className="text-lg leading-none">&times;</span>
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>

          <Tabs defaultValue="controls" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-none border-b border-border h-auto p-0">
              <TabsTrigger
                value="controls"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-xs"
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Controls
              </TabsTrigger>
              <TabsTrigger
                value="trace"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-xs"
              >
                <Brain className="h-3.5 w-3.5 mr-1.5" />
                Reasoning
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="controls"
              className="flex-1 overflow-auto p-4 mt-0"
            >
              <AgentControls
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
                temperature={temperature}
                setTemperature={setTemperature}
                isStreaming={isStreaming}
              />
            </TabsContent>
            <TabsContent
              value="trace"
              className="flex-1 overflow-auto p-4 mt-0"
            >
              <ReasoningTrace messages={messages} algorithm={algorithm} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
