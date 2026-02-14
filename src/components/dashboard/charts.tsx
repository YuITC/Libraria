"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  Loader2,
  PieChart as PieIcon,
  TrendingUp,
  Tag,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  useDistributionByType,
  useDistributionByOrigin,
  useDistributionByPubStatus,
  useDistributionByUserStatus,
  useTopTags,
  useTimeline,
} from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

// =============================================================================
// Custom Tooltip
// =============================================================================

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-sm shadow-lg">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// =============================================================================
// Distribution Pie Chart (with toggle)
// =============================================================================

export function DistributionChart() {
  const t = useTranslations("dashboard");
  const tMedia = useTranslations("media");
  const [mode, setMode] = useState<
    "type" | "origin" | "pubStatus" | "userStatus"
  >("type");

  const typeData = useDistributionByType();
  const originData = useDistributionByOrigin();
  const pubStatusData = useDistributionByPubStatus();
  const userStatusData = useDistributionByUserStatus();

  const datasets = {
    type: typeData,
    origin: originData,
    pubStatus: pubStatusData,
    userStatus: userStatusData,
  };

  const labelMaps: Record<string, (key: string) => string> = {
    type: (key) => tMedia(`types.${key}`),
    origin: (key) => tMedia(`origins.${key}`),
    pubStatus: (key) => tMedia(`statuses.${key}`),
    userStatus: (key) => tMedia(`statuses.${key}`),
  };

  const toggles = [
    { key: "type" as const, label: t("byType") },
    { key: "origin" as const, label: t("byOrigin") },
    { key: "pubStatus" as const, label: t("byPubStatus") },
    { key: "userStatus" as const, label: t("byUserStatus") },
  ];

  const currentData = datasets[mode];
  const chartData = (currentData.data || []).map((d) => ({
    ...d,
    name: labelMaps[mode](d.label),
  }));

  return (
    <ChartCard
      icon={PieIcon}
      title={t("distribution")}
      loading={currentData.isLoading}
    >
      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {toggles.map((tog) => (
          <button
            key={tog.key}
            onClick={() => setMode(tog.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              mode === tog.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tog.label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// =============================================================================
// Top Tags Bar Chart
// =============================================================================

export function TopTagsChart() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useTopTags();

  const chartData = (data || []).map((d) => ({
    name: d.tag,
    count: d.count,
  }));

  return (
    <ChartCard icon={Tag} title={t("topTags")} loading={isLoading}>
      {chartData.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.3}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="count"
              fill="url(#tagGradient)"
              radius={[0, 6, 6, 0]}
              animationBegin={0}
              animationDuration={800}
            />
            <defs>
              <linearGradient id="tagGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="oklch(0.55 0.15 185)" />
                <stop offset="100%" stopColor="oklch(0.6 0.14 170)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// =============================================================================
// Timeline Area Chart
// =============================================================================

export function TimelineChart() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useTimeline();

  const chartData = (data || []).map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }));

  return (
    <ChartCard
      icon={TrendingUp}
      title={t("timeline")}
      subtitle={t("lastMonths")}
      loading={isLoading}
    >
      {chartData.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="addedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="added"
              name={t("added")}
              stroke="#14B8A6"
              strokeWidth={2}
              fill="url(#addedGrad)"
              animationBegin={0}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="completed"
              name={t("completed")}
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#completedGrad)"
              animationBegin={200}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// =============================================================================
// Shared Components
// =============================================================================

function ChartCard({
  icon: Icon,
  title,
  subtitle,
  loading,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>

      {loading ? (
        <div className="h-[280px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[280px] flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No data yet</p>
      </div>
    </div>
  );
}

function formatMonth(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}
