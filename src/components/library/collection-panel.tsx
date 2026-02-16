"use client";

import { useTranslations } from "next-intl";
import { LayoutGrid, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCollections } from "@/hooks/use-library";
import { CollectionCard } from "./collection-card";
import { Button } from "@/components/ui/button";
import type { CollectionWithCount } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";

interface CollectionPanelProps {
  selectedCollectionId: string | null;
  onSelectCollection: (id: string | null) => void;
  onAddCollection: () => void;
  onEditCollection: (col: CollectionWithCount) => void;
}

export function CollectionPanel({
  selectedCollectionId,
  onSelectCollection,
  onAddCollection,
  onEditCollection,
}: CollectionPanelProps) {
  const t = useTranslations("collections");
  const { data: collections, isLoading } = useCollections();

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-sm font-semibold">{t("title")}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddCollection}
          className="h-6 w-6 rounded-full hover:bg-muted/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        <div className="grid grid-cols-2 gap-2">
          {/* "All" item */}
          <motion.div
            layout
            onClick={() => onSelectCollection(null)}
            className={cn(
              "group relative flex flex-col gap-2 p-3 rounded-xl cursor-pointer transition-all border",
              !selectedCollectionId
                ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                : "border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-colors",
                  !selectedCollectionId
                    ? "bg-primary text-primary-foreground shadow-inner"
                    : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span className="text-xs opacity-70 font-mono">
                {((collections as CollectionWithCount[]) || []).reduce(
                  (acc, col) => acc + (col.item_count || 0),
                  0,
                )}
              </span>
            </div>
            <p className="text-sm font-medium truncate w-full">All</p>
          </motion.div>

          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {((collections as CollectionWithCount[]) || []).map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  isActive={selectedCollectionId === col.id}
                  onClick={() =>
                    onSelectCollection(
                      col.id === selectedCollectionId ? null : col.id,
                    )
                  }
                  onEdit={() => onEditCollection(col)}
                  compact
                />
              ))}
            </AnimatePresence>
          )}
        </div>
        {!isLoading &&
          ((collections as CollectionWithCount[]) || []).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6 col-span-2">
              {t("empty")}
            </p>
          )}
      </div>
    </div>
  );
}
