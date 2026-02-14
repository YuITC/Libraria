"use client";

import { useTranslations } from "next-intl";
import { Star, BookOpen, Film, Gamepad2, Music, BookImage } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface MediaCardProps {
  item: MediaItem;
  view: "grid" | "list";
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (item: MediaItem) => void;
}

export function MediaCard({
  item,
  view,
  selected,
  onSelect,
  onClick,
}: MediaCardProps) {
  const t = useTranslations("media");
  const TypeIcon = TYPE_ICONS[item.type] || BookOpen;

  if (view === "list") {
    return (
      <div
        className={cn(
          "glass rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group",
          selected && "ring-2 ring-primary",
        )}
        onClick={() => onClick?.(item)}
      >
        {/* Checkbox */}
        {onSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.id);
            }}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
              selected
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border hover:border-primary/50",
            )}
          >
            {selected && (
              <svg
                className="w-3 h-3"
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
          </button>
        )}

        {/* Cover */}
        <div className="w-12 h-16 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
          {item.cover_image_url ? (
            <img
              src={item.cover_image_url}
              alt={item.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <TypeIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {item.author && (
              <span className="text-xs text-muted-foreground truncate">
                {item.author}
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Badge
            variant="secondary"
            className={cn("text-xs", TYPE_COLORS[item.type])}
          >
            <TypeIcon className="w-3 h-3 mr-1" />
            {t(`types.${item.type}`)}
          </Badge>
          {item.user_status && (
            <Badge variant="outline" className="text-xs">
              {t(`statuses.${item.user_status}`)}
            </Badge>
          )}
        </div>

        {/* Rating */}
        {item.rating !== null && item.rating !== undefined && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">{item.rating}</span>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={cn(
        "glass rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group",
        selected && "ring-2 ring-primary",
      )}
      onClick={() => onClick?.(item)}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
        {item.cover_image_url ? (
          <img
            src={item.cover_image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Checkbox overlay */}
        {onSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.id);
            }}
            className={cn(
              "absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
              selected
                ? "bg-primary border-primary text-primary-foreground"
                : "border-white/60 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100",
            )}
          >
            {selected && (
              <svg
                className="w-3.5 h-3.5"
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
          </button>
        )}

        {/* Rating badge */}
        {item.rating !== null && item.rating !== undefined && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {item.rating}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute bottom-2 left-2">
          <Badge
            className={cn("text-xs backdrop-blur-sm", TYPE_COLORS[item.type])}
          >
            <TypeIcon className="w-3 h-3 mr-1" />
            {t(`types.${item.type}`)}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        {item.author && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {item.author}
          </p>
        )}
        {item.user_status && (
          <Badge variant="outline" className="text-xs mt-2">
            {t(`statuses.${item.user_status}`)}
          </Badge>
        )}
      </div>
    </div>
  );
}
