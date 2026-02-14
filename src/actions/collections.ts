"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// =============================================================================
// Read
// =============================================================================

export async function getCollections() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Get collections with item counts
  const { data: collections, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Get counts for each collection
  const collectionsWithCounts = await Promise.all(
    (collections || []).map(async (col) => {
      const { count } = await supabase
        .from("collection_media")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", col.id);

      return { ...col, item_count: count || 0 };
    }),
  );

  return collectionsWithCounts;
}

export async function getCollectionMediaIds(collectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collection_media")
    .select("media_item_id")
    .eq("collection_id", collectionId);

  if (error) throw new Error(error.message);
  return data?.map((cm) => cm.media_item_id) || [];
}

// =============================================================================
// Write
// =============================================================================

export async function createCollection(name: string, color: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collections")
    .insert({ name, color, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return data;
}

export async function updateCollection(
  id: string,
  name: string,
  color: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collections")
    .update({ name, color })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return data;
}

export async function deleteCollection(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return { success: true };
}

export async function addMediaToCollection(
  collectionId: string,
  mediaItemIds: string[],
) {
  const supabase = await createClient();

  const rows = mediaItemIds.map((mediaItemId) => ({
    collection_id: collectionId,
    media_item_id: mediaItemId,
  }));

  const { error } = await supabase
    .from("collection_media")
    .upsert(rows, { onConflict: "collection_id,media_item_id" });

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return { success: true };
}

export async function removeMediaFromCollection(
  collectionId: string,
  mediaItemIds: string[],
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collection_media")
    .delete()
    .eq("collection_id", collectionId)
    .in("media_item_id", mediaItemIds);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)/library", "page");
  return { success: true };
}
