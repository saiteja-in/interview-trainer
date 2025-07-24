import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PopularInterviewsGrid } from "@/components/dashboard/popular-interviews-grid";
import {
  getPopularInterviews,
  getUserPopularInterviewStats,
} from "@/actions/popular-interviews";

export const metadata: Metadata = {
  title: "Popular Interview Topics | InterviewAI",
  description: "Practice with curated interview questions on trending topics",
};

export default async function PopularInterviewsPage() {
  // Fetch popular interviews and user stats
  const [popularInterviewsResult, userStatsResult] = await Promise.all([
    getPopularInterviews(),
    getUserPopularInterviewStats(),
  ]);

  const popularInterviews = popularInterviewsResult.success
    ? popularInterviewsResult.data || []
    : [];
  const userStats = userStatsResult.success ? userStatsResult.data || [] : [];
  console.log("popular interviews", popularInterviews);

  // Group interviews by category
  const groupedInterviews = popularInterviews.reduce((acc, interview) => {
    if (!acc[interview.category]) {
      acc[interview.category] = [];
    }
    acc[interview.category].push(interview);
    return acc;
  }, {} as Record<string, Array<(typeof popularInterviews)[0]>>);

  return (
    <div className="container space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Popular Interview Topics
        </h1>
        <p className="text-muted-foreground">
          Practice with {popularInterviews.length} curated interview questions
          on trending topics
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedInterviews).map(([category, interviews]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{category}</h2>
              <span className="text-sm text-muted-foreground">
                ({interviews.length} topics)
              </span>
            </div>
            <PopularInterviewsGrid
              interviews={interviews}
              userStats={userStats}
            />
          </div>
        ))}

        {popularInterviews.length === 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>No Interview Topics Available</CardTitle>
              <CardDescription>
                Popular interview topics will appear here once they are added to
                the system.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
