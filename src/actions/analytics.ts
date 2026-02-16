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

// =============================================================================
// Top Tags (Bar Chart)
// =============================================================================

export interface TagData {
  tag: string;
  count: number;
}

export async function getTopTags(
  limit = 10,
  order: "most" | "least" = "most",
): Promise<TagData[]> {
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
    .sort((a, b) => (order === "most" ? b.count - a.count : a.count - b.count))
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

export async function getTimeline(year?: number): Promise<TimelineData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Default to current year if not provided
  const targetYear = year || new Date().getFullYear();

  // Create start and end timestamps in UTC that correspond to the start/end of the year in GMT+7
  // GMT+7 is UTC+7.
  // Start of year (GMT+7): YYYY-01-01 00:00:00
  // -> UTC: (YYYY-1)-12-31 17:00:00
  // End of year (GMT+7): YYYY-12-31 23:59:59.999
  // -> UTC: YYYY-12-31 16:59:59.999

  const startUtc = new Date(Date.UTC(targetYear - 1, 11, 31, 17, 0, 0));
  const endUtc = new Date(Date.UTC(targetYear, 11, 31, 16, 59, 59, 999));

  // Fetch items created in range
  const { data: addedItems } = await supabase
    .from("media_items")
    .select("created_at")
    .gte("created_at", startUtc.toISOString())
    .lte("created_at", endUtc.toISOString());

  // Fetch items completed in range
  const { data: completedItems } = await supabase
    .from("media_items")
    .select("completed_at")
    .not("completed_at", "is", null)
    .gte("completed_at", startUtc.toISOString())
    .lte("completed_at", endUtc.toISOString());

  // Helper to get month index (0-11) from UTC string adjusted to GMT+7
  const getMonthIndexGMT7 = (dateStr: string) => {
    const date = new Date(dateStr);
    // Add 7 hours to convert to GMT+7 time
    const gmt7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return gmt7Date.getUTCMonth();
  };

  // Initialize all 12 months
  const monthsData: TimelineData[] = Array.from({ length: 12 }, (_, i) => {
    // Format: "YYYY-MM"
    const monthStr = `${targetYear}-${String(i + 1).padStart(2, "0")}`;
    return {
      month: monthStr,
      added: 0,
      completed: 0,
    };
  });

  for (const item of addedItems || []) {
    const monthIndex = getMonthIndexGMT7(item.created_at);
    if (monthsData[monthIndex]) {
      monthsData[monthIndex].added++;
    }
  }

  for (const item of completedItems || []) {
    if (item.completed_at) {
      const monthIndex = getMonthIndexGMT7(item.completed_at);
      if (monthsData[monthIndex]) {
        monthsData[monthIndex].completed++;
      }
    }
  }

  return monthsData;
}
