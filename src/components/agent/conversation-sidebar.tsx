"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useRenameConversation,
} from "@/hooks/use-conversations";
import { cn } from "@/lib/utils";

interface ConversationSidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: (id: string) => void;
}

export function ConversationSidebar({
  activeId,
  onSelect,
  onNew,
}: ConversationSidebarProps) {
  const t = useTranslations("agent");
  const { data: conversations, isLoading } = useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const renameConversation = useRenameConversation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleNew = async () => {
    try {
      const conv = await createConversation.mutateAsync(t("newConversation"));
      onNew(conv.id);
    } catch {
      // Error handled by React Query
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      await renameConversation.mutateAsync({ id, title: editTitle });
      setEditingId(null);
    } catch {
      // Error handled
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation.mutateAsync(id);
      if (activeId === id) {
        onSelect("");
      }
    } catch {
      // Error handled
    }
  };

  return (
    <div className="w-64 shrink-0 glass-strong rounded-xl flex flex-col h-full">
      <div className="p-3 border-b border-border/50">
        <Button
          onClick={handleNew}
          disabled={createConversation.isPending}
          className="w-full gap-2 gradient-primary text-primary-foreground"
          size="sm"
        >
          {createConversation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {t("newChat")}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">
              {t("noConversations")}
            </p>
          ) : (
            conversations?.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
                  activeId === conv.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50 text-foreground",
                )}
                onClick={() => onSelect(conv.id)}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />

                {editingId === conv.id ? (
                  <div
                    className="flex items-center gap-1 flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      value={editTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditTitle(e.target.value)
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleRename(conv.id)
                      }
                      className="h-6 text-xs px-1"
                      autoFocus
                    />
                    <button onClick={() => handleRename(conv.id)}>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    </button>
                    <button onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm truncate flex-1">
                      {conv.title}
                    </span>
                    <div
                      className="hidden group-hover:flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingId(conv.id);
                          setEditTitle(conv.title);
                        }}
                        className="p-1 rounded hover:bg-muted/50"
                      >
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(conv.id)}
                        className="p-1 rounded hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
