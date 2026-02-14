// =============================================================================
// Application Constants
// =============================================================================

export const PREDEFINED_TAGS = [
  { label: "Romance", value: "romance" },
  { label: "Comedy", value: "comedy" },
  { label: "Drama", value: "drama" },
  { label: "Slice of Life", value: "sol" },
  { label: "School Life", value: "school" },
  { label: "Office Life", value: "office" },
  { label: "Action", value: "action" },
  { label: "Adventure", value: "adventure" },
  { label: "Martial Arts", value: "martialarts" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Isekai", value: "isekai" },
  { label: "Reincarnation", value: "reincarnation" },
  { label: "Mystery", value: "mystery" },
  { label: "Detective", value: "detective" },
  { label: "Cultivation", value: "cultivation" },
  { label: "Leveling", value: "leveling" },
  { label: "Sci-Fi", value: "scifi" },
  { label: "Sports", value: "sports" },
  { label: "Music", value: "music" },
  { label: "Girl's Love", value: "gl" },
  { label: "Boy's Love", value: "bl" },
  { label: "18+", value: "18" },
] as const;

export const COLLECTION_COLORS = [
  { name: "Red", value: "#EF4444" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Emerald", value: "#10B981" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Orange", value: "#F97316" },
  { name: "Purple", value: "#A855F7" },
] as const;

export const MEDIA_TYPES = [
  { label: "Movie", value: "movie" },
  { label: "Book", value: "book" },
  { label: "Comic", value: "comic" },
  { label: "Game", value: "game" },
  { label: "Music", value: "music" },
] as const;

export const ORIGINS = [
  { label: "Vietnam", value: "vn" },
  { label: "China", value: "cn" },
  { label: "Japan", value: "jp" },
  { label: "Korea", value: "kr" },
  { label: "USA", value: "us" },
  { label: "UK", value: "uk" },
  { label: "Europe", value: "eu" },
  { label: "Other", value: "other" },
] as const;

export const STATUSES = [
  { label: "Planning", value: "planning" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Dropped", value: "dropped" },
] as const;

export const AI_MODELS = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
  { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
  { label: "Gemini 2.0 Pro", value: "gemini-2.0-pro" },
] as const;

export const ITEMS_PER_PAGE = 20;

export const SEARCH_DEBOUNCE_MS = 300;

export const REACT_QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes
