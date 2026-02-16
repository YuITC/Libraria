"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFullLibraryData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Parallel fetch for speed
  const [mediaResult, collectionsResult, relationsResult] = await Promise.all([
    supabase.from("media_items").select("*").eq("user_id", user.id),
    supabase.from("collections").select("*").eq("user_id", user.id),
    supabase.from("collection_media").select("*"), // RLS should filter this naturally
  ]);

  if (mediaResult.error) throw new Error(mediaResult.error.message);
  if (collectionsResult.error) throw new Error(collectionsResult.error.message);
  if (relationsResult.error) throw new Error(relationsResult.error.message);

  // We need to filter relations to only those belonging to the user's collections
  // (Assuming RLS might be broad or we want to be explicit)
  const collectionIds = new Set(collectionsResult.data.map((c) => c.id));
  const validRelations = relationsResult.data.filter((r) =>
    collectionIds.has(r.collection_id),
  );

  return {
    version: 2, // Bump version to indicate support for relations
    exported_at: new Date().toISOString(),
    media: mediaResult.data,
    collections: collectionsResult.data,
    collection_media: validRelations,
  };
}
