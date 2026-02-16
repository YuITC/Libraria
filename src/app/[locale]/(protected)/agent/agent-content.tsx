"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Bot, PanelLeftClose, PanelLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConversationMessages } from "@/actions/conversations";
import { cn } from "@/lib/utils";

const ConversationSidebar = dynamic(
  () =>
    import("@/components/agent/conversation-sidebar").then(
      (m) => m.ConversationSidebar,
    ),
  {
    loading: () => (
      <div className="w-72 glass-strong rounded-xl animate-pulse" />
    ),
  },
);
const ChatPanel = dynamic(
  () => import("@/components/agent/chat-panel").then((m) => m.ChatPanel),
  {
    loading: () => (
      <div className="flex-1 glass-strong rounded-xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

export function AgentContent() {
  const t = useTranslations("agent");
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialMessages, setInitialMessages] = useState<
    Array<{ role: "user" | "assistant" | "system"; content: string }>
  >([]);

  useEffect(() => {
    if (!activeConversationId) {
      setInitialMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const messages = await getConversationMessages(activeConversationId);
        setInitialMessages(
          messages.map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })),
        );
      } catch {
        setInitialMessages([]);
      }
    };

    loadMessages();
  }, [activeConversationId]);

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      {/* <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
        </Button>
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
      </div> */}

      {/* Main Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Sidebar */}
        <div
          className={cn(
            "transition-all duration-300",
            sidebarOpen ? "block" : "hidden md:block",
          )}
        >
          <ConversationSidebar
            activeId={activeConversationId}
            onSelect={(id) => setActiveConversationId(id || null)}
            onNew={(id) => setActiveConversationId(id)}
          />
        </div>

        {/* Chat Area */}
        {activeConversationId ? (
          <ChatPanel
            key={activeConversationId}
            conversationId={activeConversationId}
            initialMessages={initialMessages}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center glass-strong rounded-xl">
            <div className="text-center text-muted-foreground">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">{t("noConversations")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
