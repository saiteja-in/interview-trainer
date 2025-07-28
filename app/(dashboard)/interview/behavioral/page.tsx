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
import { BehavioralInterviewsGrid } from "@/components/dashboard/behavioral-interviews-grid";
import {
  getBehavioralInterviews,
  getUserBehavioralInterviewStats,
} from "@/actions/behavioral-interviews";

export const metadata: Metadata = {
  title: "Behavioral Interview Practice | InterviewAI",
  description:
    "Practice behavioral interview questions with common themes and company-specific questions",
};

export default async function BehavioralInterviewsPage() {
  // Fetch behavioral interviews and user stats
  const [behavioralInterviewsResult, userStatsResult] = await Promise.all([
    getBehavioralInterviews(),
    getUserBehavioralInterviewStats(),
  ]);

  const behavioralInterviews = behavioralInterviewsResult.success
    ? behavioralInterviewsResult.data || []
    : [];
  const userStats = userStatsResult.success ? userStatsResult.data || [] : [];

  // Group interviews by category
  const groupedInterviews = behavioralInterviews.reduce((acc, interview) => {
    if (!acc[interview.category]) {
      acc[interview.category] = [];
    }
    acc[interview.category].push(interview);
    return acc;
  }, {} as Record<string, Array<(typeof behavioralInterviews)[0]>>);

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
          Behavioral Interview Practice
        </h1>
        <p className="text-muted-foreground">
          Practice with {behavioralInterviews.length} behavioral interview
          questions covering common themes and company-specific scenarios
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
            <BehavioralInterviewsGrid
              interviews={interviews}
              userStats={userStats}
            />
          </div>
        ))}

        {behavioralInterviews.length === 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>No Behavioral Interview Topics Available</CardTitle>
              <CardDescription>
                Behavioral interview topics will appear here once they are added
                to the system.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
