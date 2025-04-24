"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, FileText } from "lucide-react";
import { ResumeDialog } from "@/components/resume-analysis/resume-dialog";
import InterviewConfig from "./interview-config";

type ResumeJob = {
  id: string;
  title: string;
  skills: string[];
};

type ResumeData = {
  resumeJobs: ResumeJob[];
  skills: string[];
};

type ResumeDataDisplayProps = {
  resumeUrl: string;
  resumeData: ResumeData;
};

export default function ResumeDataDisplay({ resumeUrl, resumeData }: ResumeDataDisplayProps) {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);

  return (
    <>
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
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
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
                  <span className="font-medium">{job.title}</span> —{" "}
                  {job.skills.join(", ")}
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

      {/* ResumeDialog: when "View Full Resume" is clicked */}
      <ResumeDialog
        isOpen={isResumeDialogOpen}
        onClose={() => setIsResumeDialogOpen(false)}
        resumeUrl={resumeUrl}
      />

      {/* Recommended Interviews */}
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
                  <FileUp className="h-10 w-10 text-primary" />
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
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
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

      {/* Interview configuration section */}
      <InterviewConfig jobId={resumeData.resumeJobs[0]?.id} />
    </>
  );
}