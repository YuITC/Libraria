import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// =============================================================================
// Librarian Worker Tools (Media CRUD)
// =============================================================================

export const librarianTools = {
  search_media: tool({
    description: "Search and filter media items in the user's library",
    inputSchema: z.object({
      query: z.string().optional().describe("Search query for title"),
      type: z
        .array(z.enum(["movie", "book", "comic", "game", "music"]))
        .optional(),
      origin: z
        .array(z.enum(["vn", "cn", "jp", "kr", "us", "uk", "eu", "other"]))
        .optional(),
      pub_status: z
        .array(z.enum(["planning", "ongoing", "completed", "dropped"]))
        .optional(),
      user_status: z
        .array(z.enum(["planning", "ongoing", "completed", "dropped"]))
        .optional(),
      tags: z.array(z.string()).optional(),
      rating_min: z.number().min(0).max(10).optional(),
      rating_max: z.number().min(0).max(10).optional(),
      limit: z.number().min(1).max(50).default(20),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { items: [], total: 0 };

      let query = supabase
        .from("media_items")
        .select(
          "id, title, type, origin, author, release_year, rating, pub_status, user_status, tags, notes, cover_image_url",
          { count: "exact" },
        )
        .eq("user_id", user.id);

      if (params.query) query = query.ilike("title", `%${params.query}%`);
      if (params.type?.length) query = query.in("type", params.type);
      if (params.origin?.length) query = query.in("origin", params.origin);
      if (params.pub_status?.length)
        query = query.in("pub_status", params.pub_status);
      if (params.user_status?.length)
        query = query.in("user_status", params.user_status);
      if (params.tags?.length) query = query.overlaps("tags", params.tags);
      if (params.rating_min !== undefined)
        query = query.gte("rating", params.rating_min);
      if (params.rating_max !== undefined)
        query = query.lte("rating", params.rating_max);

      query = query
        .limit(params.limit)
        .order("updated_at", { ascending: false });

      const { data, count } = await query;
      return { items: data || [], total: count || 0 };
    },
  }),

  create_media: tool({
    description: "Add a new media item to the library",
    inputSchema: z.object({
      title: z.string().describe("Title of the media"),
      type: z.enum(["movie", "book", "comic", "game", "music"]),
      origin: z
        .enum(["vn", "cn", "jp", "kr", "us", "uk", "eu", "other"])
        .optional(),
      author: z.string().optional(),
      release_year: z.number().optional(),
      rating: z.number().min(0).max(10).optional(),
      pub_status: z
        .enum(["planning", "ongoing", "completed", "dropped"])
        .optional(),
      user_status: z
        .enum(["planning", "ongoing", "completed", "dropped"])
        .optional(),
      tags: z.array(z.string()).optional(),
      cover_image_url: z.string().optional(),
      notes: z.string().optional(),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { id: "", created: false };

      const { data, error } = await supabase
        .from("media_items")
        .insert({ ...params, user_id: user.id })
        .select("id")
        .single();

      if (error) return { id: "", created: false, error: error.message };
      return { id: data.id, created: true };
    },
  }),

  update_media: tool({
    description: "Update an existing media item (partial update)",
    inputSchema: z.object({
      id: z.string().describe("Media item ID"),
      title: z.string().optional(),
      type: z.enum(["movie", "book", "comic", "game", "music"]).optional(),
      origin: z
        .enum(["vn", "cn", "jp", "kr", "us", "uk", "eu", "other"])
        .optional(),
      author: z.string().optional(),
      release_year: z.number().optional(),
      rating: z.number().min(0).max(10).optional(),
      pub_status: z
        .enum(["planning", "ongoing", "completed", "dropped"])
        .optional(),
      user_status: z
        .enum(["planning", "ongoing", "completed", "dropped"])
        .optional(),
      tags: z.array(z.string()).optional(),
      cover_image_url: z.string().optional(),
      notes: z.string().optional(),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { id: params.id, updated: false };

      const { id, ...updates } = params;
      const { error } = await supabase
        .from("media_items")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) return { id, updated: false, error: error.message };
      return { id, updated: true };
    },
  }),

  delete_media: tool({
    description: "Delete one or more media items",
    inputSchema: z.object({
      ids: z.array(z.string()).describe("Array of media item IDs to delete"),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { deleted_count: 0 };

      const { error } = await supabase
        .from("media_items")
        .delete()
        .in("id", params.ids)
        .eq("user_id", user.id);

      if (error) return { deleted_count: 0, error: error.message };
      return { deleted_count: params.ids.length };
    },
  }),
};

// =============================================================================
// Analyst Worker Tools
// =============================================================================

export const analystTools = {
  analyze_data: tool({
    description: "Query analytics data about the media library",
    inputSchema: z.object({
      analysis_type: z
        .enum(["distribution", "top_tags", "timeline"])
        .describe("Type of analysis"),
      group_by: z
        .enum(["type", "origin", "pub_status", "user_status"])
        .optional()
        .describe("For distribution analysis, group by this field"),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { data: [], insights: "Not authenticated" };

      if (params.analysis_type === "distribution") {
        const field = params.group_by || "type";
        const { data } = await supabase
          .from("media_items")
          .select(field)
          .eq("user_id", user.id);

        const counts: Record<string, number> = {};
        for (const item of data || []) {
          const val = (item as Record<string, string>)[field];
          if (val) counts[val] = (counts[val] || 0) + 1;
        }
        return {
          data: Object.entries(counts).map(([k, v]) => ({
            label: k,
            count: v,
          })),
        };
      }

      if (params.analysis_type === "top_tags") {
        const { data } = await supabase
          .from("media_items")
          .select("tags")
          .eq("user_id", user.id);

        const counts: Record<string, number> = {};
        for (const item of data || []) {
          if (item.tags && Array.isArray(item.tags)) {
            for (const tag of item.tags) {
              counts[tag] = (counts[tag] || 0) + 1;
            }
          }
        }
        return {
          data: Object.entries(counts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        };
      }

      if (params.analysis_type === "timeline") {
        const { data: items } = await supabase
          .from("media_items")
          .select("created_at, completed_at")
          .eq("user_id", user.id);

        return {
          data: {
            total_items: items?.length || 0,
            completed: items?.filter((i) => i.completed_at).length || 0,
          },
        };
      }

      return { data: [] };
    },
  }),
};

// =============================================================================
// Web Surfer Worker Tools
// =============================================================================

export const webSurferTools = {
  search_web: tool({
    description: "Search the web for information using Tavily API",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
      max_results: z.number().min(1).max(10).default(5),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { results: [], error: "Not authenticated" };

      // Get Tavily key from encrypted credentials
      const { data: profile } = await supabase
        .from("profiles")
        .select("ai_credentials_encrypted")
        .eq("id", user.id)
        .single();

      if (!profile?.ai_credentials_encrypted) {
        return {
          results: [],
          error: "No Tavily API key configured. Please add it in Settings.",
        };
      }

      // Decrypt
      const { decrypt } = await import("@/lib/encryption");
      let tavilyKey: string;
      try {
        const decrypted = await decrypt(
          profile.ai_credentials_encrypted,
          process.env.ENCRYPTION_SECRET!,
        );
        const keys = JSON.parse(decrypted);
        tavilyKey = keys.tavily_key;
        if (!tavilyKey)
          return {
            results: [],
            error: "No Tavily API key found. Please add it in Settings.",
          };
      } catch {
        return { results: [], error: "Failed to decrypt API keys" };
      }

      // Call Tavily
      try {
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: params.query,
            max_results: params.max_results,
            search_depth: "basic",
          }),
        });

        if (!response.ok)
          return { results: [], error: `Tavily API error: ${response.status}` };
        const data = await response.json();
        return {
          results: (data.results || []).map(
            (r: {
              title: string;
              url: string;
              content: string;
              score: number;
            }) => ({
              title: r.title,
              url: r.url,
              content: r.content?.slice(0, 500),
              score: r.score,
            }),
          ),
        };
      } catch {
        return { results: [], error: "Web search failed" };
      }
    },
  }),
};

