import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBehavioralInterviewById } from "@/actions/behavioral-interviews";
import { getInterviewers } from "@/actions/interviewers";
import { BehavioralInterviewSetupForm } from "@/components/interview/behavioral-interview-setup-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Brain, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BehavioralInterviewPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: BehavioralInterviewPageProps): Promise<Metadata> {
  const result = await getBehavioralInterviewById(params.id);

  if (!result.success || !result.data) {
    return {
      title: "Interview Not Found | InterviewAI",
    };
  }

  return {
    title: `${result.data.title} - Behavioral Interview | InterviewAI`,
    description: result.data.description,
  };
}

const categoryConfig = {
  "Common Themes": {
    color:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    textColor: "text-purple-700 dark:text-purple-300",
    iconColor: "text-purple-600 dark:text-purple-400",
    icon: Heart,
  },
  "Company Specific": {
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    textColor: "text-blue-700 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: Target,
  },
};

export default async function BehavioralInterviewPage({
  params,
}: BehavioralInterviewPageProps) {
  const [interviewResult, interviewersResult] = await Promise.all([
    getBehavioralInterviewById(params.id),
    getInterviewers(),
  ]);

  if (!interviewResult.success || !interviewResult.data) {
    notFound();
  }

  const interview = interviewResult.data;
  const interviewers = interviewersResult.success
    ? interviewersResult.data || []
    : [];

  const categoryInfo =
    categoryConfig[interview.category as keyof typeof categoryConfig] ||
    categoryConfig["Common Themes"];

  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="container space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/interview/behavioral">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Behavioral Interviews
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
            <CategoryIcon className={cn("h-10 w-10", categoryInfo.iconColor)} />
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Badge variant="outline" className={categoryInfo.color}>
            {interview.category}
          </Badge>
          {interview.company && (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800"
            >
              {interview.company}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold leading-tight">{interview.title}</h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {interview.description}
        </p>

        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Behavioral Focus</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>AI-Powered</span>
          </div>
        </div>
      </div>

      {/* Interview Setup Form */}
      <BehavioralInterviewSetupForm
        interviewId={interview.id}
        interviewTitle={interview.title}
        interviewers={interviewers}
      />
    </div>
  );
}
