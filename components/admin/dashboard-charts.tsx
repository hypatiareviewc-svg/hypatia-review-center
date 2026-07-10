"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import type { DashboardStats } from "@/lib/admin-stats";
import { formatCurrency } from "@/lib/format";

export function StudentTrendChart({ data }: { data: DashboardStats["studentTrend"] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,24,40,0.08)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            axisLine={{ stroke: "rgba(16,24,40,0.1)" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              fontSize: "0.8rem",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.8rem", paddingTop: "0.5rem" }} />
          <Line
            type="monotone"
            dataKey="enrolled"
            name="Enrolled"
            stroke="#14294b"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#14294b" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            name="Pending"
            stroke="#a88237"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#a88237" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinanceTrendChart({ data }: { data: DashboardStats["financeTrend"] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14294b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#14294b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="outstandingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a88237" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#a88237" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,24,40,0.08)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            axisLine={{ stroke: "rgba(16,24,40,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₱${Number(v) / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              fontSize: "0.8rem",
            }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend wrapperStyle={{ fontSize: "0.8rem", paddingTop: "0.5rem" }} />
          <Area
            type="monotone"
            dataKey="collected"
            name="Collected"
            stroke="#14294b"
            strokeWidth={2.5}
            fill="url(#collectedGrad)"
          />
          <Area
            type="monotone"
            dataKey="outstanding"
            name="Remaining Balance"
            stroke="#a88237"
            strokeWidth={2.5}
            fill="url(#outstandingGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
