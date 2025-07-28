"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Sparkles,
  CheckCircle2,
  Brain,
  Target,
  Zap,
  User,
  ArrowRight,
  Settings,
  Timer,
  FileQuestion,
  TrendingUp,
} from "lucide-react";
import { createBehavioralInterviewSessionWithQuestions } from "@/actions/behavioral-interviews";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BehavioralInterviewSetupFormProps {
  interviewId: string;
  interviewTitle: string;
  interviewers: Interviewer[];
}

interface Interviewer {
  id: string;
  name: string;
  image: string;
  description: string;
  specialties: string[];
  rapport?: number;
  exploration?: number;
  empathy?: number;
  speed?: number;
}

const difficultyOptions = [
  {
    value: "entry",
    label: "Entry Level",
    description: "Basic behavioral questions",
    icon: CheckCircle2,
    color: "emerald",
  },
  {
    value: "mid",
    label: "Mid Level",
    description: "Situational scenarios",
    icon: Target,
    color: "amber",
  },
  {
    value: "senior",
    label: "Senior Level",
    description: "Leadership & complex situations",
    icon: Zap,
    color: "red",
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "All experience levels",
    icon: Brain,
    color: "purple",
  },
];

const questionCounts = [3, 5, 8, 10];
const durations = [10, 15, 20, 30];

