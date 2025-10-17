import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Calendar,
  Clock,
  Code,
  LineChart,
  ListChecks,
  Play,
  Target,
  Trophy,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { SkillRadarChart } from "@/components/dashboard/skill-radar-chart";
import { RecentInterviews } from "@/components/dashboard/recent-interviews";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { StreakCard } from "@/components/dashboard/streak-card";
import { UpcomingMilestone } from "@/components/dashboard/upcoming-milestone";
import { InterviewTypeCard } from "@/components/dashboard/interview-type-card";
import { PopularInterviewsGrid } from "@/components/dashboard/popular-interviews-grid";
import {
  getPopularInterviews,
  getUserPopularInterviewStats,
} from "@/actions/popular-interviews";

export const metadata: Metadata = {
  title: "Dashboard | InterviewAI",
  description: "Your interview preparation dashboard",
};

export default async function DashboardPage() {
  // Fetch popular interviews and user stats
  const [popularInterviewsResult, userStatsResult] = await Promise.all([
    getPopularInterviews(),
    getUserPopularInterviewStats(),
  ]);

  const popularInterviews = popularInterviewsResult.success
    ? popularInterviewsResult.data || []
    : [];
  const userStats = userStatsResult.success ? userStatsResult.data || [] : [];
  return (
    <div className="container  space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your progress and continue your interview preparation
          </p>
        </div>
        <Link href="/interview/new" passHref>
          <Button className="w-full sm:w-auto gap-2">
            <Play className="h-4 w-4" /> Start New Interview
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Interviews
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Current Streak
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Average Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Practice Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">12.5 hrs</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <InterviewTypeCard
          title="DSA Interview"
          description="Data Structures & Algorithms"
          iconName="code"
          href="/interview/new?type=dsa"
          completedCount={10}
          averageScore={82}
        />
        <InterviewTypeCard
          title="System Design"
          description="Architecture & Scalability"
          iconName="brain"
          href="/interview/new?type=system"
          completedCount={6}
          averageScore={75}
        />
        <InterviewTypeCard
          title="Behavioral"
          description="Soft Skills & Scenarios"
          iconName="users"
          href="/interview/new?type=behavioral"
          completedCount={5}
          averageScore={88}
        />
        <InterviewTypeCard
          title="Resume-Based"
          description="Tailored to Your Experience"
          iconName="upload"
          href="/interview/resume"
          completedCount={3}
          averageScore={79}
        />
      </div>

      {/* Popular Interviews Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Popular Interview Topics
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Practice with curated interview questions on trending topics
            </p>
          </div>
          <Link href="/interview/popular" passHref>
            <Button variant="outline" size="sm">
              View All Topics
            </Button>
          </Link>
        </div>
        <PopularInterviewsGrid
          interviews={popularInterviews.slice(0, 8)}
          userStats={userStats}
        />
      </div>

      {/* <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">
              Activity
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  Performance Trend
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your interview performance over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 sm:h-80 px-2 sm:px-6">
                <PerformanceChart />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  Skill Breakdown
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your strengths and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 sm:h-80 px-2 sm:px-6">
                <SkillRadarChart />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 px-4 sm:px-6">
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    Recent Interviews
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Your last 5 interview sessions
                  </CardDescription>
                </div>
                <Link href="/history" passHref>
                  <Button variant="ghost" size="sm" className="mt-1 sm:mt-0">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <RecentInterviews />
              </CardContent>
            </Card>
            <div className="col-span-1 lg:col-span-3 grid gap-4">
              <DailyChallenge />
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <StreakCard />
                <UpcomingMilestone />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  Interview Type Performance
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your performance across different interview types
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 sm:h-80 px-2 sm:px-6">
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Interview Type Performance Chart
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  Skill Progress
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs sm:text-sm font-medium">
                        Technical Knowledge
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        85%
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs sm:text-sm font-medium">
                        Communication
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        72%
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs sm:text-sm font-medium">
                        Problem Solving
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        68%
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "68%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs sm:text-sm font-medium">
                        Behavioral Skills
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        90%
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  Top Strengths
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Areas where you excel
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap text-xs"
                    >
                      Strong
                    </Badge>
                    <span className="text-xs sm:text-sm">
                      Explaining complex concepts clearly
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap text-xs"
                    >
                      Strong
                    </Badge>
                    <span className="text-xs sm:text-sm">
                      Problem decomposition
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap text-xs"
                    >
                      Strong
                    </Badge>
                    <span className="text-xs sm:text-sm">
                      Behavioral scenario responses
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  Areas for Improvement
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Skills to focus on
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap text-xs"
                    >
                      Improve
                    </Badge>
                    <span className="text-xs sm:text-sm">
                      Time complexity analysis
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap text-xs"
                    >
                      Improve
                    </Badge>
                    <span className="text-xs sm:text-sm">
                      Distributed systems concepts
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap text-xs"
                    >
                      Improve
                    </Badge>
                    <span className="text-xs sm:text-sm">
                      Concise communication
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  Recommended Practice
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Based on your performance
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm">
                      Practice 3 system design questions focusing on scalability
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm">
                      Work on 5 medium-level DSA problems on trees and graphs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm">
                      Record and review your behavioral responses for
                      conciseness
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your interview preparation activity
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-6 sm:space-y-8">
                <div className="flex">
                  <div className="flex flex-col items-center mr-2 sm:mr-4">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="w-px h-full bg-border"></div>
                  </div>
                  <div className="pb-6 sm:pb-8">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <h4 className="text-xs sm:text-sm font-semibold">
                        Completed Behavioral Interview
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        85%
                      </Badge>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      Today, 10:30 AM
                    </time>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      You completed a behavioral interview focusing on
                      leadership and teamwork scenarios.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex flex-col items-center mr-2 sm:mr-4">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="w-px h-full bg-border"></div>
                  </div>
                  <div className="pb-6 sm:pb-8">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <h4 className="text-xs sm:text-sm font-semibold">
                        Completed Daily Challenge
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        100%
                      </Badge>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      Yesterday, 3:45 PM
                    </time>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      You successfully completed the daily challenge on binary
                      tree traversal.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex flex-col items-center mr-2 sm:mr-4">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary">
                      <LineChart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="w-px h-full bg-border"></div>
                  </div>
                  <div className="pb-6 sm:pb-8">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <h4 className="text-xs sm:text-sm font-semibold">
                        Completed System Design Interview
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        72%
                      </Badge>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      2 days ago, 2:15 PM
                    </time>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      You completed a system design interview on designing a
                      distributed cache system.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex flex-col items-center mr-2 sm:mr-4">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <h4 className="text-xs sm:text-sm font-semibold">
                        Earned Badge: Consistency Champion
                      </h4>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      3 days ago, 9:20 AM
                    </time>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      You earned a new badge for maintaining a 7-day practice
                      streak.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
