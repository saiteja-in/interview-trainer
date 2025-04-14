"use client";

import React, { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Loader2, Clock, Hash, FileText, Code, Brain, Users } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import ResumeUpload from "@/components/resume-analysis/resume-jobs";
import { getResumeData } from "@/actions/resume-jobs";
import { ResumeDialog } from "@/components/resume-analysis/resume-dialog";

type ResumeData = {
  resumeJobs: {
    id: string;
    title: string;
    skills: string[];
  }[];
  skills: string[];
  resumeUrl: string | null;
};

export default function ResumeInterviewPage() {
  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [duration, setDuration] = useState("45");
  const [questionCount, setQuestionCount] = useState(6);
  const { toast } = useToast();
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);

  // Function to fetch resume data
  const fetchResumeData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const result = await getResumeData();
      if (result.success && result.data) {
        setResumeData(result.data);
      }
    } catch (err) {
      console.error("Failed to load resume data", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data once when the component mounts
  useEffect(() => {
    fetchResumeData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures it runs only once

  // Callback when resume upload & processing completes successfully.
  const handleResumeUploaded = async () => {
    const result = await getResumeData();
    if (result.success && result.data) {
      setResumeData(result.data);
      toast({
        title: "Resume analyzed successfully",
        description: "We've generated your resume jobs and extracted skills",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    // Return an icon component based on iconName.
    // For this example, we return a default FileUp icon.
    return <FileUp className="h-10 w-10 text-primary" />;
  };

  const handleStartInterview = () => {
    toast({
      title: "Interview configured",
      description: `Starting interview with ${questionCount} questions for ${duration} minutes`,
    });
  };

  if (!user) return redirect("/sign-up");

  return (
    <div className="container space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Resume-Based Interview</h1>
      <p className="text-muted-foreground">Upload your resume to get personalized interview questions</p>
      
      {/* Render ResumeUpload component if resumeUrl is not set */}
      {!loading && !resumeData?.resumeUrl && (
        <ResumeUpload onSuccess={handleResumeUploaded} />
      )}

      {resumeData?.resumeUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
            <CardDescription>
              We've analyzed your resume and extracted key skills and experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Overall Skills</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {resumeData.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Extracted Jobs</h3>
              <ul className="mt-2 space-y-2">
                {resumeData.resumeJobs.map((job) => (
                  <li key={job.id} className="text-sm">
                    <span className="font-medium">{job.title}</span> — {job.skills.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsResumeDialogOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> View Full Resume
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ResumeDialog: when "View Full Resume" is clicked */}
      {resumeData?.resumeUrl && (
        <ResumeDialog
          isOpen={isResumeDialogOpen}
          onClose={() => setIsResumeDialogOpen(false)}
          resumeUrl={resumeData.resumeUrl}
        />
      )}

      {/* Recommended Interviews: Using the extracted resume jobs */}
      {resumeData?.resumeJobs && resumeData.resumeJobs.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recommended Interviews</h2>
          <p className="text-muted-foreground">
            Based on your extracted resume jobs, here are your recommended interviews:
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {resumeData.resumeJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {getIconComponent("default")}
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Interview configuration section */}
      {resumeData?.resumeUrl && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configure Interview</CardTitle>
              <CardDescription>Customize your interview session based on your preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
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
                <label htmlFor="questions" className="flex items-center gap-2 text-sm font-medium">
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
                href={`/interview/session?type=resume&id=${resumeData.resumeJobs[0]?.id}&duration=${duration}&questions=${questionCount}`}
                passHref
              >
                <Button onClick={handleStartInterview}>Start Interview</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