export function BehavioralInterviewSetupForm({
  interviewId,
  interviewTitle,
  interviewers,
}: BehavioralInterviewSetupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [questionCount, setQuestionCount] = useState(5);
  const [duration, setDuration] = useState(20);
  const [difficulty, setDifficulty] = useState("mid");

  const [selectedInterviewer, setSelectedInterviewer] = useState<string>(() => {
    // Auto-select first interviewer if available
    return interviewers.length > 0 ? interviewers[0].id : "";
  });

  const handleStartInterview = async () => {
    startTransition(async () => {
      try {
        toast.loading("Generating behavioral interview questions...");

        // Create difficulty and focus area specific context
        const difficultyContext = {
          entry:
            "Focus on basic behavioral questions suitable for entry-level candidates. Questions should explore fundamental work experiences, basic teamwork, and simple problem-solving scenarios.",
          mid: "Include situational behavioral questions for mid-level professionals. Focus on specific examples of leadership, project management, and handling workplace challenges.",
          senior:
            "Present complex behavioral scenarios for senior-level candidates. Questions should explore strategic thinking, team leadership, organizational impact, and handling high-stakes situations.",
          mixed:
            "Include a balanced mix of entry, mid, and senior level behavioral questions to comprehensively assess experience across all levels.",
        };

        const questionResponse = await fetch(
          "/api/generate-behavioral-questions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: interviewTitle,
              objective: `Conduct a ${difficulty} level behavioral interview for ${interviewTitle}`,
              number: questionCount,
              context: `This is a behavioral interview for ${interviewTitle} at ${difficulty} difficulty level. ${
                difficultyContext[difficulty as keyof typeof difficultyContext]
              } Include a comprehensive mix of behavioral questions covering leadership, problem-solving, communication, adaptability, and teamwork. Use the STAR method framework and ask for specific examples from the candidate's experience.`,
            }),
          }
        );

        let generatedQuestions: string[] = [];

        if (questionResponse.ok) {
          const questionData = await questionResponse.json();
          console.log("Generated behavioral questions response:", questionData);

          try {
            const parsedResponse = JSON.parse(questionData.response);
            generatedQuestions =
              parsedResponse.questions?.map((q: any) => q.question) || [];
            console.log("Parsed behavioral questions:", generatedQuestions);
          } catch (parseError) {
            console.error("Error parsing behavioral questions:", parseError);
          }
        }

        // Fallback behavioral questions if AI generation fails
        if (generatedQuestions.length === 0) {
          const fallbackQuestions = [
            "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
            "Describe a situation where you had to meet a tight deadline. What was your approach?",
            "Give me an example of a time when you had to adapt to a significant change at work.",
            "Tell me about a time when you had to make a difficult decision with limited information.",
            "Describe a situation where you had to persuade someone to see things your way.",
            "Tell me about a time when you failed at something. What did you learn from it?",
            "Give me an example of when you had to take initiative on a project.",
            "Describe a time when you had to handle multiple priorities. How did you manage them?",
            "Tell me about a time when you had to give constructive feedback to a colleague.",
            "Describe a situation where you had to work under pressure. How did you handle it?",
          ];

          generatedQuestions = fallbackQuestions.slice(0, questionCount);
        }

        toast.dismiss();
        toast.loading("Creating behavioral interview session...");

        // Create session with generated questions
        const result = await createBehavioralInterviewSessionWithQuestions({
          behavioralInterviewId: interviewId,
          questionCount,
          duration,
          experienceLevel: difficulty.toUpperCase() as
            | "ENTRY"
            | "MID"
            | "SENIOR",
          targetRole: "general",
          interviewerId: selectedInterviewer || undefined,
          questions: generatedQuestions,
        });

        if (result.success && result.data) {
          toast.dismiss();
          toast.success("Behavioral interview session started!");
          router.push(`/call/${result.data.id}`);
        } else {
          toast.dismiss();
          toast.error(result.error || "Failed to start behavioral interview");
        }
      } catch (error) {
        console.error("Error starting behavioral interview:", error);
        toast.dismiss();
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const selectedInterviewerData = interviewers.find(
    (i) => i.id === selectedInterviewer
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 rounded-full text-primary-foreground font-medium shadow-lg">
          <Sparkles className="h-4 w-4" />
          AI-Powered Interview
        </div>
        <h1 className="text-3xl font-bold text-foreground">{interviewTitle}</h1>
      </div>

      {/* Main Setup Content */}
      <div className="space-y-8">
        {/* Interviewer Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Choose Your Interviewer</h3>
              <p className="text-muted-foreground text-sm">
                Each AI interviewer has unique expertise and interview style
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewers.map((interviewer) => {
              const isSelected = selectedInterviewer === interviewer.id;

              return (
                <div
                  key={interviewer.id}
                  className={cn(
                    "border w-full rounded-md overflow-hidden cursor-pointer",
                    "bg-background transition-all duration-300",
                    isSelected
                      ? "border-primary shadow-lg ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:shadow-md",
                    "p-3"
                  )}
                  onClick={() => setSelectedInterviewer(interviewer.id)}
                >
                  <div className="text-left p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                            {interviewer.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold mb-1 text-foreground">
                            {interviewer.name}
                          </h3>
                          <p className="text-xs text-foreground/60">
                            Behavioral Specialist
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-wrap text-sm text-foreground/60 line-clamp-2">
                      {interviewer.description}
                    </p>

                    <div className="space-y-2">
                      {[
                        {
                          label: "Empathy",
                          value: interviewer.empathy || 8,
                          color: "bg-purple-500",
                        },
                        {
                          label: "Exploration",
                          value: interviewer.exploration || 7,
                          color: "bg-pink-500",
                        },
                        {
                          label: "Rapport",
                          value: interviewer.rapport || 8,
                          color: "bg-indigo-500",
                        },
                      ].map((rating) => (
                        <div
                          key={rating.label}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="min-w-[60px] text-foreground/70">
                            {rating.label}
                          </span>
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  rating.color
                                )}
                                style={{ width: `${rating.value * 10}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-4 text-foreground/80">
                              {rating.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {interviewer.specialties
                        .slice(0, 2)
                        .map((specialty) => (
                          <Badge
                            key={specialty}
                            variant="secondary"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      {interviewer.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{interviewer.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Configuration */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Interview Configuration</h3>
              <p className="text-muted-foreground text-sm">
                Customize your practice session
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Questions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-primary" />
                <label className="font-medium text-sm">Questions</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {questionCounts.map((count) => (
                  <button
                    key={count}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-center",
                      questionCount === count
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setQuestionCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <label className="font-medium text-sm">Duration (min)</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {durations.map((time) => (
                  <button
                    key={time}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-center",
                      duration === time
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setDuration(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <label className="font-medium text-sm">Difficulty</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {difficultyOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-left",
                        difficulty === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setDifficulty(option.value)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            difficulty === option.value
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                        <div>
                          <div
                            className={cn(
                              "font-medium text-sm",
                              difficulty === option.value
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {option.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Summary & Start */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Session Overview</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Interviewer</div>
                  <div className="font-medium">
                    {selectedInterviewerData?.name || "Not selected"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Questions</div>
                  <div className="font-medium">{questionCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-medium">{duration} min</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Per Question</div>
                  <div className="font-medium">
                    ~{Math.round(duration / questionCount)} min
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleStartInterview}
            disabled={isPending || !selectedInterviewer}
            className="w-full h-14 text-lg font-medium gap-3 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity shadow-lg"
            size="lg"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Preparing Interview...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Interview
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Remember to use the STAR method: Situation, Task, Action, Result
            </p>
            <p className="text-xs text-muted-foreground">
              You can pause and resume your interview at any time during the
              session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
