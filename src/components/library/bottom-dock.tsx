"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Database,
  X,
  Download,
  Upload,
  Folder,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MEDIA_TYPES,
  ORIGINS,
  STATUSES,
  PREDEFINED_TAGS,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { MediaQueryParams } from "@/actions/media";
import { CollectionPanel } from "./collection-panel";
import type { CollectionWithCount } from "@/types/database";

// =============================================================================
// Types
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

interface BottomDockProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  // Filter
  filterTypes: string[];
  onFilterTypesChange: (types: string[]) => void;
  filterOrigins: string[];
  onFilterOriginsChange: (origins: string[]) => void;
  filterPubStatus: string[];
  onFilterPubStatusChange: (statuses: string[]) => void;
  filterUserStatus: string[];
  onFilterUserStatusChange: (statuses: string[]) => void;
  filterTags: string[];
  onFilterTagsChange: (tags: string[]) => void;
  filterRatingMin?: number;
  onFilterRatingMinChange: (min?: number) => void;
  filterRatingMax?: number;
  onFilterRatingMaxChange: (max?: number) => void;
  filterYearMin?: number;
  onFilterYearMinChange: (min?: number) => void;
  filterYearMax?: number;
  onFilterYearMaxChange: (max?: number) => void;
  // Sort
  // Sort
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  // Add Media
  onAddMedia: () => void;
  // Collections
  selectedCollectionId: string | null;
  onSelectCollection: (id: string | null) => void;
  onAddCollection: () => void;
  onEditCollection: (col: CollectionWithCount) => void;
  // Data
  onExport: () => void;
  onImport: () => void;
}

type ActivePanel = "search" | "filter" | "sort" | "collections" | "data" | null;

export function BottomDock({
  searchValue,
  onSearchChange,
  filterTypes,
  onFilterTypesChange,
  filterOrigins,
  onFilterOriginsChange,
  filterPubStatus,
  onFilterPubStatusChange,
  filterUserStatus,
  onFilterUserStatusChange,
  filterTags,
  onFilterTagsChange,
  filterRatingMin,
  onFilterRatingMinChange,
  filterRatingMax,
  onFilterRatingMaxChange,
  filterYearMin,
  onFilterYearMinChange,
  filterYearMax,
  onFilterYearMaxChange,
  sortBy,
  onSortChange,
  onAddMedia,
  selectedCollectionId,
  onSelectCollection,
  onAddCollection,
  onEditCollection,
  onExport,
  onImport,
}: BottomDockProps) {
  const t = useTranslations("library");
  const tMedia = useTranslations("media");
  const tCollections = useTranslations("collections");
  const tCommon = useTranslations("common");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearchInput = (value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  // Focus search input when panel opens
  useEffect(() => {
    if (activePanel === "search" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [activePanel]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  // Count active filters
  const activeFilterCount =
    filterTypes.length +
    filterOrigins.length +
    filterPubStatus.length +
    filterUserStatus.length +
    filterTags.length +
    (filterRatingMin !== undefined ? 1 : 0) +
    (filterRatingMax !== undefined ? 1 : 0) +
    (filterYearMin !== undefined ? 1 : 0) +
    (filterYearMax !== undefined ? 1 : 0);

  const clearAllFilters = () => {
    onFilterTypesChange([]);
    onFilterOriginsChange([]);
    onFilterPubStatusChange([]);
    onFilterUserStatusChange([]);
    onFilterTagsChange([]);
    onFilterRatingMinChange(undefined);
    onFilterRatingMaxChange(undefined);
    onFilterYearMinChange(undefined);
    onFilterYearMaxChange(undefined);
  };

  const toggleInArray = (
    arr: string[],
    setter: (values: string[]) => void,
    value: string,
  ) => {
    setter(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  };

  return (
    <div
      ref={dockRef}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2"
    >
      {/* Expanded panel above dock */}
      {activePanel && (
        <div
          className={cn(
            "glass-strong rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200",
            activePanel === "search" && "w-[min(90vw,630px)]",
            activePanel === "filter" && "w-[min(90vw,630px)]",
            activePanel === "sort" && "w-[min(90vw,230px)]",
            activePanel === "collections" &&
              "w-[min(90vw,700px)] h-[min(60vh,500px)]",
            activePanel === "data" && "w-[min(90vw,180px)]",
          )}
        >
          {/* Search Panel */}
          {activePanel === "search" && (
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={localSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleSearchInput(e.target.value)
                  }
                  placeholder={tCommon("search")}
                  className="pl-10 pr-10 glass-subtle"
                />
                {localSearch && (
                  <button
                    onClick={() => {
                      setLocalSearch("");
                      onSearchChange("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {activePanel === "filter" && (
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t("filters")}</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Type */}
              <FilterSection
                label={tMedia("type")}
                items={MEDIA_TYPES.map((mt) => ({
                  label: tMedia(`types.${mt.value}`),
                  value: mt.value,
                }))}
                selected={filterTypes}
                onToggle={(v) =>
                  toggleInArray(filterTypes, onFilterTypesChange, v)
                }
              />

              <Separator className="opacity-30" />

              {/* Origin */}
              <FilterSection
                label={tMedia("origin")}
                items={ORIGINS.map((o) => ({
                  label: tMedia(`origins.${o.value}`),
                  value: o.value,
                }))}
                selected={filterOrigins}
                onToggle={(v) =>
                  toggleInArray(filterOrigins, onFilterOriginsChange, v)
                }
              />

              <Separator className="opacity-30" />

              {/* Publication Status */}
              <FilterSection
                label={tMedia("pubStatus")}
                items={STATUSES.map((s) => ({
                  label: tMedia(`statuses.${s.value}`),
                  value: s.value,
                }))}
                selected={filterPubStatus}
                onToggle={(v) =>
                  toggleInArray(filterPubStatus, onFilterPubStatusChange, v)
                }
              />

              <Separator className="opacity-30" />

              {/* User Status */}
              <FilterSection
                label={tMedia("userStatus")}
                items={STATUSES.map((s) => ({
                  label: tMedia(`statuses.${s.value}`),
                  value: s.value,
                }))}
                selected={filterUserStatus}
                onToggle={(v) =>
                  toggleInArray(filterUserStatus, onFilterUserStatusChange, v)
                }
              />

              <Separator className="opacity-30" />

              {/* Tags */}
              <FilterSection
                label={tMedia("tags")}
                items={PREDEFINED_TAGS.map((tag) => ({
                  label: tag.label,
                  value: tag.value,
                }))}
                selected={filterTags}
                onToggle={(v) =>
                  toggleInArray(filterTags, onFilterTagsChange, v)
                }
              />

              <Separator className="opacity-30" />

              {/* Rating Range */}
              <div>
                <Label className="text-sm font-semibold">
                  {tMedia("rating")}
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={filterRatingMin ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onFilterRatingMinChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    placeholder="Min"
                    className="glass-subtle w-20 text-xs"
                  />
                  <span className="text-muted-foreground text-xs">–</span>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={filterRatingMax ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onFilterRatingMaxChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    placeholder="Max"
                    className="glass-subtle w-20 text-xs"
                  />
                </div>
              </div>

              <Separator className="opacity-30" />

              {/* Release Year Range */}
              <div>
                <Label className="text-sm font-semibold">
                  {tMedia("releaseYear")}
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min={1000}
                    max={9999}
                    value={filterYearMin ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onFilterYearMinChange(
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="From"
                    className="glass-subtle w-24 text-xs"
                  />
                  <span className="text-muted-foreground text-xs">–</span>
                  <Input
                    type="number"
                    min={1000}
                    max={9999}
                    value={filterYearMax ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onFilterYearMaxChange(
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="To"
                    className="glass-subtle w-24 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sort Panel */}
          {activePanel === "sort" && (
            <div className="p-3 space-y-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSortChange(opt.value);
                    setActivePanel(null);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                    sortBy === opt.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {t(`sortBy.${opt.labelKey}`)}
                </button>
              ))}
            </div>
          )}

          {/* Collections Panel */}
          {activePanel === "collections" && (
            <CollectionPanel
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={(id) => {
                onSelectCollection(id);
                // Optional: close panel on selection if desired, but keeping open is usually better for browsing
              }}
              onAddCollection={() => {
                onAddCollection();
                // Close panel to show clean dialog
                setActivePanel(null);
              }}
              onEditCollection={(col) => {
                onEditCollection(col);
                setActivePanel(null);
              }}
            />
          )}

          {/* Data Panel */}
          {activePanel === "data" && (
            <div className="p-3 space-y-1">
              <button
                onClick={() => {
                  onExport();
                  setActivePanel(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {t("exportData")}
              </button>
              <button
                onClick={() => {
                  onImport();
                  setActivePanel(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {t("importData")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dock Bar */}
      <div className="glass-strong rounded-2xl px-2 py-2 flex items-center gap-8 shadow-lg">
        <DockButton
          icon={Search}
          isActive={activePanel === "search" || !!searchValue}
          onClick={() => togglePanel("search")}
          label={tCommon("search")}
        />
        <DockButton
          icon={SlidersHorizontal}
          isActive={activePanel === "filter"}
          onClick={() => togglePanel("filter")}
          label={t("filters")}
          badge={activeFilterCount > 0 ? activeFilterCount : undefined}
        />
        <DockButton
          icon={ArrowUpDown}
          isActive={activePanel === "sort"}
          onClick={() => togglePanel("sort")}
          label={t("sort")}
        />
        <DockButton
          icon={File}
          isActive={false} // Action button, no active state
          onClick={onAddMedia}
          label={t("addMedia")}
        />
        <DockButton
          icon={Folder}
          isActive={activePanel === "collections"}
          onClick={() => togglePanel("collections")}
          label={tCollections("title")}
          badge={selectedCollectionId ? 1 : undefined}
        />
        <DockButton
          icon={Database}
          isActive={activePanel === "data"}
          onClick={() => togglePanel("data")}
          label={t("data")}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Dock Button
// =============================================================================

function DockButton({
  icon: Icon,
  isActive,
  onClick,
  label,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "relative p-2.5 rounded-xl transition-all cursor-pointer",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      )}
    >
      <Icon className="w-5 h-5" />
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// Filter Section
// =============================================================================

function FilterSection({
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
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => onToggle(item.value)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer",
              selected.includes(item.value)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
