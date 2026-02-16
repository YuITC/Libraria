"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  BookOpen,
  Film,
  Gamepad2,
  Music,
  BookImage,
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
import { Badge } from "@/components/ui/badge";
import { useDeleteMedia } from "@/hooks/use-library";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types/database";

const TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  book: BookOpen,
  movie: Film,
  game: Gamepad2,
  music: Music,
  comic: BookImage,
};

const TYPE_COLORS: Record<string, string> = {
  book: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  movie: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  game: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  music: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  comic: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
};

const MAX_VISIBLE_TAGS = 4;

interface MediaCardProps {
  item: MediaItem;
  onClick?: (item: MediaItem) => void;
  onEdit?: (item: MediaItem) => void;
}

export function MediaCard({ item, onClick, onEdit }: MediaCardProps) {
  const t = useTranslations("media");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const deleteMedia = useDeleteMedia();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const TypeIcon = TYPE_ICONS[item.type] || BookOpen;

  const handleDelete = async () => {
    try {
      await deleteMedia.mutateAsync(item.id);
      toast.success(tCommon("delete"));
      setDeleteOpen(false);
    } catch {
      toast.error("Error");
    }
  };

  const visibleTags = item.tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagCount = item.tags.length - MAX_VISIBLE_TAGS;

  return (
    <>
      <div
        className="glass rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group flex h-[180px]"
        onClick={() => onClick?.(item)}
      >
        {/* Cover Image - Left ~30% */}
        <div className="w-[30%] shrink-0 bg-muted/30 overflow-hidden">
          {item.cover_image_url ? (
            <img
              src={item.cover_image_url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center min-h-[180px]">
              <TypeIcon className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info - Right ~70% */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          {/* Line 1: Title + Author */}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm line-clamp-3 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {item.author && (
              <p className="text-xs italic text-muted-foreground truncate mt-0.5">
                {item.author}
              </p>
            )}
          </div>

          {/* Line 2: Type + Publication Status */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <Badge
              className={cn("text-[12px] px-2 py-0.5", TYPE_COLORS[item.type])}
            >
              <TypeIcon className="w-3 h-3 mr-0.5" />
              {t(`types.${item.type}`)}
            </Badge>
            {item.pub_status && (
              <Badge variant="outline" className="text-[12px] px-2 py-0.5">
                {t(`statuses.${item.pub_status}`)}
              </Badge>
            )}
          </div>

          {/* Line 3: Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-muted/80 text-[12px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {remainingTagCount > 0 && (
                <span className="text-[12px] text-muted-foreground">
                  +{remainingTagCount} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Kebab Menu */}
        <div className="shrink-0 p-2 flex items-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/80 transition-all cursor-pointer"
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(item);
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
