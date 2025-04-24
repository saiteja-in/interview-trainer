"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Clock, Hash } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type InterviewConfigProps = {
  jobId: string;
};

export default function InterviewConfig({ jobId }: InterviewConfigProps) {
  const [duration, setDuration] = useState("45");
  const [questionCount, setQuestionCount] = useState(6);
  const { toast } = useToast();

  const handleStartInterview = () => {
    toast({
      title: "Interview configured",
      description: `Starting interview with ${questionCount} questions for ${duration} minutes`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Interview</CardTitle>
          <CardDescription>
            Customize your interview session based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label
              htmlFor="duration"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Clock className="h-4 w-4" /> Interview Duration
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="questions"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Hash className="h-4 w-4" /> Number of Questions: {questionCount}
            </label>
            <Slider
              id="questions"
              value={[questionCount]}
              min={3}
              max={10}
              step={1}
              onValueChange={(value) => setQuestionCount(value[0])}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Link
            href={`/interview/session?type=resume&id=${jobId}&duration=${duration}&questions=${questionCount}`}
            passHref
          >
            <Button onClick={handleStartInterview}>Start Interview</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}