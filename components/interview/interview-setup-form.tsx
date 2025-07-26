"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Clock,
  MessageSquare,
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
  Repeat2,
} from "lucide-react";
import {
  createPopularInterviewSession,
  createPopularInterviewSessionWithQuestions,
} from "@/actions/popular-interviews";
import { getInterviewers } from "@/actions/interviewers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InterviewSetupFormProps {
  interviewId: string;
  interviewTitle: string;
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
    value: "beginner",
    label: "Beginner",
    description: "Fundamental concepts",
    icon: CheckCircle2,
    color: "emerald",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Applied knowledge",
    icon: Target,
    color: "amber",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Expert scenarios",
    icon: Zap,
    color: "red",
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "All levels",
    icon: Brain,
    color: "purple",
  },
];

const questionCounts = [3, 5, 8, 10];
const durations = [5, 10, 15, 20];

export function InterviewSetupForm({
  interviewId,
  interviewTitle,
}: InterviewSetupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [questionCount, setQuestionCount] = useState(5);
  const [duration, setDuration] = useState(15);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>("");
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const result = await getInterviewers();
        if (result.success && result.data) {
          setInterviewers(result.data);
          // Auto-select first interviewer
          if (result.data.length > 0) {
            setSelectedInterviewer(result.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching interviewers:", error);
      } finally {
        setLoadingInterviewers(false);
      }
    };

    fetchInterviewers();
  }, []);

  const handleStartInterview = async () => {
    startTransition(async () => {
      try {
        // First, generate AI questions
        toast.loading("Generating interview questions...");

        // Create difficulty-specific context
        const difficultyContext = {
          beginner:
            "Focus on fundamental concepts, basic definitions, and simple problem-solving scenarios. Questions should be accessible to someone new to the topic.",
          intermediate:
            "Include applied knowledge, practical scenarios, and moderate problem-solving challenges. Assume some experience with the topic.",
          advanced:
            "Present complex scenarios, edge cases, and expert-level challenges. Questions should test deep understanding and advanced problem-solving skills.",
          mixed:
            "Include a balanced mix of beginner, intermediate, and advanced questions to comprehensively assess knowledge across all levels.",
        };

        const questionResponse = await fetch("/api/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: interviewTitle,
            objective: `Conduct a ${difficulty} level interview for ${interviewTitle}`,
            number: questionCount,
            context: `This is a technical interview focusing on ${interviewTitle} at ${difficulty} difficulty level. ${
              difficultyContext[difficulty as keyof typeof difficultyContext]
            } The interview should assess the candidate's technical skills, problem-solving abilities, and relevant experience in this domain.`,
          }),
        });

        let generatedQuestions: string[] = [];

        if (questionResponse.ok) {
          const questionData = await questionResponse.json();
          console.log("Generated questions response:", questionData);

          try {
            const parsedResponse = JSON.parse(questionData.response);
            generatedQuestions =
              parsedResponse.questions?.map((q: any) => q.question) || [];
            console.log("Parsed questions:", generatedQuestions);
          } catch (parseError) {
            console.error("Error parsing questions:", parseError);
          }
        }

        // Fallback questions if AI generation fails
        if (generatedQuestions.length === 0) {
          generatedQuestions = Array.from(
            { length: questionCount },
            (_, i) =>
              `Tell me about your experience with ${interviewTitle} and how you would approach a challenging problem in this area. (Question ${
                i + 1
              })`
          );
        }

        toast.dismiss();
        toast.loading("Creating interview session...");

        // Create session with generated questions
        const result = await createPopularInterviewSessionWithQuestions({
          popularInterviewId: interviewId,
          questionCount,
          duration,
          interviewerId: selectedInterviewer || undefined,
          questions: generatedQuestions,
        });

        if (result.success && result.data) {
          toast.dismiss();
          toast.success("Interview session started!");
          router.push(`/call/${result.data.id}`);
        } else {
          toast.dismiss();
          toast.error(result.error || "Failed to start interview");
        }
      } catch (error) {
        console.error("Error starting interview:", error);
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

          {loadingInterviewers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border w-full rounded-md overflow-hidden bg-background p-3 animate-pulse"
                >
                  <div
                    className="size-full bg-repeat bg-[length:30px_30px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cg stroke-width='3.5' stroke='hsla(215, 16%25, 47%25, 0.3)' fill='none'%3E%3Crect width='400' height='400' x='0' y='0' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='0' cy='0' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='400' y='0' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='400' cy='0' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='800' y='0' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='800' cy='0' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='0' y='400' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='0' cy='400' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='400' y='400' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='400' cy='400' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='800' y='400' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='800' cy='400' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='0' y='800' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='0' cy='800' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='400' y='800' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='400' cy='800' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='800' y='800' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='800' cy='800' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  >
                    <div className="size-full bg-gradient-to-tr from-background/90 via-background/40 to-background/10">
                      <div className="text-left p-4 md:p-6 space-y-4">
                        {/* Header with Avatar and Name */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-full" />
                            <div>
                              <div className="h-5 bg-muted rounded w-24 mb-1" />
                              <div className="h-3 bg-muted rounded w-16" />
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                        </div>

                        {/* Rating bars */}
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map((rating) => (
                            <div
                              key={rating}
                              className="flex items-center gap-2"
                            >
                              <div className="h-3 bg-muted rounded w-16" />
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex-1 h-1.5 bg-muted rounded-full" />
                                <div className="h-3 bg-muted rounded w-4" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1">
                          <div className="h-5 bg-muted rounded w-16" />
                          <div className="h-5 bg-muted rounded w-20" />
                          <div className="h-5 bg-muted rounded w-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviewers.map((interviewer, index) => {
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
                    <div
                      className="size-full bg-repeat bg-[length:30px_30px]"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cg stroke-width='3.5' stroke='hsla(215, 16%25, 47%25, 0.3)' fill='none'%3E%3Crect width='400' height='400' x='0' y='0' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='0' cy='0' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='400' y='0' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='400' cy='0' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='800' y='0' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='800' cy='0' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='0' y='400' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='0' cy='400' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='400' y='400' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='400' cy='400' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='800' y='400' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='800' cy='400' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='0' y='800' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='0' cy='800' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='400' y='800' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='400' cy='800' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3Crect width='400' height='400' x='800' y='800' opacity='0.15'%3E%3C/rect%3E%3Ccircle r='10.85' cx='800' cy='800' fill='hsla(215, 16%25, 47%25, 0.3)' stroke='none'%3E%3C/circle%3E%3C/g%3E%3C/svg%3E")`,
                      }}
                    >
                      <div className="size-full bg-gradient-to-tr from-background/90 via-background/40 to-background/10">
                        <div className="text-left p-4 md:p-6 space-y-4">
                          {/* Header with Avatar and Selection */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                                  {interviewer.name.charAt(0)}
                                </div>
                                {/* {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                    <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                                  </div>
                                )} */}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold mb-1 text-foreground">
                                  {interviewer.name}
                                </h3>
                                <p className="text-xs text-foreground/60">
                                  AI Interviewer
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-wrap text-sm text-foreground/60 line-clamp-2">
                            {interviewer.description}
                          </p>

                          {/* Rating bars */}
                          <div className="space-y-2">
                            {[
                              {
                                label: "Rapport",
                                value: interviewer.rapport || 7,
                                color: "bg-blue-500",
                              },
                              {
                                label: "Exploration",
                                value: interviewer.exploration || 7,
                                color: "bg-green-500",
                              },
                              {
                                label: "Empathy",
                                value: interviewer.empathy || 7,
                                color: "bg-purple-500",
                              },
                              {
                                label: "Speed",
                                value: interviewer.speed || 5,
                                color: "bg-orange-500",
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

                          {/* Specialties */}
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

                          {/* Selection Status */}
                          {/* <div className="pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground/80">
                                {isSelected ? "Selected" : "Select Interviewer"}
                              </span>
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              ) : (
                                <ArrowRight className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                      "p-3 rounded-lg border-2 transition-all text-sm font-medium",
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
                      "p-3 rounded-lg border-2 transition-all text-sm font-medium",
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
            disabled={isPending || !selectedInterviewer || loadingInterviewers}
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

          <p className="text-center text-xs text-muted-foreground">
            You can pause and resume your interview at any time during the
            session
          </p>
        </div>
      </div>
    </div>
  );
}
