import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPopularInterviewById } from "@/actions/popular-interviews";
import { InterviewSetupForm } from "@/components/interview/interview-setup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  Target,
  Play,
  CheckCircle2,
  Zap,
  Brain,
  BarChart3,
  Shield,
  BookOpen,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PopularInterviewPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: PopularInterviewPageProps): Promise<Metadata> {
  const result = await getPopularInterviewById(params.id);

  if (!result.success || !result.data) {
    return {
      title: "Interview Not Found | InterviewAI",
    };
  }

  return {
    title: `${result.data.title} | InterviewAI`,
    description: result.data.description,
  };
}

const difficultyConfig = {
  Beginner: {
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    textColor: "text-emerald-700 dark:text-emerald-300",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
    description: "Perfect for getting started",
  },
  Intermediate: {
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    textColor: "text-amber-700 dark:text-amber-300",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: Gauge,
    description: "Builds on fundamental knowledge",
  },
  Advanced: {
    color:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    bgColor: "bg-red-50 dark:bg-red-950",
    textColor: "text-red-700 dark:text-red-300",
    iconColor: "text-red-600 dark:text-red-400",
    icon: Zap,
    description: "For experienced professionals",
  },
};

const categoryConfig = {
  "Data Structures": {
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    textColor: "text-blue-700 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: BarChart3,
  },
  "Web Development": {
    color:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    textColor: "text-purple-700 dark:text-purple-300",
    iconColor: "text-purple-600 dark:text-purple-400",
    icon: Brain,
  },
  "Operating Systems": {
    color:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    textColor: "text-orange-700 dark:text-orange-300",
    iconColor: "text-orange-600 dark:text-orange-400",
    icon: Shield,
  },
  "System Design": {
    color:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    textColor: "text-indigo-700 dark:text-indigo-300",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    icon: Target,
  },
  DevOps: {
    color:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
    bgColor: "bg-teal-50 dark:bg-teal-950",
    textColor: "text-teal-700 dark:text-teal-300",
    iconColor: "text-teal-600 dark:text-teal-400",
    icon: Zap,
  },
  Databases: {
    color:
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    textColor: "text-cyan-700 dark:text-cyan-300",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    icon: BookOpen,
  },
  Security: {
    color:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
    bgColor: "bg-rose-50 dark:bg-rose-950",
    textColor: "text-rose-700 dark:text-rose-300",
    iconColor: "text-rose-600 dark:text-rose-400",
    icon: Shield,
  },
  Algorithms: {
    color:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    bgColor: "bg-violet-50 dark:bg-violet-950",
    textColor: "text-violet-700 dark:text-violet-300",
    iconColor: "text-violet-600 dark:text-violet-400",
    icon: Brain,
  },
  "Software Engineering": {
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    textColor: "text-emerald-700 dark:text-emerald-300",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: Target,
  },
};

export default async function PopularInterviewPage({
  params,
}: PopularInterviewPageProps) {
  const result = await getPopularInterviewById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const interview = result.data;
  const difficultyInfo =
    difficultyConfig[interview.difficulty as keyof typeof difficultyConfig] ||
    difficultyConfig.Beginner;
  const categoryInfo =
    categoryConfig[interview.category as keyof typeof categoryConfig] ||
    categoryConfig["Software Engineering"];

  const DifficultyIcon = difficultyInfo.icon;
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="container space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/interview/popular">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Topics
          </Button>
        </Link>
      </div>

      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div
            className={cn(
              "flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg",
              categoryInfo.bgColor
            )}
          >
            <CategoryIcon
              className={cn("h-10 w-10", categoryInfo.iconColor)}
            />
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Badge variant="outline" className={categoryInfo.color}>
            {interview.category}
          </Badge>
          <Badge variant="outline" className={difficultyInfo.color}>
            <DifficultyIcon className="h-3 w-3 mr-1" />
            {interview.difficulty}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold leading-tight">
          {interview.title}
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {interview.description}
        </p>

        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{interview.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Targeted Practice</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>AI-Powered</span>
          </div>
        </div>
      </div>

      {/* Interview Setup Form */}
      <Card className=" mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Configure Your Interview
          </CardTitle>
          <CardDescription>
            Set up your personalized practice session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InterviewSetupForm
            interviewId={interview.id}
            defaultDuration={interview.duration}
            interviewTitle={interview.title}
          />
        </CardContent>
      </Card>
    </div>
  );
}
