"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  Folder,
  Star,
  Heart,
  Bookmark,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteCollection } from "@/hooks/use-library";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CollectionWithCount } from "@/types/database";
import { motion } from "framer-motion";

interface CollectionCardProps {
  collection: CollectionWithCount & { icon?: string }; // Extend type locally if icon is missing from DB type
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  compact?: boolean;
}

export function CollectionCard({
  collection,
  isActive,
  onClick,
  onEdit,
  compact,
}: CollectionCardProps) {
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const tCollections = useTranslations("collections");
  const deleteCollection = useDeleteCollection();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteCollection.mutateAsync(collection.id);
      toast.success(tCommon("delete"));
      setDeleteOpen(false);
    } catch {
      toast.error("Error");
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "group relative rounded-xl cursor-pointer transition-all border overflow-hidden",
          compact
            ? "p-3 flex flex-col gap-2"
            : "flex items-center gap-3 px-3 py-2.5",
          isActive
            ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
            : "border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground",
        )}
      >
        {/* Icon / Color */}
        <div
          className={cn(
            "flex justify-between items-start w-full",
            compact ? "order-1" : "",
          )}
        >
          <div
            className={cn(
              "rounded-lg shrink-0 flex items-center justify-center transition-colors",
              compact ? "w-8 h-8" : "w-8 h-8",
              isActive
                ? "bg-primary text-primary-foreground shadow-inner"
                : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
            )}
            style={
              collection.color && !isActive
                ? {
                    backgroundColor: `${collection.color}20`,
                    color: collection.color,
                  }
                : {}
            }
          >
            {collection.icon === "star" && <Star className="w-4 h-4" />}
            {collection.icon === "heart" && <Heart className="w-4 h-4" />}
            {collection.icon === "bookmark" && <Bookmark className="w-4 h-4" />}
            {collection.icon === "folder" && <Folder className="w-4 h-4" />}
            {!collection.icon && <Folder className="w-4 h-4" />}
          </div>

          {/* Item Count (moved for compact) */}
          {compact && (
            <span className="text-xs opacity-70 font-mono">
              {collection.item_count || 0}
            </span>
          )}
        </div>

        {/* Info */}
        <div className={cn("flex-1 min-w-0 z-10", compact ? "order-2" : "")}>
          <p
            className="text-sm font-medium truncate w-full"
            title={collection.name}
          >
            {collection.name}
          </p>
          {!compact && (
            <p className="text-xs opacity-70">
              {collection.item_count} {tCollections("items")}
            </p>
          )}
        </div>

        {/* Kebab menu */}
        <div
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity z-20",
            compact ? "absolute top-2 right-2" : "",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-background/80"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit2 className="w-3.5 h-3.5 mr-2" />
                {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>{tConfirm("title")}</DialogTitle>
            <DialogDescription>{tConfirm("description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {tConfirm("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCollection.isPending}
            >
              {deleteCollection.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {tConfirm("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
