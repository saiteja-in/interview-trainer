"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import ResumeAnalysisLoading from "@/components/resume-analysis/ResumeAnalysisLoading";
import ResumeUpload from "@/components/resume-analysis/ResumeUpload";
import EducationAnalysis from "@/components/resume-analysis/EducationAnalysis";
import ProjectAnalysis from "@/components/resume-analysis/ProjectAnalysis";
import ExperienceAnalysis from "@/components/resume-analysis/ExperienceAnalysis";
import SkillAnalysis from "@/components/resume-analysis/SkillAnalysis";
import GeneralATS from "@/components/resume-analysis/GeneralATS";
import { useRouter } from "next/navigation";
import { saveResumeTextUrl } from "@/actions/extracted-text-and-url";
import JobSelection, { JobRequirement } from "@/components/resume-analysis/JobSelection";

interface ResumeAnalysisClientProps {
  initialResumeUrl: string | null;
  initialExtractedText: string | null;
}

interface Analysis {
  sections: {
    ats: {
      overallReview: string;
    };
    skills: any;
    experience: any;
    projects: any;
    education: any;
  };
  overall: {
    score: number;
  };
}

interface ParsedData {
  experience: any;
  projects: any;
}

const ResumeAnalysisClient: React.FC<ResumeAnalysisClientProps> = ({
  initialResumeUrl,
  initialExtractedText,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>(initialResumeUrl || "");
  const [extractedText, setExtractedText] = useState<string>(
    initialExtractedText || ""
  );

  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobRequirement | null>(null);
  const [invalidFile, setInvalidFile] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const router = useRouter();

  // When PDF URL and extracted text are set, save to the database
  useEffect(() => {
    const saveToDb = async () => {
      if (pdfUrl && extractedText) {
        try {
          await saveResumeTextUrl({
            resumeUrl: pdfUrl,
            extractedText: extractedText,
          });
        } catch (error) {
          console.error("Failed to save resume data:", error);
        }
      }
    };

    saveToDb();
  }, [pdfUrl, extractedText]);

  // When a job is selected and we have the resume text, analyze the resume
  useEffect(() => {
    const analyzeResume = async () => {
      if (selectedJob && extractedText && !analysis) {
        try {
          setAnalysisLoading(true);
          const response = await fetch("/api/extract-resume-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              extractedText,
              jobDescription: selectedJob,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to analyze resume");
          }

          const data = await response.json();
          setParsedData(data.parsedResume);
          setAnalysis(data.analysis);
        } catch (error) {
          console.error("Error analyzing resume:", error);
        } finally {
          setAnalysisLoading(false);
        }
      }
    };

    analyzeResume();
  }, [selectedJob, extractedText, analysis]);

  const handleUploadAgain = () => {
    setPdfUrl("");
    setExtractedText("");
    setAnalysis(null);
    setParsedData(null);
    setSelectedJob(null);
    setInvalidFile(false);
    router.push("/resume-analysis");
  };

  const handleGoHome = () => {
    setInvalidFile(false);
    router.push("/");
  };

  return (
    <div className="bg-background text-gray-800 dark:text-gray-100 min-h-screen py-4 px-2">
      {/* If no PDF URL, show upload component */}
      {!pdfUrl && !invalidFile && (
        <ResumeUpload
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          setParsedData={setParsedData}
          setPdfUrl={setPdfUrl}
          setAnalysis={setAnalysis}
          setInvalidFile={setInvalidFile}
          setExtractedText={setExtractedText}
        />
      )}

      {invalidFile && (
        <Card className="max-w-md mx-auto mt-8 text-center bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-100">
              Invalid File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please upload a valid PDF file to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleGoHome}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Home
              </button>
              <button
                onClick={handleUploadAgain}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Upload Resume
              </button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* If we have a PDF URL, show the resume and job selection/analysis UI */}
      {pdfUrl && !invalidFile && (
        <div className="grid grid-cols-5 gap-4 w-full">
          {/* Left side: Resume PDF */}
          <div className="col-span-2 sticky top-4 h-[calc(100vh-2rem)]">
            <div className="w-full h-full py-4 ml-4">
              <embed
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                type="application/pdf"
                className="w-full h-full rounded-lg"
                style={{ minHeight: "calc(100vh - 4rem)" }}
              />
            </div>
          </div>

          {/* Right side: Job Selection or Analysis Results */}
          <div className="col-span-3">
            {/* If no job selected yet, show job selection */}
            {!selectedJob ? (
              <JobSelection selectedJob={selectedJob} setSelectedJob={setSelectedJob} />
            ) : (
              <>
                {/* If job selected but analysis not yet complete, show loading */}
                {(analysisLoading || !analysis) && (
                  <div className="w-[93%] mx-auto m-4">
                    <ResumeAnalysisLoading />
                  </div>
                )}

                {/* If analysis complete, show results */}
                {analysis && (
                  <Card className="w-[93%] mx-auto m-4 col-span-3 bg-background border border-secondary">
                    <CardHeader className="flex flex-row items-start justify-between gap-6 py-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            Analysis Results
                          </CardTitle>
                          <div className="relative group">
                            <div className="w-5 h-5 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center cursor-help">
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                i
                              </span>
                            </div>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-white dark:bg-black text-gray-800 dark:text-gray-100 text-xs rounded shadow-lg z-[999999]">
                              Resume analysis results may not be 100% reliable.
                              This is an experimental project and should be used
                              as a general guideline only.
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-3">
                          <p className="text-gray-600 dark:text-gray-400">
                            {analysis.sections.ats.overallReview}
                          </p>
                        </div>
                      </div>

                      <div className="relative flex-shrink-0">
                        <div className="w-32 h-32 rounded-full border-8 border-red-400 flex items-center justify-center bg-background">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">
                              {analysis.overall.score}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Overall Score
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => {
                            setSelectedJob(null);
                            setAnalysis(null);
                          }}
                          className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                        >
                          Select Different Job
                        </button>
                      </div>

                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-4"
                      >
                        <SkillAnalysis analysis={analysis.sections.skills} />
                        {parsedData && (
                          <ExperienceAnalysis
                            parsedData={parsedData.experience}
                            analysis={analysis.sections.experience}
                          />
                        )}
                        {parsedData && (
                          <ProjectAnalysis
                            parsedData={parsedData.projects}
                            analysis={analysis.sections.projects}
                          />
                        )}
                        <EducationAnalysis
                          analysis={analysis.sections.education}
                        />
                        <GeneralATS
                          jobDescription={selectedJob}
                          parsedData={parsedData}
                          analysis={analysis.sections}
                        />
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysisClient;
