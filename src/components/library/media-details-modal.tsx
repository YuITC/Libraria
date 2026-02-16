"use client";

import { useTranslations } from "next-intl";
import {
  Star,
  User,
  Calendar,
  Book,
  Globe,
  Info,
  Bookmark,
  Tag,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types/database";

interface MediaDetailsModalProps {
  item: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Color helpers
const getRatingColor = (rating: number) => {
  if (rating >= 8)
    return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20";
  if (rating >= 5)
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20";
  return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20";
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "book":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "movie":
      return "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "game":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "comic":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20";
    default:
      return "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
    case "finished":
      return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20";
    case "reading":
    case "watching":
    case "playing":
    case "ongoing":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "on_hold":
    case "hiatus":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "dropped":
    case "cancelled":
      return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20";
  }
};

const getOriginColor = (origin: string) => {
  switch (origin) {
    case "original":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
    case "adaptation":
      return "bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/20";
    default:
      return "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20";
  }
};

const MetadataRow = ({
  icon: Icon,
  label,
  value,
  badgeClassName,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  badgeClassName?: string;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {label}:
      </span>
      <Badge
        variant="secondary"
        className={cn("text-xs border", badgeClassName)}
      >
        {value}
      </Badge>
    </div>
  );
};

export function MediaDetailsModal({
  item,
  open,
  onOpenChange,
}: MediaDetailsModalProps) {
  const t = useTranslations("media");

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.title}</DialogTitle>
          {/* 1. Author (Moved below title) */}
          {item.author && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="italic">{item.author}</span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* 2. Cover Image */}
          {item.cover_image_url && (
            <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-muted/30 shadow-sm border border-border/50">
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 3. Grid 1: Type + Year + Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetadataRow
              icon={Book}
              label={t("type")}
              value={t(`types.${item.type}`)}
              badgeClassName={getTypeColor(item.type)}
            />
            <MetadataRow
              icon={Calendar}
              label={t("releaseYear")}
              value={item.release_year}
            />
            <MetadataRow
              icon={Star}
              label={t("rating")}
              value={
                item.rating !== null && item.rating !== undefined ? (
                  <span className="flex items-center gap-1">
                    {item.rating}{" "}
                    <span className="text-[10px] opacity-70">/ 10</span>
                  </span>
                ) : null
              }
              badgeClassName={
                item.rating ? getRatingColor(item.rating) : undefined
              }
            />
          </div>

          <Separator className="opacity-50" />

          {/* 4. Grid 2: Origin + Pub Status + User Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetadataRow
              icon={Globe}
              label={t("origin")}
              value={item.origin ? t(`origins.${item.origin}`) : null}
              badgeClassName={item.origin ? getOriginColor(item.origin) : ""}
            />
            <MetadataRow
              icon={Info}
              label={t("pubStatus")}
              value={item.pub_status ? t(`statuses.${item.pub_status}`) : null}
              badgeClassName={
                item.pub_status ? getStatusColor(item.pub_status) : ""
              }
            />
            <MetadataRow
              icon={Bookmark}
              label={t("userStatus")}
              value={
                item.user_status ? t(`statuses.${item.user_status}`) : null
              }
              badgeClassName={
                item.user_status ? getStatusColor(item.user_status) : ""
              }
            />
          </div>

          {/* 5. Tags */}
          {item.tags.length > 0 && (
            <>
              <Separator className="opacity-50" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  {t("tags")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2.5 py-0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 6. Notes */}
          {item.notes && (
            <>
              <Separator className="opacity-50" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {t("notes")}
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {item.notes}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
