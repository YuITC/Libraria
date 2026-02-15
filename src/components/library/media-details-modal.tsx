"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MediaItem } from "@/types/database";

interface MediaDetailsModalProps {
  item: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaDetailsModal({
  item,
  open,
  onOpenChange,
}: MediaDetailsModalProps) {
  const t = useTranslations("media");

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Cover Image */}
          {item.cover_image_url && (
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted/30">
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Author + Release Year + Rating in a row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {item.author && (
              <span className="italic text-muted-foreground">
                {item.author}
              </span>
            )}
            {item.release_year && (
              <span className="text-muted-foreground">{item.release_year}</span>
            )}
            {item.rating !== null && item.rating !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{item.rating}</span>
                <span className="text-muted-foreground">/ 10</span>
              </span>
            )}
          </div>

          <Separator className="opacity-50" />

          {/* Type + Origin + Publication Status + User Status */}
          <div className="flex flex-wrap gap-2">
            <Badge className="text-xs">{t(`types.${item.type}`)}</Badge>
            {item.origin && (
              <Badge variant="secondary" className="text-xs">
                {t(`origins.${item.origin}`)}
              </Badge>
            )}
            {item.pub_status && (
              <Badge variant="outline" className="text-xs">
                {t(`statuses.${item.pub_status}`)}
              </Badge>
            )}
            {item.user_status && (
              <Badge variant="outline" className="text-xs">
                {t(`statuses.${item.user_status}`)}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <>
              <Separator className="opacity-50" />
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">
                  {t("tags")}
                </h4>
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

          {/* Notes */}
          {item.notes && (
            <>
              <Separator className="opacity-50" />
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">
                  {t("notes")}
                </h4>
                <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
              </div>
            </>
          )}

          {/* Cover Image URL */}
          {item.cover_image_url && (
            <>
              <Separator className="opacity-50" />
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">
                  {t("coverImage")}
                </h4>
                <p className="text-xs text-muted-foreground break-all">
                  {item.cover_image_url}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
