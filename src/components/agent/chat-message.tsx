"use client";

import { memo } from "react";
import { Bot, User, Wrench, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UIMessage, DynamicToolUIPart } from "ai";

// =============================================================================
// Message Bubble
// =============================================================================

interface ChatMessageProps {
  message: UIMessage;
}

export const ChatMessage = memo(function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  // Extract text content from parts
  const textContent = message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");

  // Extract tool invocations from parts (SDK v6: type is 'dynamic-tool')
  const toolParts: DynamicToolUIPart[] = [];
  for (const part of message.parts) {
    if (part.type === "dynamic-tool") {
      toolParts.push(part);
    }
  }

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isUser ? "bg-primary/10" : "gradient-primary",
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-4 py-3",
          isUser ? "glass-strong ml-auto" : "bg-muted/30",
        )}
      >
        {/* Tool invocations */}
        {toolParts.map((part, i) => (
          <ToolCallBadge key={i} toolName={part.toolName} state={part.state} />
        ))}

        {/* Text content */}
        {textContent && (
          <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <MessageContent content={textContent} />
          </div>
        )}
      </div>
    </div>
  );
});

// =============================================================================
// Message Content (Simple Markdown)
// =============================================================================

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="font-semibold text-sm mt-3 mb-1">
          {line.slice(4)}
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="font-bold text-base mt-3 mb-1">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="font-bold text-lg mt-3 mb-1">
          {line.slice(2)}
        </h2>,
      );
    } else if (line.match(/^[-*]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        listItems.push(lines[i].replace(/^[-*]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-0.5 my-1">
          {listItems.map((item, j) => (
            <li key={j}>
              <InlineFormatted text={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    } else if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          className="list-decimal list-inside space-y-0.5 my-1"
        >
          {listItems.map((item, j) => (
            <li key={j}>
              <InlineFormatted text={item} />
            </li>
          ))}
        </ol>,
      );
      continue;
    } else if (!line.trim()) {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <p key={i} className="my-1">
          <InlineFormatted text={line} />
        </p>,
      );
    }

    i++;
  }

  return <>{elements}</>;
}

// =============================================================================
// Inline Formatting
// =============================================================================

function InlineFormatted({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="bg-muted/50 px-1 py-0.5 rounded text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

// =============================================================================
// Tool Call Badge
// =============================================================================

function ToolCallBadge({
  toolName,
  state,
}: {
  toolName: string;
  state: string;
}) {
  const toolLabels: Record<string, string> = {
    search_media: "🔍 Searching media...",
    create_media: "➕ Creating media...",
    update_media: "✏️ Updating media...",
    delete_media: "🗑️ Deleting media...",
    analyze_data: "📊 Analyzing data...",
    search_web: "🌐 Searching the web...",
    search_collections: "📂 Searching collections...",
    create_collection: "📁 Creating collection...",
    add_media_to_collection: "📥 Adding to collection...",
    remove_media_from_collection: "📤 Removing from collection...",
    delete_collection: "🗑️ Deleting collection...",
  };

  const label = toolLabels[toolName] || `🔧 ${toolName}`;
  const isComplete = state === "output-available";

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 py-1.5 px-2.5 rounded-lg bg-muted/30">
      {isComplete ? (
        <Wrench className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      )}
      <span>{isComplete ? label.replace("...", " ✓") : label}</span>
    </div>
  );
}

// =============================================================================
// Typing Indicator
// =============================================================================

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="bg-muted/30 rounded-xl px-4 py-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
