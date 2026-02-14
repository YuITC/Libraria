"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MediaItemCreate, MediaItemUpdate } from "@/types/database";
import { ITEMS_PER_PAGE } from "@/lib/constants";

// =============================================================================
// Types
// =============================================================================

export interface MediaQueryParams {
  search?: string;
  type?: string[];
  origin?: string[];
  pub_status?: string[];
  user_status?: string[];
  tags?: string[];
  rating_min?: number;
  rating_max?: number;
  sort_by?:
    | "title_asc"
    | "title_desc"
    | "rating_high"
    | "rating_low"
    | "updated_new"
    | "updated_old";
  page?: number;
  collection_id?: string;
}

// =============================================================================
// Read Operations
// =============================================================================

export async function getMediaItems(params: MediaQueryParams = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const page = params.page || 1;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from("media_items")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  // Search (ILIKE on title)
  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  // Filters
  if (params.type?.length) {
    query = query.in("type", params.type);
  }
  if (params.origin?.length) {
    query = query.in("origin", params.origin);
  }
  if (params.pub_status?.length) {
    query = query.in("pub_status", params.pub_status);
  }
  if (params.user_status?.length) {
    query = query.in("user_status", params.user_status);
  }
  if (params.tags?.length) {
    query = query.overlaps("tags", params.tags);
  }
  if (params.rating_min !== undefined) {
    query = query.gte("rating", params.rating_min);
  }
  if (params.rating_max !== undefined) {
    query = query.lte("rating", params.rating_max);
  }

  // Collection filter (join through collection_media)
  if (params.collection_id) {
    const { data: collectionMediaIds } = await supabase
      .from("collection_media")
      .select("media_item_id")
      .eq("collection_id", params.collection_id);

    const ids = collectionMediaIds?.map((cm) => cm.media_item_id) || [];
    if (ids.length > 0) {
      query = query.in("id", ids);
    } else {
      // No items in this collection — return empty
      return { data: [], count: 0, page, totalPages: 0 };
    }
  }

  // Sort
  switch (params.sort_by) {
    case "title_asc":
      query = query.order("title", { ascending: true });
      break;
    case "title_desc":
      query = query.order("title", { ascending: false });
      break;
    case "rating_high":
      query = query.order("rating", { ascending: false, nullsFirst: false });
      break;
    case "rating_low":
      query = query.order("rating", { ascending: true, nullsFirst: false });
      break;
    case "updated_old":
      query = query.order("updated_at", { ascending: true });
      break;
    case "updated_new":
    default:
      query = query.order("updated_at", { ascending: false });
      break;
  }

  // Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    data: data || [],
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
  };
}

export async function getMediaItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// =============================================================================
// Write Operations
// =============================================================================

export async function createMediaItem(item: MediaItemCreate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("media_items")
    .insert({
      ...item,
      user_id: user.id,
      urls: item.urls ? JSON.parse(JSON.stringify(item.urls)) : [],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return data;
}

export async function updateMediaItem(item: MediaItemUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { id, ...updates } = item;

  const { data, error } = await supabase
    .from("media_items")
    .update({
      ...updates,
      urls: updates.urls ? JSON.parse(JSON.stringify(updates.urls)) : undefined,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return data;
}

export async function deleteMediaItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("media_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return { success: true };
}

export async function bulkDeleteMediaItems(ids: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("media_items")
    .delete()
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return { success: true };
}
