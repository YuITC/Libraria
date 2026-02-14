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

export function useTopTags() {
  return useQuery({
    queryKey: ["analytics", "topTags"],
    queryFn: () => getTopTags(10),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTimeline() {
  return useQuery({
    queryKey: ["analytics", "timeline"],
    queryFn: () => getTimeline(6),
    staleTime: 5 * 60 * 1000,
  });
}
