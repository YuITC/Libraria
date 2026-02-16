"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";

const DistributionChart = dynamic(
  () =>
    import("@/components/dashboard/charts").then((m) => m.DistributionChart),
  { loading: () => <ChartSkeleton /> },
);
const TopTagsChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.TopTagsChart),
  { loading: () => <ChartSkeleton /> },
);
const TimelineChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.TimelineChart),
  { loading: () => <ChartSkeleton /> },
);

function ChartSkeleton() {
  return (
    <div className="glass-strong rounded-xl p-6 h-[300px] animate-pulse flex items-center justify-center">
      <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
    </div>
  );
}

export function DashboardContent() {
  const t = useTranslations("dashboard");

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      {/* <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
      </div> */}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Pie Chart */}
        <DistributionChart />

        {/* Top Tags Bar Chart */}
        <TopTagsChart />

        {/* Timeline Area Chart (full width) */}
        <div className="lg:col-span-2">
          <TimelineChart />
        </div>
      </div>
    </div>
  );
}
