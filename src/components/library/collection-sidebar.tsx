"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollections } from "@/hooks/use-library";
import { CollectionCard } from "./collection-card";
import { CollectionFormDialog } from "./collection-form-dialog";
import type { CollectionWithCount } from "@/types/database";

interface CollectionSidebarProps {
  selectedCollectionId: string | null;
  onSelectCollection: (id: string | null) => void;
}

export function CollectionSidebar({
  selectedCollectionId,
  onSelectCollection,
}: CollectionSidebarProps) {
  const t = useTranslations("collections");
  const { data: collections, isLoading } = useCollections();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CollectionWithCount | null>(null);

  const handleEdit = (col: CollectionWithCount) => {
    setEditingCollection(col);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCollection(null);
    setFormOpen(true);
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col h-full border-l border-border bg-background/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">{t("title")}</h2>
          <button
            onClick={handleAdd}
            className="p-1.5 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* "All" item */}
            <button
              onClick={() => onSelectCollection(null)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                !selectedCollectionId
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              All
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              ((collections as CollectionWithCount[]) || []).map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  isActive={selectedCollectionId === col.id}
                  onClick={() =>
                    onSelectCollection(
                      col.id === selectedCollectionId ? null : col.id,
                    )
                  }
                  onEdit={() => handleEdit(col)}
                />
              ))
            )}

            {!isLoading &&
              ((collections as CollectionWithCount[]) || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  {t("empty")}
                </p>
              )}
          </div>
        </ScrollArea>
      </aside>

      {/* Collection form dialog */}
      <CollectionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editCollection={editingCollection}
      />
    </>
  );
}
