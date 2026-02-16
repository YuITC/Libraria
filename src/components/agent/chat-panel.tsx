"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useTranslations } from "next-intl";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, TypingIndicator } from "./chat-message";
import { toast } from "sonner";
import { saveMessage } from "@/actions/conversations";

interface ChatPanelProps {
  conversationId: string;
  initialMessages?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

export function ChatPanel({
  conversationId,
  initialMessages = [],
}: ChatPanelProps) {
  const t = useTranslations("agent");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: initialMessages.map((m, i) => ({
      id: `init-${i}`,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    })),
    onFinish: ({ message }) => {
      const text = message.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
      saveMessage(conversationId, "assistant", text).catch(() => {});
    },
    onError: (err) => {
      console.error("AI Chat Error:", err);
      toast.error(err.message || "An error occurred with the AI service");
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const isLoading = status === "streaming" || status === "submitted";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const text = inputValue.trim();
    setInputValue("");

    // Persist user message
    await saveMessage(conversationId, "user", text).catch(() => {});

    // Send to AI
    sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  const isStreaming = status === "streaming";

  return (
    <div className="flex-1 flex flex-col glass-strong rounded-xl overflow-hidden">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isStreaming && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4">
        <form
          onSubmit={onSubmit}
          className="max-w-3xl mx-auto flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputValue(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={t("inputPlaceholder")}
              rows={1}
              className="w-full resize-none rounded-xl glass-subtle border border-border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32 min-h-[44px]"
              style={{
                height: "auto",
                overflow: inputValue.split("\n").length > 3 ? "auto" : "hidden",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className="rounded-xl gradient-primary text-primary-foreground shrink-0 h-[44px] w-[44px]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// Empty State
// =============================================================================

function EmptyState() {
  const t = useTranslations("agent");

  const suggestions = [
    { icon: "📚", text: t("suggestions.search") },
    { icon: "➕", text: t("suggestions.add") },
    { icon: "📊", text: t("suggestions.analyze") },
    { icon: "🌐", text: t("suggestions.web") },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{t("welcomeTitle")}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {t("welcomeDescription")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="glass-subtle rounded-xl p-3 text-left text-sm hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <span className="mr-2">{s.icon}</span>
            {s.text}
          </div>
        ))}
      </div>
    </div>
  );
}
