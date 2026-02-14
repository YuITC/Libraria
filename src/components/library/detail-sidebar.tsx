"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Star, ExternalLink, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteMedia } from "@/hooks/use-library";
import { MediaDialog } from "./media-dialog";
import { toast } from "sonner";
import type { MediaItem } from "@/types/database";

interface DetailSidebarProps {
  item: MediaItem | null;
  open: boolean;
  onClose: () => void;
}

export function DetailSidebar({ item, open, onClose }: DetailSidebarProps) {
  const t = useTranslations("media");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const deleteMedia = useDeleteMedia();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!item) return null;

  const handleDelete = async () => {
    try {
      await deleteMedia.mutateAsync(item.id);
      toast.success("Deleted");
      setDeleteOpen(false);
      onClose();
    } catch {
      toast.error("Error");
    }
  };

  const infoRows: { label: string; value: React.ReactNode }[] = [
    { label: t("type"), value: t(`types.${item.type}`) },
    ...(item.author ? [{ label: t("author"), value: item.author }] : []),
    ...(item.origin
      ? [{ label: t("origin"), value: t(`origins.${item.origin}`) }]
      : []),
    ...(item.release_year
      ? [{ label: t("releaseYear"), value: item.release_year.toString() }]
      : []),
    ...(item.pub_status
      ? [{ label: t("pubStatus"), value: t(`statuses.${item.pub_status}`) }]
      : []),
    ...(item.user_status
      ? [{ label: t("userStatus"), value: t(`statuses.${item.user_status}`) }]
      : []),
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:w-[420px] glass-strong p-0 overflow-y-auto"
        >
          <SheetTitle className="sr-only">{item.title}</SheetTitle>
          {/* Cover Image */}
          {item.cover_image_url && (
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Title & Rating */}
            <div>
              <h2 className="text-2xl font-bold">{item.title}</h2>
              {item.rating !== null && item.rating !== undefined && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{item.rating}</span>
                  <span className="text-muted-foreground text-sm">/ 10</span>
                </div>
              )}
            </div>

            <Separator className="opacity-50" />

            {/* Info Rows */}
            <div className="space-y-3">
              {infoRows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="text-sm text-muted-foreground shrink-0">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <>
                <Separator className="opacity-50" />
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2">
                    {t("tags")}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* URLs */}
            {item.urls &&
              (item.urls as { label: string; url: string }[]).length > 0 && (
                <>
                  <Separator className="opacity-50" />
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2">
                      {t("urls")}
                    </h3>
                    <div className="space-y-1.5">
                      {(item.urls as { label: string; url: string }[]).map(
                        (link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {link.label || link.url}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                </>
              )}

            {/* Notes */}
            {item.notes && (
              <>
                <Separator className="opacity-50" />
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2">
                    {t("notes")}
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
                </div>
              </>
            )}

            <Separator className="opacity-50" />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {tCommon("edit")}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Dialog */}
      <MediaDialog
        editItem={item}
        open={editOpen}
        onOpenChange={setEditOpen}
        triggerButton={false}
      />

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
              disabled={deleteMedia.isPending}
            >
              {deleteMedia.isPending && (
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
