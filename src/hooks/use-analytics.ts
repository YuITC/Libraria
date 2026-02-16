"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDistributionByType,
  getDistributionByOrigin,
  getDistributionByPubStatus,
  getDistributionByUserStatus,
  getTopTags,
  getTimeline,
} from "@/actions/analytics";

export function useDistributionByType() {
  return useQuery({
    queryKey: ["analytics", "distribution", "type"],
    queryFn: () => getDistributionByType(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDistributionByOrigin() {
  return useQuery({
    queryKey: ["analytics", "distribution", "origin"],
    queryFn: () => getDistributionByOrigin(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDistributionByPubStatus() {
  return useQuery({
    queryKey: ["analytics", "distribution", "pubStatus"],
    queryFn: () => getDistributionByPubStatus(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDistributionByUserStatus() {
  return useQuery({
    queryKey: ["analytics", "distribution", "userStatus"],
    queryFn: () => getDistributionByUserStatus(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopTags(order: "most" | "least" = "most") {
  return useQuery({
    queryKey: ["analytics", "topTags", order],
    queryFn: () => getTopTags(10, order),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTimeline(year?: number) {
  return useQuery({
    queryKey: ["analytics", "timeline", year],
    queryFn: () => getTimeline(year),
    staleTime: 5 * 60 * 1000,
  });
}
