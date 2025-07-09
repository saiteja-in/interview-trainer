import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code, CheckCircle, AlertCircle, Trophy } from "lucide-react";

const chipBase =
  "px-3 py-1 rounded-md text-sm font-medium border transition-colors";
const chipGreen =
  "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900";
const chipRed =
  "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900";

const SkillsAnalysis = ({ analysis }: any) => {
  return (
    <AccordionItem
      value="skills"
      className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700"
    >
      <AccordionTrigger className="bg-muted p-4 cursor-pointer hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              Skills Analysis
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
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
            <h4 className="font-medium text-lg text-gray-800 dark:text-gray-100 mb-3">
              Analysis Summary
            </h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {analysis.review}
            </p>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analysis.subscores).map(([key, value]: any) => (
              <div
                key={key}
                className="bg-background p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h4 className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">
                  {key.replace(/Score$/, "").split(/(?=[A-Z])/).join(" ")}
                </h4>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {Math.round(value)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 mb-1">/100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Skills Matching */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matching Skills */}
            <div className="border bg-white dark:bg-black border-gray-200 dark:border-gray-700">
              <div className="bg-muted p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">
                    Matching Skills
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {analysis?.matchingSkills?.length > 0 ? (
                    analysis.matchingSkills.map((skill: any, index: number) => (
                      <span
                        key={index}
                        className={`${chipBase} ${chipGreen}`}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic text-sm">No matching skills</span>
                  )}
                </div>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="border bg-white dark:bg-black border-gray-200 dark:border-gray-700">
              <div className="bg-muted p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">
                    Skills to Develop
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {analysis?.missingSkills?.length > 0 ? (
                    analysis.missingSkills.map((skill: any, index: number) => (
                      <span
                        key={index}
                        className={`${chipBase} ${chipRed}`}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic text-sm">No missing skills</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Funny Takeaway */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-gray-600 dark:text-gray-400 italic text-sm flex items-center gap-2">
              💡 {analysis.funnyTakeaway}
            </p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SkillsAnalysis;