"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveResume } from "@/actions/resume-jobs";

type ResumeData = {
  resumeJobs: {
    id: string;
    title: string;
    skills: string[];
  }[];
  skills: string[];
};

type ClientResumeInterviewPageProps = {
  resumeUrl: string | null;
  extractedText: string | null;
  initialResumeData: ResumeData | null;
  showExtractButton: boolean;
};

export default function ClientResumeInterviewPage({
  resumeUrl,
  extractedText,
  initialResumeData,
  showExtractButton,
}: ClientResumeInterviewPageProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Only show this component when we need to extract jobs from existing text
  if (!showExtractButton || !extractedText) {
    return null;
  }

  // Process the extracted text if we have it but no jobs
  const processExistingExtractedText = async () => {
    setLoading(true);
    try {
      // 1. Call the extract resume jobs API
      const response = await fetch("/api/extract-resume-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ extractedText }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // 2. Save the extracted jobs using the server action
      const saveResult = await saveResume({
        jobs: data.parsedJobs,
        skills: data.parsedSkills,
      });
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save resume info");
      }
      
      toast({
        title: "Success",
        description: "Resume jobs extracted and saved successfully!",
      });
      
      // Reload the page to get updated data
      window.location.reload();
    } catch (error: any) {
      console.error("Error processing extracted text:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to extract job information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-[80%] mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          Resume Uploaded
        </CardTitle>
        <CardDescription className="text-center">
          Your resume has been uploaded, but we need to extract job data from it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Extracting job information from your resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 my-8">
            <Button onClick={processExistingExtractedText} size="lg">
              <FileText className="mr-2 h-4 w-4" /> Extract Job Information
            </Button>
            <p className="text-sm text-muted-foreground">
              Click to analyze your resume and extract job information
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}