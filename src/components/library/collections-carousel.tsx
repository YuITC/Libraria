"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCollections, useCreateCollection } from "@/hooks/use-library";
import { COLLECTION_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CollectionWithCount } from "@/types/database";

interface CollectionsCarouselProps {
  selectedCollectionId?: string | null;
  onSelectCollection: (id: string | null) => void;
}

export function CollectionsCarousel({
  selectedCollectionId,
  onSelectCollection,
}: CollectionsCarouselProps) {
  const t = useTranslations("collections");
  const { data: collections, isLoading } = useCollections();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Auto-scroll detection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setShowLeft(el.scrollLeft > 0);
      setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [collections]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 260;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t("title")}...</span>
      </div>
    );
  }

  return (
    <div className="relative group/carousel">
      {/* Scroll buttons */}
      {showLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {showRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* "All" chip */}
        <button
          onClick={() => onSelectCollection(null)}
          className={cn(
            "shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all",
            !selectedCollectionId
              ? "border-primary bg-primary/10 text-primary"
              : "border-border glass-subtle text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>

        {/* Collection chips */}
        {((collections as CollectionWithCount[]) || []).map((col) => (
          <button
            key={col.id}
            onClick={() =>
              onSelectCollection(
                col.id === selectedCollectionId ? null : col.id,
              )
            }
            className={cn(
              "shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all",
              selectedCollectionId === col.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border glass-subtle text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: col.color }}
            />
            <span className="truncate max-w-[120px]">{col.name}</span>
            <span className="text-xs opacity-60">({col.item_count})</span>
          </button>
        ))}

        {/* Create new collection */}
        <CreateCollectionButton />
      </div>
    </div>
  );
}

function CreateCollectionButton() {
  const t = useTranslations("collections");
  const createCollection = useCreateCollection();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(COLLECTION_COLORS[0].value);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createCollection.mutateAsync({ name: name.trim(), color });
      setName("");
      setColor(COLLECTION_COLORS[0].value);
      setOpen(false);
    } catch {
      // Error handled
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all">
          <Plus className="w-3.5 h-3.5" />
          {t("create")}
        </button>
      </DialogTrigger>
      <DialogContent className="glass-strong max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("create")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder={t("name")}
              className="glass-subtle"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("color")}</label>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
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
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createCollection.isPending || !name.trim()}
            className="gradient-primary text-primary-foreground"
          >
            {createCollection.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {t("create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
