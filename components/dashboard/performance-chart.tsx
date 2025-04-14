"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { date: "Apr 1", dsa: 65, system: 0, behavioral: 78 },
  { date: "Apr 5", dsa: 68, system: 0, behavioral: 82 },
  { date: "Apr 10", dsa: 72, system: 65, behavioral: 0 },
  { date: "Apr 15", dsa: 75, system: 68, behavioral: 0 },
  { date: "Apr 20", dsa: 0, system: 72, behavioral: 85 },
  { date: "Apr 25", dsa: 78, system: 75, behavioral: 0 },
  { date: "Apr 30", dsa: 82, system: 78, behavioral: 88 },
]

export function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          itemStyle={{
            padding: "0.25rem 0",
            fontSize: "0.875rem",
          }}
          labelStyle={{
            fontWeight: "bold",
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="dsa"
          name="DSA"
          stroke="hsl(var(--primary))"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="system"
          name="System Design"
          stroke="hsl(var(--destructive))"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="behavioral"
          name="Behavioral"
          stroke="hsl(var(--success))"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
