"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  Star,
  Wand2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";

const ProjectAnalysis = ({ parsedData, analysis }: any) => {
  const [magicPoints, setMagicPoints] = useState<{ [key: number]: string[] }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  const toggleMagicPoints = async (projectIndex: number) => {
    if (magicPoints[projectIndex]) {
      setMagicPoints((prev) => {
        const newState = { ...prev };
        delete newState[projectIndex];
        return newState;
      });
      return;
    }

    const projectTitle = parsedData[projectIndex].title;
    const projectDescription = parsedData[projectIndex].description;

    try {
      setLoadingStates((prev) => ({ ...prev, [projectIndex]: true }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/generatePD`,
        { projectTitle, projectDescription }
      );

      setMagicPoints((prev) => ({
        ...prev,
        [projectIndex]: response.data.textArray || [],
      }));
    } catch (error) {
      toast.error("Failed to generate magic insights");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [projectIndex]: false }));
    }
  };

  return (
    <AccordionItem value="projects" className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
      <AccordionTrigger className="bg-muted p-4 cursor-pointer hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Projects Analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
              <div className="font-bold text-lg text-gray-800 dark:text-gray-100">
                {Math.round(analysis.overallScore)}/100
              </div>
            </div>
            <Trophy
              className={`w-6 h-6 ${
                analysis.overallScore >= 80
                  ? "text-yellow-500"
                  : analysis.overallScore >= 60
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-4 bg-white dark:bg-black">
        <div className="space-y-6">
          {/* Overall Analysis */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-lg text-gray-800 dark:text-gray-100">
                Projects Overview
              </h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.review}</p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analysis.subscores).map(([key, value]: any) => (
              <div
                key={key}
                className="bg-background p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-200 transition-colors"
              >
                <h4 className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">
                  {key.replace(/Score$/, "").split(/(?=[A-Z])/).join(" ")}
                </h4>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</span>
                  <span className="text-gray-500 dark:text-gray-400 mb-1">/100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Individual Projects */}
          <div className="space-y-4">
            {analysis.entries.map((project: any, i: number) => (
              <div
                key={i}
                className="border rounded-lg overflow-hidden bg-white dark:bg-black hover:shadow-md transition-all border-gray-200 dark:border-gray-700"
              >
                <div className="bg-muted p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-100">
                        {project.projectTitle}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Project Entry {i + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Relevance</span>
                      <span className="font-medium text-gray-700 dark:text-gray-100">
                        {project.relevanceScore}%
                      </span>
                    </div>
                    <Button
                      onClick={() => toggleMagicPoints(i)}
                      variant="default"
                      className="flex items-center gap-2"
                      disabled={loadingStates[i]}
                    >
                      {loadingStates[i] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      {magicPoints[i] ? "Hide Magic" : "Magic Write"}
                    </Button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Magic Points */}
                  {loadingStates[i] && (
                    <div className="bg-popover p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 text-secondary-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Improving project descriptions...</span>
                      </div>
                    </div>
                  )}

                  {magicPoints[i] && magicPoints[i].length > 0 && (
                    <div className="bg-popover p-4 rounded-lg border border-border animate-fadeIn">
                      <h4 className="text-sm font-medium text-secondary-foreground mb-3">
                        ✨ Improved descriptions
                      </h4>
                      <ul className="list-disc list-inside space-y-2">
                        {magicPoints[i].map((point, idx) => (
                          <li key={idx} className="text-foreground text-sm">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Component Checklist */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
                      Key Components
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {[
                        { label: "Project Name", check: project.hasProjectName },
                        { label: "Technologies", check: project.hasTechnologies },
                        { label: "Description", check: project.hasDescription },
                        { label: "Quantifiers", check: project.hasQuantifiers },
                        { label: "Outcomes", check: project.hasOutcomes },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            item.check
                              ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-700"
                              : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {item.check ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Review */}
                  <div className="bg-primary-foreground p-4 rounded-lg border border-border">
                    <p className="text-foreground text-sm">{project.wittyComment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comedic Summary */}
          <div className="bg-muted from-gray-50 dark:from-gray-700 to-white dark:to-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
              Final Thoughts
            </h4>
            <p className="text-gray-600 dark:text-gray-400 italic text-sm">✨ {analysis.comedicSummary}</p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProjectAnalysis;
