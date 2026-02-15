"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreVertical, Edit2, Trash2, Loader2 } from "lucide-react";
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

interface CollectionCardProps {
  collection: CollectionWithCount;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
}

export function CollectionCard({
  collection,
  isActive,
  onClick,
  onEdit,
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
      <div
        onClick={onClick}
        className={cn(
          "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
          isActive ? "ring-2 ring-primary bg-primary/8" : "hover:bg-muted/50",
        )}
      >
        {/* Color indicator */}
        <div
          className="w-8 h-8 rounded-lg shrink-0"
          style={{ backgroundColor: collection.color }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{collection.name}</p>
          <p className="text-xs text-muted-foreground">
            {collection.item_count} {tCollections("items")}
          </p>
        </div>

        {/* Kebab menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-muted/80 transition-all"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
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
