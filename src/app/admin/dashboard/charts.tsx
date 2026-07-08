"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#f97316", "#06b6d4", "#fbbf24", "#a78bfa", "#34d399", "#fb7185", "#60a5fa", "#f43f5e"];

export function IncomeExpenseBarChart({
  data,
}: {
  data: { label: string; income: number; expense: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={64} />
        <Tooltip formatter={(v) => Number(v).toLocaleString("en-IN", { style: "currency", currency: "INR" })} />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#f97316" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#6b7280" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground py-16 text-center">No income data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => Number(v).toLocaleString("en-IN", { style: "currency", currency: "INR" })} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
