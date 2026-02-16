"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function importLibraryData(data: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  let importedCollections = 0;
  let importedMedia = 0;
  let importedRelations = 0;

  // Import Collections
  if (data.collections && Array.isArray(data.collections)) {
    const collectionsToUpsert = data.collections.map((c: any) => ({
      id: c.id,
      user_id: user.id,
      name: c.name,
      color: c.color,
      created_at: c.created_at,
    }));

    if (collectionsToUpsert.length > 0) {
      const { error } = await supabase
        .from("collections")
        .upsert(collectionsToUpsert);

      if (error) {
        console.error("Error importing collections:", error);
        throw new Error(error.message);
      }
      importedCollections = collectionsToUpsert.length;
    }
  }

  // Import Media
  if (data.media && Array.isArray(data.media)) {
    const mediaToUpsert = data.media.map((m: any) => ({
      id: m.id,
      user_id: user.id,
      title: m.title,
      type: m.type,
      origin: m.origin,
      pub_status: m.pub_status,
      user_status: m.user_status,
      author: m.author,
      release_year: m.release_year,
      rating: m.rating,
      tags: m.tags || [],
      urls: m.urls ? JSON.parse(JSON.stringify(m.urls)) : [],
      notes: m.notes,
      cover_image_url: m.cover_image_url,
      created_at: m.created_at,
      completed_at: m.completed_at,
    }));

    if (mediaToUpsert.length > 0) {
      const { error } = await supabase
        .from("media_items")
        .upsert(mediaToUpsert);

      if (error) {
        console.error("Error importing media:", error);
        throw new Error(error.message);
      }
      importedMedia = mediaToUpsert.length;
    }
  }

  // Import Relationships (v2)
  if (data.collection_media && Array.isArray(data.collection_media)) {
    const relationsToUpsert = data.collection_media.map((r: any) => ({
      collection_id: r.collection_id,
      media_item_id: r.media_item_id,
      added_at: r.added_at,
    }));

    if (relationsToUpsert.length > 0) {
      const { error } = await supabase
        .from("collection_media")
        .upsert(relationsToUpsert, {
          onConflict: "collection_id,media_item_id",
        });

      if (error) {
        console.error("Error importing relations:", error);
      } else {
        importedRelations = relationsToUpsert.length;
      }
    }
  }

  revalidatePath("/[locale]/(protected)/library", "page");
  return {
    success: true,
    mediaCount: importedMedia,
    collectionCount: importedCollections,
    relationCount: importedRelations,
  };
}
