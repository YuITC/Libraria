"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Trash2,
  X,
  Loader2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMediaItems, useBulkDeleteMedia } from "@/hooks/use-library";
import { MediaCard } from "@/components/library/media-card";
import { MediaDialog } from "@/components/library/media-dialog";
import { CollectionsCarousel } from "@/components/library/collections-carousel";
import { DetailSidebar } from "@/components/library/detail-sidebar";
import {
  MEDIA_TYPES,
  ORIGINS,
  STATUSES,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MediaItem } from "@/types/database";
import type { MediaQueryParams } from "@/actions/media";

// =============================================================================
// Debounce hook
// =============================================================================

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useState(() => {
    // Initial value
  });

  // Use a ref-based approach to avoid stale closures
  const [, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const setValueDebounced = useCallback(
    (newValue: string) => {
      setTimer((prev) => {
        if (prev) clearTimeout(prev);
        return setTimeout(() => setDebouncedValue(newValue), delay);
      });
    },
    [delay],
  );

  return [debouncedValue, setValueDebounced] as const;
}

// =============================================================================
// Sort Options
// =============================================================================

type SortOption = MediaQueryParams["sort_by"];

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: "updated_new", labelKey: "updatedNew" },
  { value: "updated_old", labelKey: "updatedOld" },
  { value: "title_asc", labelKey: "titleAsc" },
  { value: "title_desc", labelKey: "titleDesc" },
  { value: "rating_high", labelKey: "ratingHigh" },
  { value: "rating_low", labelKey: "ratingLow" },
];

// =============================================================================
// Main Component
// =============================================================================

