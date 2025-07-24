"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import Link from "next/link";

interface PopularInterviewCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  category: string;
  completedCount?: number;
}

const difficultyColors = {
  Beginner: "bg-green-50 text-green-700 border-green-200",
  Intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Advanced: "bg-red-50 text-red-700 border-red-200"
};

const categoryColors = {
  "Data Structures": "bg-blue-50 text-blue-700 border-blue-200",
  "Web Development": "bg-purple-50 text-purple-700 border-purple-200",
  "Operating Systems": "bg-orange-50 text-orange-700 border-orange-200",
  "System Design": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "DevOps": "bg-teal-50 text-teal-700 border-teal-200",
  "Databases": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Security": "bg-rose-50 text-rose-700 border-rose-200",
  "Algorithms": "bg-violet-50 text-violet-700 border-violet-200",
  "Software Engineering": "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export function PopularInterviewCard({
  id,
  title,
  description,
  difficulty,
  duration,
  category,
  completedCount = 0
}: PopularInterviewCardProps) {
  return (
    <Link href={`/interview/popular/${id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg shrink-0">
              {title.charAt(0)}
            </div>
            <div className="flex flex-col gap-1">
              <Badge 
                variant="outline" 
                className={`text-xs ${difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.Beginner}`}
              >
                {difficulty}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${categoryColors[category as keyof typeof categoryColors] || categoryColors["Software Engineering"]}`}
              >
                {category}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}m</span>
            </div>
            {completedCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{completedCount} completed</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}