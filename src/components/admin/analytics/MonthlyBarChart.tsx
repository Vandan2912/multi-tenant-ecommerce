"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type DataPoint = { month: string; revenue: number; orders: number };

export function MonthlyBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
          }
          width={52}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === "revenue"
              ? `₹${value.toLocaleString("en-IN")}`
              : value,
            name === "revenue" ? "Revenue" : "Orders",
          ]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #f0f0f0",
          }}
        />
        <Bar
          dataKey="revenue"
          fill="#2563EB"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
