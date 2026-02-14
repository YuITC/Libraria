"use server";

import { createClient } from "@/lib/supabase/server";

// =============================================================================
// Distribution (Pie Charts)
// =============================================================================

export interface DistributionData {
  label: string;
  value: number;
  color: string;
}

const TYPE_COLORS: Record<string, string> = {
  book: "#3B82F6",
  movie: "#F59E0B",
  game: "#10B981",
  music: "#EC4899",
  comic: "#F97316",
};

const ORIGIN_COLORS: Record<string, string> = {
  vn: "#EF4444",
  cn: "#F59E0B",
  jp: "#EC4899",
  kr: "#8B5CF6",
  us: "#3B82F6",
  uk: "#10B981",
  eu: "#6366F1",
  other: "#94A3B8",
};

const STATUS_COLORS: Record<string, string> = {
  planning: "#94A3B8",
  ongoing: "#3B82F6",
  completed: "#10B981",
  dropped: "#EF4444",
};

export async function getDistributionByType(): Promise<DistributionData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.from("media_items").select("type");

  if (error) throw new Error(error.message);
  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const item of data) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value,
      color: TYPE_COLORS[label] || "#94A3B8",
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getDistributionByOrigin(): Promise<DistributionData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("media_items")
    .select("origin")
    .not("origin", "is", null);

  if (error) throw new Error(error.message);
  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const item of data) {
    if (item.origin) {
      counts[item.origin] = (counts[item.origin] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value,
      color: ORIGIN_COLORS[label] || "#94A3B8",
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getDistributionByPubStatus(): Promise<
  DistributionData[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("media_items")
    .select("pub_status")
    .not("pub_status", "is", null);

  if (error) throw new Error(error.message);
  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const item of data) {
    if (item.pub_status) {
      counts[item.pub_status] = (counts[item.pub_status] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value,
      color: STATUS_COLORS[label] || "#94A3B8",
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getDistributionByUserStatus(): Promise<
  DistributionData[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("media_items")
    .select("user_status")
    .not("user_status", "is", null);

  if (error) throw new Error(error.message);
  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const item of data) {
    if (item.user_status) {
      counts[item.user_status] = (counts[item.user_status] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value,
      color: STATUS_COLORS[label] || "#94A3B8",
    }))
    .sort((a, b) => b.value - a.value);
}

// =============================================================================
// Top Tags (Bar Chart)
// =============================================================================

export interface TagData {
  tag: string;
  count: number;
}

export async function getTopTags(limit = 10): Promise<TagData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.from("media_items").select("tags");

  if (error) throw new Error(error.message);
  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const item of data) {
    if (item.tags && Array.isArray(item.tags)) {
      for (const tag of item.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// =============================================================================
// Timeline (Line/Area Chart)
// =============================================================================

export interface TimelineData {
  month: string;
  added: number;
  completed: number;
}

export async function getTimeline(months = 6): Promise<TimelineData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Generate month labels
  const now = new Date();
  const monthLabels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toISOString().slice(0, 7)); // "2026-01"
  }

  const startDate = monthLabels[0] + "-01";

  // Fetch items created in range
  const { data: addedItems } = await supabase
    .from("media_items")
    .select("created_at")
    .gte("created_at", startDate);

  // Fetch items completed in range
  const { data: completedItems } = await supabase
    .from("media_items")
    .select("completed_at")
    .not("completed_at", "is", null)
    .gte("completed_at", startDate);

  // Aggregate by month
  const addedCounts: Record<string, number> = {};
  const completedCounts: Record<string, number> = {};

  for (const item of addedItems || []) {
    const month = item.created_at.slice(0, 7);
    addedCounts[month] = (addedCounts[month] || 0) + 1;
  }

  for (const item of completedItems || []) {
    if (item.completed_at) {
      const month = item.completed_at.slice(0, 7);
      completedCounts[month] = (completedCounts[month] || 0) + 1;
    }
  }

  return monthLabels.map((month) => ({
    month,
    added: addedCounts[month] || 0,
    completed: completedCounts[month] || 0,
  }));
}
