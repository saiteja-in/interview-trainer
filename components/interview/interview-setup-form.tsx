"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MessageSquare, Play } from "lucide-react";
import { createPopularInterviewSession } from "@/actions/popular-interviews";
import { toast } from "sonner";

interface InterviewSetupFormProps {
  interviewId: string;
  defaultDuration: number;
  interviewTitle: string;
}

const questionOptions = [
  { value: 3, label: "3 Questions", description: "Quick practice" },
  { value: 5, label: "5 Questions", description: "Standard session" },
  { value: 8, label: "8 Questions", description: "Comprehensive" },
  { value: 10, label: "10 Questions", description: "Deep dive" }
];

const durationOptions = [
  { value: 15, label: "15 minutes", description: "Quick review" },
  { value: 20, label: "20 minutes", description: "Standard" },
  { value: 30, label: "30 minutes", description: "Thorough" },
  { value: 45, label: "45 minutes", description: "In-depth" },
  { value: 60, label: "60 minutes", description: "Complete session" }
];

export function InterviewSetupForm({ 
  interviewId, 
  defaultDuration, 
  interviewTitle 
}: InterviewSetupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [questionCount, setQuestionCount] = useState(5);
  const [duration, setDuration] = useState(defaultDuration);

  const handleStartInterview = () => {
    startTransition(async () => {
      try {
        const result = await createPopularInterviewSession({
          popularInterviewId: interviewId,
          questionCount,
          duration
        });

        if (result.success) {
          toast.success("Interview session started!");
          // Redirect to the interview session page (to be implemented)
          router.push(`/interview/session/${result.data.id}`);
        } else {
          toast.error(result.error || "Failed to start interview");
        }
      } catch (error) {
        console.error("Error starting interview:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const selectedQuestionOption = questionOptions.find(opt => opt.value === questionCount);
  const selectedDurationOption = durationOptions.find(opt => opt.value === duration);

  return (
    <div className="space-y-6">
      {/* Question Count Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Number of Questions</Label>
        <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {questionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Interview Duration</Label>
        <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {durationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Session Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Session Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Topic:</span>
                <span className="font-medium">{interviewTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions:</span>
                <span className="font-medium">{questionCount} questions</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Time per question:</span>
                <span className="font-medium">~{Math.round(duration / questionCount)} min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button 
        onClick={handleStartInterview}
        disabled={isPending}
        className="w-full gap-2"
        size="lg"
      >
        <Play className="h-4 w-4" />
        {isPending ? "Starting Interview..." : "Start Interview"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        You can pause and resume the interview at any time
      </p>
    </div>
  );
}