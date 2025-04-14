import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code, CheckCircle, AlertCircle, Trophy } from "lucide-react";

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
                className="bg-background p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
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
            <div className="border rounded-lg bg-white dark:bg-black hover:border-green-500 transition-colors border-gray-200 dark:border-gray-700">
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
                  {analysis?.matchingSkills?.map((skill: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-green-50 dark:bg-green-700 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-700 hover:bg-green-100 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="border rounded-lg bg-white dark:bg-black hover:border-red-500 transition-colors border-gray-200 dark:border-gray-700">
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
                  {analysis?.missingSkills?.map((skill: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-700 hover:bg-red-100 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
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
