"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import ResumeAnalysisLoading from "@/components/resume-analysis/ResumeAnalysisLoading";
import ResumeUpload from "@/components/resume-analysis/ResumeUpload";
import EducationAnalysis from "@/components/resume-analysis/EducationAnalysis";
import ProjectAnalysis from "@/components/resume-analysis/ProjectAnalysis";
import ExperienceAnalysis from "@/components/resume-analysis/ExperienceAnalysis";
import SkillAnalysis from "@/components/resume-analysis/SkillAnalysis";
import GeneralATS from "@/components/resume-analysis/GeneralATS";
import { redirect, useRouter } from "next/navigation";
import { currentUser } from "@/lib/auth";
import NavBar from "../_components/navbar";
import { useCurrentUser } from "@/hooks/use-current-user";

const PDFExtractor = () => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [sup,wassup]=useState(false)
  const router = useRouter();
  console.log("analysis",analysis)
  console.log("parsedData",parsedData)
  // console.log("selectedJob",selectedJob)
  // console.log("pdfUrl",pdfUrl)
const user= useCurrentUser()


  if (!user) {
    return redirect("/sign-up");
  }

  const handleUploadAgain = () => {
    setPdfUrl("");
    setAnalysis(null);
    setParsedData(null);
    wassup(false);
    router.push("/resume-analysis");
  };

  const handleGoHome = () => {
    wassup(false);
    router.push("/");
  };

  return (
    <>
      {/* <NavBar /> */}

      <div>
        {/* comment out !analysis to test the loading state */}
        {!pdfUrl &&  (
          <ResumeUpload
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            setParsedData={setParsedData}
            setPdfUrl={setPdfUrl}
            setAnalysis={setAnalysis}
            wassup={wassup}
          />
        )}
        { sup && (
          <Card className="max-w-md mx-auto mt-8 text-center">
            <CardHeader>
              <CardTitle>Invalid File</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Please upload a valid PDF file to continue.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleGoHome}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={handleUploadAgain}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Upload Resume
                </button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* comment out analysis to test the loading state */}
        {pdfUrl && !sup &&  (
          <div className="grid grid-cols-5 gap-4 w-full">
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

            {!analysis && !sup && pdfUrl && (
              <div className="w-[93%] mx-auto m-4 col-span-3">
                <ResumeAnalysisLoading />
              </div>
            )}

            {analysis && (
              <Card className="w-[93%] mx-auto m-4 col-span-3">
                <CardHeader className="flex flex-row items-start justify-between gap-6 py-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl font-bold">
                        Analysis Results
                      </CardTitle>
                      <div className="relative group">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center cursor-help">
                          <span className="text-xs font-bold text-gray-600">
                            i
                          </span>
                        </div>
                        <div className="absolute left-0  bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-[999999]">
                          Resume analysis results may not be 100% reliable. This
                          is an experimental project and should be used as a
                          general guideline only.
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <p>{analysis.sections.ats.overallReview}</p>
                    </div>
                  </div>

                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 rounded-full border-8 border-red-400 flex items-center justify-center bg-white">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">
                          {analysis.overall.score}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Overall Score
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    <SkillAnalysis analysis={analysis.sections.skills} />
                    <ExperienceAnalysis
                      parsedData={parsedData.experience}
                      analysis={analysis.sections.experience}
                    />
                    <ProjectAnalysis
                      parsedData={parsedData.projects}
                      analysis={analysis.sections.projects}
                    />
                    <EducationAnalysis analysis={analysis.sections.education} />
                    <GeneralATS
                      jobDescription={selectedJob}
                      parsedData={parsedData}
                      analysis={analysis.sections}
                    />
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PDFExtractor;
