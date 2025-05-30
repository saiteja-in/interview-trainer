import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trophy, Tag, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const GeneralATS = ({ parsedData, jobDescription, analysis }) => {
  const [ATSAnalysis, setATSAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const overallAnalysis = {
    educationScore: analysis.education.overallScore,
    educationReview: analysis.education.review,
    experienceScore: analysis.experience.overallScore,
    experienceReview: analysis.experience.review,
    projectsScore: analysis.projects.overallScore,
    projectsReview: analysis.projects.review,
    skillsSCore: analysis.skills.overallScore,
    skillsReview: analysis.skills.review,
  };

  const generateATSAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/generateAts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: parsedData, jobDescription, overallAnalysis }),
      });

      if (!response.ok) throw new Error("Failed to analyze resume");
      const data = await response.json();
      setATSAnalysis(data.atsAnalysis);
    } catch (error) {
      toast.error("Error analyzing resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccordionItem value="ats" className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
      <AccordionTrigger className="bg-muted p-4 cursor-pointer hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">ATS Analysis</span>
          </div>
          {!ATSAnalysis && !loading && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                generateATSAnalysis();
              }}
              className="cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate ATS Analysis"
              )}
            </Button>
          )}
          {ATSAnalysis && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">ATS Score</div>
                <div className="font-bold text-lg text-gray-800 dark:text-gray-100">
                  {ATSAnalysis.atsScore}/100
                </div>
              </div>
              <Trophy
                className={`w-6 h-6 ${
                  ATSAnalysis.atsScore >= 80
                    ? "text-yellow-500"
                    : ATSAnalysis.atsScore >= 60
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-gray-400 dark:text-gray-500"
                }`}
              />
            </div>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-4 bg-white dark:bg-black text-gray-800 dark:text-gray-100">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Analyzing your resume...</span>
          </div>
        )}

        {ATSAnalysis && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(ATSAnalysis.subscores).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-white dark:bg-black p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
                >
                  <h4 className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">
                    {key.replace(/Score$/, "").split(/(?=[A-Z])/).join(" ")}
                  </h4>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {value}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 mb-1">/100</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Keyword Analysis</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Match Rate:</span>
                    <span className="bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      {Math.round(ATSAnalysis.keywordMatch.overallMatchRate)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {ATSAnalysis.keywordMatch.matched.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {ATSAnalysis.keywordMatch.missing.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {ATSAnalysis.keywordMatch.missing.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary-foreground p-4 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {ATSAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-blue-800 dark:text-blue-100 text-sm flex items-start gap-2">
                    <span>•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="italic text-sm text-gray-600 dark:text-gray-400">
                🤖 {ATSAnalysis.humorousVerdict}
              </p>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default GeneralATS;
