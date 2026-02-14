// =============================================================================
// Database Types - Matching Supabase PostgreSQL schema
// =============================================================================

export type MediaType = "movie" | "book" | "comic" | "game" | "music";

export type Origin = "vn" | "cn" | "jp" | "kr" | "us" | "uk" | "eu" | "other";

export type Status = "planning" | "ongoing" | "completed" | "dropped";

export type MessageRole = "user" | "assistant" | "system";

export type AIModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash"
  | "gemini-2.0-pro";

export interface UserPreferences {
  theme: "light" | "dark";
  language: "en" | "vi";
  default_view: "grid" | "list";
}

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  preferences: UserPreferences;
  ai_selected_model: AIModel;
  ai_credentials_encrypted: string | null;
  created_at: string;
  updated_at: string;
}

export interface UrlEntry {
  label: string;
  url: string;
}

export interface MediaItem {
  id: string;
  user_id: string;
  title: string;
  type: MediaType;
  origin: Origin | null;
  pub_status: Status | null;
  user_status: Status | null;
  author: string | null;
  release_year: number | null;
  rating: number | null;
  tags: string[];
  urls: UrlEntry[];
  notes: string | null;
  cover_image_url: string | null;
  embedding: number[] | null;
  content_hash: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CollectionMedia {
  collection_id: string;
  media_item_id: string;
  added_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Joined / computed types
export interface CollectionWithCount extends Collection {
  item_count: number;
}

export interface MediaItemCreate {
  title: string;
  type: MediaType;
  origin?: Origin;
  author?: string;
  release_year?: number;
  rating?: number;
  pub_status?: Status;
  user_status?: Status;
  tags?: string[];
  urls?: UrlEntry[];
  cover_image_url?: string;
  notes?: string;
}

export interface MediaItemUpdate extends Partial<MediaItemCreate> {
  id: string;
}

// Analytics types
export interface AnalyticsDistribution {
  user_id: string;
  type: MediaType;
  origin: Origin;
  pub_status: Status;
  user_status: Status;
  count: number;
}

export interface AnalyticsTopTag {
  user_id: string;
  tag: string;
  usage_count: number;
}

export interface AnalyticsTimeline {
  user_id: string;
  month: string;
  added_count: number;
  completed_count: number;
}
