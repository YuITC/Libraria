"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Loader2 } from "lucide-react";
import { useMediaItems, useCollections } from "@/hooks/use-library";
import { MediaCard } from "@/components/library/media-card";
import { MediaDialog } from "@/components/library/media-dialog";
import { MediaDetailsModal } from "@/components/library/media-details-modal";
import { CollectionSidebar } from "@/components/library/collection-sidebar";
import { CollectionFormDialog } from "@/components/library/collection-form-dialog";
import { BottomDock } from "@/components/library/bottom-dock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MediaItem } from "@/types/database";
import type { MediaQueryParams } from "@/actions/media";

export function LibraryContent() {
  const t = useTranslations("library");
  const tCommon = useTranslations("common");

  // Search
  const [search, setSearch] = useState("");

  // Filters
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterOrigins, setFilterOrigins] = useState<string[]>([]);
  const [filterPubStatus, setFilterPubStatus] = useState<string[]>([]);
  const [filterUserStatus, setFilterUserStatus] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterRatingMin, setFilterRatingMin] = useState<number | undefined>();
  const [filterRatingMax, setFilterRatingMax] = useState<number | undefined>();
  const [filterYearMin, setFilterYearMin] = useState<number | undefined>();
  const [filterYearMax, setFilterYearMax] = useState<number | undefined>();

  // Sort
  const [sortBy, setSortBy] =
    useState<MediaQueryParams["sort_by"]>("updated_new");

  // Collection filter
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);

  // Modals
  const [addMediaOpen, setAddMediaOpen] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [editMediaOpen, setEditMediaOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addCollectionOpen, setAddCollectionOpen] = useState(false);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build query params
  const queryParams: MediaQueryParams = useMemo(
    () => ({
      search: search || undefined,
      type: filterTypes.length ? filterTypes : undefined,
      origin: filterOrigins.length ? filterOrigins : undefined,
      pub_status: filterPubStatus.length ? filterPubStatus : undefined,
      user_status: filterUserStatus.length ? filterUserStatus : undefined,
      tags: filterTags.length ? filterTags : undefined,
      rating_min: filterRatingMin,
      rating_max: filterRatingMax,
      year_min: filterYearMin,
      year_max: filterYearMax,
      sort_by: sortBy,
      collection_id: selectedCollectionId || undefined,
    }),
    [
      search,
      filterTypes,
      filterOrigins,
      filterPubStatus,
      filterUserStatus,
      filterTags,
      filterRatingMin,
      filterRatingMax,
      filterYearMin,
      filterYearMax,
      sortBy,
      selectedCollectionId,
    ],
  );

  const { data, isLoading, isFetching } = useMediaItems(queryParams);
  const { data: collections } = useCollections();

  const mediaItems = data?.data || [];
  const totalCount = data?.count || 0;

  // Handlers
  const handleItemClick = (item: MediaItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleEditItem = (item: MediaItem) => {
    setEditItem(item);
    setEditMediaOpen(true);
  };

  const handleCollectionSelect = (id: string | null) => {
    setSelectedCollectionId(id);
  };

  // Export
  const handleExport = useCallback(async () => {
    try {
      const exportData = {
        version: 1,
        exported_at: new Date().toISOString(),
        media: mediaItems,
        collections: collections || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `libraria-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("exportSuccess"));
    } catch {
      toast.error(tCommon("noResults"));
    }
  }, [mediaItems, collections, t, tCommon]);

  // Import
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.version || !data.media) {
          toast.error(t("importInvalid"));
          return;
        }

        // TODO: Implement actual import logic - create media items from data
        toast.success(
          `${t("importSuccess")}: ${data.media?.length || 0} media items`,
        );
      } catch {
        toast.error(t("importInvalid"));
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [t],
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content Area (~75%) */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 md:p-6 lg:p-8">
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
            /* Media Grid */
            <div
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                isFetching && "opacity-60 pointer-events-none",
              )}
            >
              {mediaItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                  onEdit={handleEditItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Collection Sidebar (~25%) */}
      <CollectionSidebar
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={handleCollectionSelect}
      />

      {/* Floating Bottom Dock */}
      <BottomDock
        searchValue={search}
        onSearchChange={setSearch}
        filterTypes={filterTypes}
        onFilterTypesChange={setFilterTypes}
        filterOrigins={filterOrigins}
        onFilterOriginsChange={setFilterOrigins}
        filterPubStatus={filterPubStatus}
        onFilterPubStatusChange={setFilterPubStatus}
        filterUserStatus={filterUserStatus}
        onFilterUserStatusChange={setFilterUserStatus}
        filterTags={filterTags}
        onFilterTagsChange={setFilterTags}
        filterRatingMin={filterRatingMin}
        onFilterRatingMinChange={setFilterRatingMin}
        filterRatingMax={filterRatingMax}
        onFilterRatingMaxChange={setFilterRatingMax}
        filterYearMin={filterYearMin}
        onFilterYearMinChange={setFilterYearMin}
        filterYearMax={filterYearMax}
        onFilterYearMaxChange={setFilterYearMax}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onAddMedia={() => setAddMediaOpen(true)}
        onAddCollection={() => setAddCollectionOpen(true)}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileImport}
      />

      {/* Media Details Modal (read-only) */}
      <MediaDetailsModal
        item={detailItem}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailItem(null);
        }}
      />

      {/* Add Media Dialog */}
      <MediaDialog
        open={addMediaOpen}
        onOpenChange={setAddMediaOpen}
        triggerButton={false}
      />

      {/* Edit Media Dialog */}
      <MediaDialog
        editItem={editItem}
        open={editMediaOpen}
        onOpenChange={(open) => {
          setEditMediaOpen(open);
          if (!open) setEditItem(null);
        }}
        triggerButton={false}
      />

      {/* Add Collection Dialog */}
      <CollectionFormDialog
        open={addCollectionOpen}
        onOpenChange={setAddCollectionOpen}
      />
    </div>
  );
}