export function LibraryContent() {
  const t = useTranslations("library");
  const tCommon = useTranslations("common");
  const tMedia = useTranslations("media");
  const tConfirm = useTranslations("confirm");

  // View & layout
  const [view, setView] = useState<"grid" | "list">("grid");
  const [addOpen, setAddOpen] = useState(false);

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useDebounce(
    "",
    SEARCH_DEBOUNCE_MS,
  );

  // Filters
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterOrigins, setFilterOrigins] = useState<string[]>([]);
  const [filterPubStatus, setFilterPubStatus] = useState<string[]>([]);
  const [filterUserStatus, setFilterUserStatus] = useState<string[]>([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Sort
  const [sortBy, setSortBy] = useState<SortOption>("updated_new");

  // Pagination
  const [page, setPage] = useState(1);

  // Collection filter
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Detail sidebar
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Build query params
  const queryParams: MediaQueryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      type: filterTypes.length ? filterTypes : undefined,
      origin: filterOrigins.length ? filterOrigins : undefined,
      pub_status: filterPubStatus.length ? filterPubStatus : undefined,
      user_status: filterUserStatus.length ? filterUserStatus : undefined,
      sort_by: sortBy,
      page,
      collection_id: selectedCollectionId || undefined,
    }),
    [
      debouncedSearch,
      filterTypes,
      filterOrigins,
      filterPubStatus,
      filterUserStatus,
      sortBy,
      page,
      selectedCollectionId,
    ],
  );

  const { data, isLoading, isFetching } = useMediaItems(queryParams);
  const bulkDelete = useBulkDeleteMedia();

  const mediaItems = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const totalCount = data?.count || 0;

  // Active filter count
  const activeFilterCount =
    filterTypes.length +
    filterOrigins.length +
    filterPubStatus.length +
    filterUserStatus.length;

  // Handlers
  const handleSearch = (value: string) => {
    setSearchInput(value);
    setDebouncedSearch(value);
    setPage(1);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === mediaItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(mediaItems.map((m) => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} items`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch {
      toast.error("Error");
    }
  };

  const handleItemClick = (item: MediaItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const toggleFilter = (
    arr: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) => {
    setter(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
    setPage(1);
  };

  const clearFilters = () => {
    setFilterTypes([]);
    setFilterOrigins([]);
    setFilterPubStatus([]);
    setFilterUserStatus([]);
    setPage(1);
  };

  const handleCollectionSelect = (id: string | null) => {
    setSelectedCollectionId(id);
    setPage(1);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
            {totalCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {totalCount} items
              </p>
            )}
          </div>
        </div>
        <MediaDialog open={addOpen} onOpenChange={setAddOpen} />
      </div>

      {/* Collections Carousel */}
      <CollectionsCarousel
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={handleCollectionSelect}
      />

      {/* Toolbar: Search + Filters + Sort + View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSearch(e.target.value)
            }
            placeholder={tCommon("search")}
            className="pl-10 glass-subtle"
          />
          {searchInput && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter button */}
        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <SlidersHorizontal className="w-4 h-4" />
              {t("filters")}
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs gradient-primary text-primary-foreground">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="glass-strong w-[300px] overflow-y-auto"
          >
            <SheetTitle className="text-lg font-bold mb-4">
              {t("filters")}
            </SheetTitle>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="mb-4 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear all
              </Button>
            )}

            <div className="space-y-6">
              {/* Type filter */}
              <FilterGroup
                label={tMedia("type")}
                items={MEDIA_TYPES.map((mt) => ({
                  label: tMedia(`types.${mt.value}`),
                  value: mt.value,
                }))}
                selected={filterTypes}
                onToggle={(v) => toggleFilter(filterTypes, setFilterTypes, v)}
              />

              <Separator className="opacity-50" />

              {/* Origin filter */}
              <FilterGroup
                label={tMedia("origin")}
                items={ORIGINS.map((o) => ({
                  label: tMedia(`origins.${o.value}`),
                  value: o.value,
                }))}
                selected={filterOrigins}
                onToggle={(v) =>
                  toggleFilter(filterOrigins, setFilterOrigins, v)
                }
              />

              <Separator className="opacity-50" />

              {/* Pub Status filter */}
              <FilterGroup
                label={tMedia("pubStatus")}
                items={STATUSES.map((s) => ({
                  label: tMedia(`statuses.${s.value}`),
                  value: s.value,
                }))}
                selected={filterPubStatus}
                onToggle={(v) =>
                  toggleFilter(filterPubStatus, setFilterPubStatus, v)
                }
              />

              <Separator className="opacity-50" />

              {/* User Status filter */}
              <FilterGroup
                label={tMedia("userStatus")}
                items={STATUSES.map((s) => ({
                  label: tMedia(`statuses.${s.value}`),
                  value: s.value,
                }))}
                selected={filterUserStatus}
                onToggle={(v) =>
                  toggleFilter(filterUserStatus, setFilterUserStatus, v)
                }
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort */}
        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setSortBy(opt.value);
                setPage(1);
              }}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hidden lg:block",
                sortBy === opt.value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`sortBy.${opt.labelKey}`)}
            </button>
          ))}
          {/* Mobile sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortOption);
              setPage(1);
            }}
            className="lg:hidden glass-subtle rounded-lg px-3 py-1.5 text-sm border border-border bg-transparent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(`sortBy.${opt.labelKey}`)}
              </option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 glass-subtle rounded-lg">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              view === "grid"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              view === "list"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="glass rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
              {selectedIds.size === mediaItems.length
                ? "Deselect All"
                : t("selectAll")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t("bulkDelete")}
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : mediaItems.length === 0 ? (
        /* Empty state */
        <div className="glass rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg text-muted-foreground">{t("noMedia")}</p>
        </div>
      ) : (
        /* Media Grid/List */
        <div
          className={cn(
            view === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              : "space-y-3",
            isFetching && "opacity-60 pointer-events-none",
          )}
        >
          {mediaItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              view={view}
              selected={selectedIds.has(item.id)}
              onSelect={handleSelect}
              onClick={handleItemClick}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {tCommon("previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("pagination.page")} {page} {t("pagination.of")} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {tCommon("next")}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail Sidebar */}
      <DetailSidebar
        item={detailItem}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailItem(null);
        }}
      />

      {/* Bulk Delete Confirmation */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>{tConfirm("title")}</DialogTitle>
            <DialogDescription>
              Delete {selectedIds.size} selected items?{" "}
              {tConfirm("description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              {tConfirm("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
            >
              {bulkDelete.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {tConfirm("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =============================================================================
// Filter Group
// =============================================================================

function FilterGroup({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: { label: string; value: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">{label}</h4>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => onToggle(item.value)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all hover:bg-muted/50"
          >
            <div
              className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                selected.includes(item.value)
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {selected.includes(item.value) && (
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
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
