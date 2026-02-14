"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMediaItems,
  createMediaItem,
  updateMediaItem,
  deleteMediaItem,
  bulkDeleteMediaItems,
  type MediaQueryParams,
} from "@/actions/media";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addMediaToCollection,
  removeMediaFromCollection,
} from "@/actions/collections";
import type { MediaItemCreate, MediaItemUpdate } from "@/types/database";

// =============================================================================
// Media Hooks
// =============================================================================

export function useMediaItems(params: MediaQueryParams = {}) {
  return useQuery({
    queryKey: ["media", params],
    queryFn: () => getMediaItems(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: MediaItemCreate) => createMediaItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: MediaItemUpdate) => updateMediaItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMediaItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useBulkDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteMediaItems(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

// =============================================================================
// Collection Hooks
// =============================================================================

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => getCollections(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      createCollection(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      color,
    }: {
      id: string;
      name: string;
      color: string;
    }) => updateCollection(id, name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useAddMediaToCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      mediaItemIds,
    }: {
      collectionId: string;
      mediaItemIds: string[];
    }) => addMediaToCollection(collectionId, mediaItemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useRemoveMediaFromCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      mediaItemIds,
    }: {
      collectionId: string;
      mediaItemIds: string[];
    }) => removeMediaFromCollection(collectionId, mediaItemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}