// =============================================================================
// Collection Manager Worker Tools
// =============================================================================

export const collectionManagerTools = {
  search_collections: tool({
    description: "Search and list collections",
    inputSchema: z.object({
      query: z.string().optional().describe("Search by collection name"),
      limit: z.number().min(1).max(50).default(20),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { collections: [] };

      let q = supabase
        .from("collections")
        .select("id, name, color")
        .eq("user_id", user.id)
        .limit(params.limit);

      if (params.query) q = q.ilike("name", `%${params.query}%`);

      const { data } = await q;

      // Get counts
      const collections = await Promise.all(
        (data || []).map(async (col) => {
          const { count } = await supabase
            .from("collection_media")
            .select("*", { count: "exact", head: true })
            .eq("collection_id", col.id);
          return { ...col, item_count: count || 0 };
        }),
      );

      return { collections };
    },
  }),

  create_collection: tool({
    description: "Create a new collection",
    inputSchema: z.object({
      name: z.string().describe("Collection name"),
      color: z
        .string()
        .default("#EF4444")
        .describe("Color hex from predefined palette"),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { id: "", created: false };

      const { data, error } = await supabase
        .from("collections")
        .insert({ name: params.name, color: params.color, user_id: user.id })
        .select("id")
        .single();

      if (error) return { id: "", created: false, error: error.message };
      return { id: data.id, created: true };
    },
  }),

  add_media_to_collection: tool({
    description: "Add media items to a collection",
    inputSchema: z.object({
      collection_id: z.string().describe("Collection ID"),
      media_ids: z.array(z.string()).describe("Array of media item IDs"),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const rows = params.media_ids.map((id) => ({
        collection_id: params.collection_id,
        media_item_id: id,
      }));

      const { error } = await supabase
        .from("collection_media")
        .upsert(rows, { onConflict: "collection_id,media_item_id" });

      if (error) return { added_count: 0, error: error.message };
      return { added_count: params.media_ids.length };
    },
  }),

  remove_media_from_collection: tool({
    description: "Remove media items from a collection",
    inputSchema: z.object({
      collection_id: z.string().describe("Collection ID"),
      media_ids: z.array(z.string()).describe("Array of media item IDs"),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("collection_media")
        .delete()
        .eq("collection_id", params.collection_id)
        .in("media_item_id", params.media_ids);

      if (error) return { removed_count: 0, error: error.message };
      return { removed_count: params.media_ids.length };
    },
  }),

  delete_collection: tool({
    description: "Delete a collection",
    inputSchema: z.object({
      ids: z.array(z.string()).describe("Array of collection IDs to delete"),
    }),
    execute: async (params) => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { deleted_count: 0 };

      const { error } = await supabase
        .from("collections")
        .delete()
        .in("id", params.ids)
        .eq("user_id", user.id);

      if (error) return { deleted_count: 0, error: error.message };
      return { deleted_count: params.ids.length };
    },
  }),
};
