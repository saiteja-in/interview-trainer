import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Briefcase,
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

const ExperienceAnalysis = ({ parsedData, analysis }: any) => {
  const [magicPoints, setMagicPoints] = useState<{ [key: number]: string[] }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  const toggleMagicPoints = async (experienceIndex: number) => {
    if (magicPoints[experienceIndex]) {
      setMagicPoints((prev) => {
        const newState = { ...prev };
        delete newState[experienceIndex];
        return newState;
      });
      return;
    }

    const description = parsedData[experienceIndex].description;

    try {
      setLoadingStates((prev) => ({ ...prev, [experienceIndex]: true }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/generateJD`,
        { jobDescription: description }
      );

      setMagicPoints((prev) => ({
        ...prev,
        [experienceIndex]: response.data.textArray || [],
      }));
    } catch (error) {
      toast.error("Failed to generate descriptions");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [experienceIndex]: false }));
    }
  };

  return (
    <AccordionItem value="experience" className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
      <AccordionTrigger className="bg-muted p-4 cursor-pointer hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Experience Analysis</span>
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
                Career Journey Analysis
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Target className="w-4 h-4" />
                <span>{analysis.numberOfBulletPoints} bullet points</span>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.review}</p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analysis.subscores).map(([key, value]: any) => (
              <div
                key={key}
                className="bg-white dark:bg-black p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-200 transition-colors"
              >
                <h4 className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">
                  {key
                    .replace(/Score$/, "")
                    .split(/(?=[A-Z])/)
                    .join(" ")}
                </h4>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {Math.round(value)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 mb-1">/100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Individual Experiences */}
          <div className="space-y-4">
            {analysis.entries.map((role: any, i: number) => (
              <div
                key={i}
                className="border rounded-lg overflow-hidden bg-white dark:bg-black hover:shadow-md transition-all border-gray-200 dark:border-gray-700"
              >
                <div className="bg-muted p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-100">
                        Experience Entry {i + 1}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {role.buzzwordCount} industry terms detected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Relevance</span>
                      <span className="font-medium text-gray-700 dark:text-gray-100">
                        {Math.round(role.relevanceScore)}%
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
                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Generating descriptions...</span>
                      </div>
                    </div>
                  )}

                  {magicPoints[i] && magicPoints[i].length > 0 && (
                    <div className="bg-popover p-4 rounded-lg border border-border  animate-fadeIn">
                      <h4 className="text-sm font-medium text-secondary-foreground  mb-3">
                        ✨ Experience Descriptions
                      </h4>
                      <ul className="list-disc list-inside space-y-2">
                        {magicPoints[i].map((point, idx) => (
                          <li key={idx} className="text-foreground text-sm">
                            {point}
                          </li>
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
                        { label: "Role", check: role.hasRole },
                        { label: "Company", check: role.hasCompanyName },
                        { label: "Duration", check: role.hasDuration },
                        { label: "Responsibilities", check: role.hasResponsibilities },
                        { label: "Achievements", check: role.hasAchievements },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            item.check
                              ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-700"
                              : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
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

                  {/* Missing Elements */}
                  {role.missingElements.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-100 dark:border-yellow-700">
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Missing Elements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {role.missingElements.map((element: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm font-medium"
                          >
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvement Tips */}
                  {role.improvementTips.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-100 dark:border-blue-700">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Improvement Tips
                      </h4>
                      <ul className="space-y-2">
                        {role.improvementTips.map((tip: any, idx: number) => (
                          <li
                            key={idx}
                            className="text-blue-700 dark:text-blue-300 text-sm flex items-start gap-2"
                          >
                            <span>•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Funny Takeaway */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                      ✨ {role.funnyTakeaway}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Funny Highlights */}
          <div className="bg-muted from-gray-50 dark:from-gray-700 to-white dark:to-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
              Notable Highlights
            </h4>
            <ul className="space-y-2">
              {analysis.funnyHighlights.map((highlight: any, idx: number) => (
                <li
                  key={idx}
                  className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2"
                >
                  <span>🎯</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {/* Career Story Roast */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-gray-600 dark:text-gray-400 italic text-sm">
              💼 {analysis.careerStoryRoast}
            </p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ExperienceAnalysis;
