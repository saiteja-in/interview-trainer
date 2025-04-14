"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

const data = [
  { subject: "Technical Knowledge", A: 85, fullMark: 100 },
  { subject: "Communication", A: 72, fullMark: 100 },
  { subject: "Problem Solving", A: 68, fullMark: 100 },
  { subject: "System Design", A: 65, fullMark: 100 },
  { subject: "Behavioral Skills", A: 90, fullMark: 100 },
  { subject: "Code Quality", A: 78, fullMark: 100 },
]

export function SkillRadarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid className="stroke-muted" />
        <PolarAngleAxis dataKey="subject" className="text-xs" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
        <Radar name="Skills" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
