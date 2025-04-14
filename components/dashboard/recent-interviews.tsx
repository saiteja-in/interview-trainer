import { Badge } from "@/components/ui/badge"
import { Brain, Code, Users } from "lucide-react"
import Link from "next/link"

const interviews = [
  {
    id: "int-1",
    type: "dsa",
    title: "DSA Interview",
    date: "May 1, 2023",
    score: 82,
    difficulty: "medium",
  },
  {
    id: "int-2",
    type: "system",
    title: "System Design Interview",
    date: "Apr 28, 2023",
    score: 75,
    difficulty: "hard",
  },
  {
    id: "int-3",
    type: "behavioral",
    title: "Behavioral Interview",
    date: "Apr 25, 2023",
    score: 88,
    difficulty: "medium",
  },
  {
    id: "int-4",
    type: "dsa",
    title: "DSA Interview",
    date: "Apr 20, 2023",
    score: 78,
    difficulty: "easy",
  },
  {
    id: "int-5",
    type: "system",
    title: "System Design Interview",
    date: "Apr 15, 2023",
    score: 72,
    difficulty: "medium",
  },
]

export function RecentInterviews() {
  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <Link
          key={interview.id}
          href={`/history/${interview.id}`}
          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {interview.type === "dsa" && <Code className="h-5 w-5 text-primary" />}
            {interview.type === "system" && <Brain className="h-5 w-5 text-primary" />}
            {interview.type === "behavioral" && <Users className="h-5 w-5 text-primary" />}
            <div>
              <p className="font-medium">{interview.title}</p>
              <p className="text-xs text-muted-foreground">{interview.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {interview.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                interview.score >= 80
                  ? "bg-green-50 text-green-700 border-green-200"
                  : interview.score >= 70
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {interview.score}%
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  )
}
