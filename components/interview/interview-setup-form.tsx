"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  MessageSquare,
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { createPopularInterviewSession, createPopularInterviewSessionWithQuestions } from "@/actions/popular-interviews";
import { getInterviewers } from "@/actions/interviewers";
import { toast } from "sonner";
import Image from "next/image";

interface InterviewSetupFormProps {
  interviewId: string;
  defaultDuration: number;
  interviewTitle: string;
}

interface Interviewer {
  id: string;
  name: string;
  image: string;
  description: string;
  specialties: string[];
}

const questionOptions = [
  { value: 3, label: "3 Questions", description: "Quick practice" },
  { value: 5, label: "5 Questions", description: "Standard session" },
  { value: 8, label: "8 Questions", description: "Comprehensive" },
  { value: 10, label: "10 Questions", description: "Deep dive" },
];

const durationOptions = [
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

export function InterviewSetupForm({
  interviewId,
  defaultDuration,
  interviewTitle,
}: InterviewSetupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [questionCount, setQuestionCount] = useState(5);
  const [duration, setDuration] = useState(defaultDuration);
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>("");
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);

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

  const slideLeft = () => {
    const slider = document.getElementById("interviewer-slider");
    if (slider) {
      slider.scrollLeft = slider.scrollLeft - 120;
    }
  };

  const slideRight = () => {
    const slider = document.getElementById("interviewer-slider");
    if (slider) {
      slider.scrollLeft = slider.scrollLeft + 120;
    }
  };

  const handleStartInterview = () => {
    startTransition(async () => {
      try {
        // First, generate AI questions
        toast.loading("Generating interview questions...");
        
        const questionResponse = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: interviewTitle,
            objective: `Conduct a comprehensive interview for ${interviewTitle}`,
            number: questionCount,
            context: `This is a technical interview focusing on ${interviewTitle}. The interview should assess the candidate's technical skills, problem-solving abilities, and relevant experience in this domain.`
          }),
        });

        let generatedQuestions: string[] = [];
        
        if (questionResponse.ok) {
          const questionData = await questionResponse.json();
          console.log("Generated questions response:", questionData);
          
          try {
            const parsedResponse = JSON.parse(questionData.response);
            generatedQuestions = parsedResponse.questions?.map((q: any) => q.question) || [];
            console.log("Parsed questions:", generatedQuestions);
          } catch (parseError) {
            console.error("Error parsing questions:", parseError);
          }
        }

        // Fallback questions if AI generation fails
        if (generatedQuestions.length === 0) {
          generatedQuestions = Array.from({ length: questionCount }, (_, i) => 
            `Tell me about your experience with ${interviewTitle} and how you would approach a challenging problem in this area. (Question ${i + 1})`
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
    <div className="space-y-6">
      {/* Interviewer Selection */}
      <div className="space-y-4 px-1">
        <Label className="text-sm font-medium">Select an Interviewer</Label>
        {loadingInterviewers ? (
          <div className="flex gap-4 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="w-20 h-20 bg-muted animate-pulse rounded-full" />
                <div className="w-16 h-3 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative px-2">
            <div
              id="interviewer-slider"
              className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {interviewers.map((interviewer) => (
                <div
                  key={interviewer.id}
                  className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                    selectedInterviewer === interviewer.id
                      ? "scale-105"
                      : "hover:scale-102"
                  }`}
                  onClick={() => setSelectedInterviewer(interviewer.id)}
                >
                  <div className="flex flex-col items-center space-y-3 p-3">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 rounded-full overflow-hidden border-3 transition-all duration-200 ${
                          selectedInterviewer === interviewer.id
                            ? "border-primary shadow-lg ring-2 ring-primary/20"
                            : "border-muted-foreground/20 hover:border-muted-foreground/40"
                        }`}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
                          {interviewer.name.charAt(0)}
                        </div>
                      </div>
                      {selectedInterviewer === interviewer.id && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                          <svg
                            className="w-3.5 h-3.5 text-primary-foreground"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center min-w-0 w-24">
                      <p className="text-sm font-medium truncate text-foreground">
                        {interviewer.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {interviewers.length > 4 && (
              <div className="flex justify-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={slideLeft}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={slideRight}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedInterviewerData && (
          <Card className="bg-gradient-to-r from-muted/40 to-muted/20 border border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg ring-2 ring-background">
                    {selectedInterviewerData.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-base text-foreground">
                      {selectedInterviewerData.name}
                    </h4>
                    <span className="px-2 py-0.5 bg-primary/15 text-primary text-xs font-medium rounded-md">
                      AI Interviewer
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {selectedInterviewerData.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterviewerData.specialties
                      .slice(0, 3)
                      .map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-medium rounded-full border border-primary/20 transition-colors"
                        >
                          {specialty}
                        </span>
                      ))}
                    {selectedInterviewerData.specialties.length > 3 && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full border border-border">
                        +{selectedInterviewerData.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Question Count Selection */}
        <div className="*:not-first:mt-2">
          <Label htmlFor="questions-select" className="text-sm font-medium">
            Questions
          </Label>
          <Select
            value={questionCount.toString()}
            onValueChange={(value) => setQuestionCount(parseInt(value))}
          >
            <SelectTrigger id="questions-select">
              <SelectValue placeholder="Select number of questions" />
            </SelectTrigger>
            <SelectContent>
              {questionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration Selection */}
        <div className="*:not-first:mt-2">
          <Label htmlFor="duration-select" className="text-sm font-medium">
            Duration
          </Label>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
          >
            <SelectTrigger id="duration-select">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Features Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950/20 dark:to-purple-950/20 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">
              AI-Powered Interview
            </h4>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
            Personalized questions generated based on {interviewTitle} and your
            interviewer's expertise.
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              <span>Dynamic difficulty adjustment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              <span>Intelligent follow-up questions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Summary */}
      <Card className="bg-muted/30 border-0">
        <CardContent className="pt-4">
          <h4 className="font-medium text-sm mb-3">Session Overview</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Topic:</div>
            <div className="font-medium text-right">{interviewTitle}</div>

            <div className="text-muted-foreground">Interviewer:</div>
            <div className="font-medium text-right">
              {selectedInterviewerData?.name || "Not selected"}
            </div>

            <div className="text-muted-foreground">Questions:</div>
            <div className="font-medium text-right">{questionCount}</div>

            <div className="text-muted-foreground">Duration:</div>
            <div className="font-medium text-right">{duration} min</div>

            <div className="text-muted-foreground">Per question:</div>
            <div className="font-medium text-right">
              ~{Math.round(duration / questionCount)} min
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button
        onClick={handleStartInterview}
        disabled={isPending || !selectedInterviewer || loadingInterviewers}
        className="w-full h-12 gap-2 text-base"
        size="lg"
      >
        <Play className="h-5 w-5" />
        {isPending ? "Starting Interview..." : "Start Interview"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        You can pause and resume the interview at any time
      </p>
    </div>
  );
}
