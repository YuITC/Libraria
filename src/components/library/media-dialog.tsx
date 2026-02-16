"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCreateMedia, useUpdateMedia } from "@/hooks/use-library";
import {
  MEDIA_TYPES,
  ORIGINS,
  STATUSES,
  PREDEFINED_TAGS,
} from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  MediaItem,
  MediaItemCreate,
  MediaType,
  Origin,
  Status,
} from "@/types/database";

interface MediaDialogProps {
  editItem?: MediaItem | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

export function MediaDialog({
  editItem,
  open,
  onOpenChange,
  triggerButton = true,
}: MediaDialogProps) {
  const t = useTranslations("media");
  const tCommon = useTranslations("common");
  const tLib = useTranslations("library");
  const createMedia = useCreateMedia();
  const updateMedia = useUpdateMedia();
  const isEditing = !!editItem;

  const [title, setTitle] = useState(editItem?.title || "");
  const [type, setType] = useState<MediaType>(editItem?.type || "book");
  const [origin, setOrigin] = useState<Origin | "">(editItem?.origin || "");
  const [author, setAuthor] = useState(editItem?.author || "");
  const [releaseYear, setReleaseYear] = useState(
    editItem?.release_year?.toString() || "",
  );
  const [rating, setRating] = useState(editItem?.rating?.toString() || "");
  const [pubStatus, setPubStatus] = useState<Status | "">(
    editItem?.pub_status || "",
  );
  const [userStatus, setUserStatus] = useState<Status | "">(
    editItem?.user_status || "",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    editItem?.tags || [],
  );
  const [coverUrl, setCoverUrl] = useState(editItem?.cover_image_url || "");
  const [notes, setNotes] = useState(editItem?.notes || "");

  const resetForm = () => {
    setTitle("");
    setType("book");
    setOrigin("");
    setAuthor("");
    setReleaseYear("");
    setRating("");
    setPubStatus("");
    setUserStatus("");
    setSelectedTags([]);
    setCoverUrl("");
    setNotes("");
  };

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setType(editItem.type);
      setOrigin(editItem.origin || "");
      setAuthor(editItem.author || "");
      setReleaseYear(editItem.release_year?.toString() || "");
      setRating(editItem.rating?.toString() || "");
      setPubStatus(editItem.pub_status || "");
      setUserStatus(editItem.user_status || "");
      setSelectedTags(editItem.tags || []);
      setCoverUrl(editItem.cover_image_url || "");
      setNotes(editItem.notes || "");
    } else {
      resetForm();
    }
  }, [editItem]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const data: MediaItemCreate = {
      title: title.trim(),
      type,
      origin: origin || undefined,
      author: author.trim() || undefined,
      release_year: releaseYear ? parseInt(releaseYear) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      pub_status: pubStatus || undefined,
      user_status: userStatus || undefined,
      tags: selectedTags,
      cover_image_url: coverUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEditing) {
        await updateMedia.mutateAsync({ id: editItem.id, ...data });
        toast.success("Media updated");
      } else {
        await createMedia.mutateAsync(data);
        toast.success("Media added");
        resetForm();
      }
      onOpenChange?.(false);
    } catch {
      toast.error("Error");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const isPending = createMedia.isPending || updateMedia.isPending;

  const dialogContent = (
    <DialogContent className="glass-strong sm:max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? tCommon("edit") : tLib("addMedia")}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-5 py-2">
        {/* Title (required) */}
        <div className="space-y-2">
          <Label htmlFor="media-title">{t("title")} *</Label>
          <Input
            id="media-title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            className="glass-subtle"
            placeholder="Enter title..."
          />
        </div>

        {/* Type (required) */}
        <div className="space-y-2">
          <Label>{t("type")} *</Label>
          <div className="flex flex-wrap gap-2">
            {MEDIA_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => setType(mt.value as MediaType)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  type === mt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`types.${mt.value}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="media-author">{t("author")}</Label>
            <Input
              id="media-author"
              value={author}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAuthor(e.target.value)
              }
              className="glass-subtle"
            />
          </div>

          {/* Release Year */}
          <div className="space-y-2">
            <Label htmlFor="media-year">{t("releaseYear")}</Label>
            <Input
              id="media-year"
              type="number"
              value={releaseYear}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReleaseYear(e.target.value)
              }
              className="glass-subtle"
              min={1000}
              max={9999}
            />
          </div>

          {/* Origin */}
          <div className="space-y-2">
            <Label>{t("origin")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {ORIGINS.map((o) => (
                <button
                  key={o.value}
                  onClick={() =>
                    setOrigin(origin === o.value ? "" : (o.value as Origin))
                  }
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
                    origin === o.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`origins.${o.value}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="media-rating">{t("rating")}</Label>
            <Input
              id="media-rating"
              type="number"
              value={rating}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRating(e.target.value)
              }
              className="glass-subtle"
              min={0}
              max={10}
              step={0.5}
            />
          </div>

          {/* Publication Status */}
          <div className="space-y-2">
            <Label>{t("pubStatus")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() =>
                    setPubStatus(
                      pubStatus === s.value ? "" : (s.value as Status),
                    )
                  }
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
                    pubStatus === s.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`statuses.${s.value}`)}
                </button>
              ))}
            </div>
          </div>

          {/* User Status */}
          <div className="space-y-2">
            <Label>{t("userStatus")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() =>
                    setUserStatus(
                      userStatus === s.value ? "" : (s.value as Status),
                    )
                  }
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
                    userStatus === s.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`statuses.${s.value}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>
            {t("tags")}
            {selectedTags.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({selectedTags.length})
              </span>
            )}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => toggleTag(tag.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                  selectedTags.includes(tag.value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-2">
          <Label htmlFor="media-cover">{t("coverImage")}</Label>
          <Input
            id="media-cover"
            value={coverUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCoverUrl(e.target.value)
            }
            className="glass-subtle"
            placeholder="https://..."
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="media-notes">{t("notes")}</Label>
          <Textarea
            id="media-notes"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNotes(e.target.value)
            }
            className="glass-subtle min-h-[80px]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => onOpenChange?.(false)}>
          {tCommon("cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !title.trim()}
          className="gradient-primary text-primary-foreground"
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isEditing ? tCommon("save") : tLib("addMedia")}
        </Button>
      </div>
    </DialogContent>
  );

  if (!triggerButton) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          {tLib("addMedia")}
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
