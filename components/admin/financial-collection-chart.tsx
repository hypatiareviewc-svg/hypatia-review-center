"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export function FinancialCollectionChart({
  data,
}: {
  data: { label: string; collected: number }[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
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
          <Bar dataKey="collected" name="Collected" fill="#14294b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
