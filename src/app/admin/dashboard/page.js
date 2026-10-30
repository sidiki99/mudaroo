
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Coins,
  ClipboardList,
  Package,
  User,
  RefreshCw,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --------------------------------------------------
// API CONFIGURATION
// --------------------------------------------------

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const DASHBOARD_ENDPOINT = "/api/admin/dashboard";

// Based on the revenue route you provided:
// src/app/api/admin/revenue/route.js
const REVENUE_ENDPOINT = "/api/admin/dashboard/revenue";

// Based on your existing order-status endpoint.
const STATUS_ENDPOINT = "/api/admin/dashboard/order-status";

const RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
];

const STATUSES = [
  { key: "pending", label: "Pending", color: "#F59E0B" },
  { key: "processing", label: "Processing", color: "#3B82F6" },
  { key: "shipped", label: "Shipped", color: "#8B5CF6" },
  { key: "delivered", label: "Delivered", color: "#10B981" },
  { key: "cancelled", label: "Cancelled", color: "#EF4444" },
  { key: "returned", label: "Returned", color: "#6B7280" },
];

const OVERVIEW_CARDS = [
  {
    label: "Total Revenue",
    icon: Coins,
    value: (stats) =>
      `PKR ${Number(stats.totalRevenue ?? 0).toLocaleString("en-PK")}`,
    change: (stats) => stats.revenueChange,
  },
  {
    label: "Orders",
    icon: ClipboardList,
    value: (stats) =>
      Number(stats.totalOrders ?? 0).toLocaleString("en-PK"),
    change: (stats) => stats.ordersChange,
  },
  {
    label: "Products",
    icon: Package,
    value: (stats) =>
      Number(stats.totalProducts ?? 0).toLocaleString("en-PK"),
    change: (stats) => stats.productsChange,
  },
  {
    label: "Customers",
    icon: User,
    value: (stats) =>
      Number(stats.totalCustomers ?? 0).toLocaleString("en-PK"),
    change: (stats) => stats.customersChange,
  },
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatPKR(value) {
  const number = Number(value) || 0;

  if (Math.abs(number) >= 1_000_000) {
    return `PKR ${(number / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(number) >= 1_000) {
    return `PKR ${(number / 1_000).toFixed(1)}K`;
  }

  return `PKR ${number.toLocaleString("en-PK")}`;
}

function formatDay(value) {
  // Parse YYYY-MM-DD as a local calendar date.
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      ).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
      });
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value ?? "");
  }

  return date.toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
  });
}

function formatChange(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return `${number > 0 ? "+" : ""}${number}%`;
}

// --------------------------------------------------
// NORMALIZE API RESPONSES
// --------------------------------------------------

function normalizeOverview(json) {
  const raw = json?.data ?? json?.stats ?? json;

  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    return null;
  }

  return raw;
}

function normalizeRevenue(json) {
  // Supports { success: true, data: [...] }
  // and a direct array response.
  const raw = json?.data ?? json;

  const rows = Array.isArray(raw)
    ? raw
    : raw?.items ?? raw?.results ?? [];

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => ({
    date: row.date ?? row.day ?? row.label,
    revenue: Number(
      row.revenue ?? row.total ?? row.amount ?? 0
    ),
  })).filter((row) => row.date != null);
}

function normalizeStatus(json) {
  // Your status API returns { success: true, data: [...] }
  const raw = json?.data ?? json;

  const rows = Array.isArray(raw)
    ? raw
    : raw?.orders ?? raw?.items ?? [];

  const counts = {};

  if (Array.isArray(rows)) {
    rows.forEach((row) => {
      const key = String(
        row.key ?? row.status ?? row.name ?? ""
      ).toLowerCase();

      if (!key) return;

      counts[key] =
        (counts[key] || 0) +
        Number(row.value ?? row.count ?? row.total ?? 0);
    });
  } else if (raw && typeof raw === "object") {
    Object.entries(raw).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase();

      // Ignore response metadata.
      if (["success", "message"].includes(normalizedKey)) {
        return;
      }

      const count =
        typeof value === "number" ||
        typeof value === "string"
          ? Number(value)
          : NaN;

      if (Number.isFinite(count)) {
        counts[normalizedKey] = count;
      }
    });
  }

  return STATUSES.map((status) => ({
    ...status,
    value: counts[status.key] ?? 0,
  }));
}

// --------------------------------------------------
// SHARED FETCH HOOK
// --------------------------------------------------

function useDashboardFetch(url, normalize, refreshKey) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        const json = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            json?.message || `Request failed (${response.status})`
          );
        }

        if (json?.success === false) {
          throw new Error(
            json.message || "The API could not load the data."
          );
        }

        setData(normalize(json));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, [url, normalize, refreshKey]);

  return { data, loading, error };
}

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function Card({ title, action, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900">
          {title}
        </h2>
        {action}
      </div>

      {children}
    </section>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-100 ${className}`}
    />
  );
}

function ErrorState({ message }) {
  return (
    <div
      role="alert"
      className="flex min-h-48 items-center justify-center rounded-lg bg-red-50 px-4 text-center text-sm text-red-600"
    >
      Could not load data: {message}
    </div>
  );
}

