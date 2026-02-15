"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMediaItems,
  useCreateCollection,
  useUpdateCollection,
  useAddMediaToCollection,
  useRemoveMediaFromCollection,
} from "@/hooks/use-library";
import { getCollectionMediaIds } from "@/actions/collections";
import { COLLECTION_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CollectionWithCount } from "@/types/database";

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCollection?: CollectionWithCount | null;
}

export function CollectionFormDialog({
  open,
  onOpenChange,
  editCollection,
}: CollectionFormDialogProps) {
  const t = useTranslations("collections");
  const tCommon = useTranslations("common");
  const isEditing = !!editCollection;

  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const addMedia = useAddMediaToCollection();
  const removeMedia = useRemoveMediaFromCollection();

  const { data: mediaData } = useMediaItems({ sort_by: "title_asc" });
  const allMedia = mediaData?.data || [];

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(COLLECTION_COLORS[0].value);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(
    new Set(),
  );
  const [originalMediaIds, setOriginalMediaIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);

  // Load edit data
  useEffect(() => {
    if (editCollection && open) {
      setName(editCollection.name);
      setColor(editCollection.color);
      // Load current media IDs for this collection
      getCollectionMediaIds(editCollection.id).then((ids) => {
        const idSet = new Set(ids);
        setSelectedMediaIds(idSet);
        setOriginalMediaIds(new Set(ids));
      });
    } else if (!open) {
      setName("");
      setColor(COLLECTION_COLORS[0].value);
      setSelectedMediaIds(new Set());
      setOriginalMediaIds(new Set());
    }
  }, [editCollection, open]);

  const toggleMedia = (id: string) => {
    setSelectedMediaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      if (isEditing) {
        await updateCollection.mutateAsync({
          id: editCollection.id,
          name: name.trim(),
          color,
        });

        // Calculate added and removed media
        const added = [...selectedMediaIds].filter(
          (id) => !originalMediaIds.has(id),
        );
        const removed = [...originalMediaIds].filter(
          (id) => !selectedMediaIds.has(id),
        );

        if (added.length > 0) {
          await addMedia.mutateAsync({
            collectionId: editCollection.id,
            mediaItemIds: added,
          });
        }
        if (removed.length > 0) {
          await removeMedia.mutateAsync({
            collectionId: editCollection.id,
            mediaItemIds: removed,
          });
        }
      } else {
        const created = await createCollection.mutateAsync({
          name: name.trim(),
          color,
        });

        if (selectedMediaIds.size > 0) {
          await addMedia.mutateAsync({
            collectionId: created.id,
            mediaItemIds: [...selectedMediaIds],
          });
        }
      }

      onOpenChange(false);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const isPending =
    loading || createCollection.isPending || updateCollection.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? tCommon("edit") : t("create")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto py-1">
          {/* Name */}
          <div className="space-y-2">
            <Label>{t("name")} *</Label>
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder={t("name")}
              className="glass-subtle"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>{t("color")}</Label>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all cursor-pointer",
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105",
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Media multi-select */}
          <div className="space-y-2">
            <Label>
              {t("addMedia")}
              {selectedMediaIds.size > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({selectedMediaIds.size})
                </span>
              )}
            </Label>
            <ScrollArea className="h-48 rounded-lg border border-border">
              <div className="p-2 space-y-0.5">
                {allMedia.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleMedia(item.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left"
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                        selectedMediaIds.has(item.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border",
                      )}
                    >
                      {selectedMediaIds.has(item.id) && (
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
                {allMedia.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No media items yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="gradient-primary text-primary-foreground"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? tCommon("save") : t("create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