function StatCard({
  label,
  icon: Icon,
  value,
  change,
  loading,
}) {
  const formattedChange = formatChange(change);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          {loading ? (
            <Skeleton className="mt-3 h-8 w-28" />
          ) : (
            <p className="mt-2 break-words text-xl font-bold text-slate-900 sm:text-2xl">
              {value}
            </p>
          )}

          {!loading && formattedChange !== null && (
            <p
              className={`mt-2 text-xs ${
                Number(change) > 0
                  ? "text-green-600"
                  : Number(change) < 0
                    ? "text-red-600"
                    : "text-slate-500"
              }`}
            >
              Change: {formattedChange} vs previous 7 days
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

// --------------------------------------------------
// OVERVIEW CARDS
// --------------------------------------------------

function OverviewCards({ refreshKey, onRefresh }) {
  const {
    data: stats,
    loading,
    error,
  } = useDashboardFetch(
    `${API_BASE}${DASHBOARD_ENDPOINT}`,
    normalizeOverview,
    refreshKey
  );

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Overview / Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Here&apos;s what&apos;s happening
            with your Mudaroo store today.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            Could not load dashboard statistics: {error}
          </p>

          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {error ? null : stats ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {OVERVIEW_CARDS.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              icon={card.icon}
              loading={loading}
              value={card.value(stats)}
              change={card.change(stats)}
            />
          ))}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {OVERVIEW_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-8 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No dashboard statistics are available.
        </p>
      )}
    </div>
  );
}

// --------------------------------------------------
// REVENUE TOOLTIP
// --------------------------------------------------

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-slate-500">{formatDay(label)}</p>

      <p className="mt-1 font-semibold text-slate-900">
        PKR {Number(payload[0].value || 0).toLocaleString("en-PK")}
      </p>
    </div>
  );
}

// --------------------------------------------------
// REVENUE CHART
// --------------------------------------------------

function RevenueOverview({ refreshKey }) {
  const [days, setDays] = useState(7);

  const url = `${API_BASE}${REVENUE_ENDPOINT}?days=${days}`;

  const {
    data,
    loading,
    error,
  } = useDashboardFetch(url, normalizeRevenue, refreshKey);

  const totalRevenue = useMemo(
    () =>
      (data || []).reduce(
        (sum, item) => sum + item.revenue,
        0
      ),
    [data]
  );

  return (
    <Card
      title="Revenue Overview"
      action={
        <select
          aria-label="Revenue date range"
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-orange-200"
        >
          {RANGES.map((range) => (
            <option key={range.days} value={range.days}>
              {range.label}
            </option>
          ))}
        </select>
      }
    >
      {loading ? (
        <Skeleton className="h-52 w-full" />
      ) : error ? (
        <ErrorState message={error} />
      ) : !data?.length ? (
        <div className="flex h-52 items-center justify-center text-sm text-slate-400">
          No revenue data available for this period.
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">
            Revenue in selected period:{" "}
            <span className="font-semibold text-slate-900">
              PKR {totalRevenue.toLocaleString("en-PK")}
            </span>
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="mudarooRevenueFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#F97316"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="100%"
                      stopColor="#F97316"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="#EEF0F3"
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatDay}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  dy={6}
                />

                <YAxis
                  tickFormatter={formatPKR}
                  tickLine={false}
                  axisLine={false}
                  width={62}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                />

                <Tooltip content={<RevenueTooltip />} />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#F97316"
                  strokeWidth={2}
                  fill="url(#mudarooRevenueFill)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#F97316",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  );
}

// --------------------------------------------------
// ORDER STATUS CHART
// --------------------------------------------------

function OrderStatus({ refreshKey }) {
  const {
    data,
    loading,
    error,
  } = useDashboardFetch(
    `${API_BASE}${STATUS_ENDPOINT}`,
    normalizeStatus,
    refreshKey
  );

  const total = useMemo(
    () => (data || []).reduce(
      (sum, status) => sum + status.value,
      0
    ),
    [data]
  );

  return (
    <Card title="Order Status">
      {loading ? (
        <Skeleton className="h-52 w-full" />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    total
                      ? data.filter((status) => status.value > 0)
                      : [{ key: "empty", label: "No orders", value: 1, color: "#F3F4F6" }]
                  }
                  dataKey="value"
                  nameKey="label"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={total ? 2 : 0}
                  cornerRadius={4}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {(total
                    ? data.filter((status) => status.value > 0)
                    : [{ key: "empty", color: "#F3F4F6" }]
                  ).map((status) => (
                    <Cell
                      key={status.key}
                      fill={status.color}
                    />
                  ))}
                </Pie>

                {total > 0 && (
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold leading-none text-slate-900">
                {total.toLocaleString("en-PK")}
              </span>

              <span className="mt-1 text-[11px] text-slate-500">
                Total Orders
              </span>
            </div>
          </div>

          <ul className="w-full space-y-2.5 sm:w-auto sm:min-w-[150px]">
            {data.map((status) => (
              <li
                key={status.key}
                className="flex items-center justify-between gap-6 text-sm"
              >
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  {status.label}
                </span>

                <span className="font-semibold text-slate-900">
                  {status.value.toLocaleString("en-PK")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// --------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------

export default function DashboardCards() {
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshDashboard() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <OverviewCards
          refreshKey={refreshKey}
          onRefresh={refreshDashboard}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
          <RevenueOverview refreshKey={refreshKey} />
          <OrderStatus refreshKey={refreshKey} />
        </div>

        <p className="text-xs text-slate-400">
          Dashboard statistics are retrieved from your store database.
        </p>
      </div>
    </main>
  );
}
