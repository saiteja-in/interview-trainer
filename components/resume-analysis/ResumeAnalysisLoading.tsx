import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ResumeAnalysisLoading = () => {
  return (
    <div className="w-full space-y-6">
      {/* Overall Score & Analysis */}
      <Card className="w-full bg-white dark:bg-black">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            {/* Score Circle Skeleton */}
            <div className="relative h-24 w-24 rounded-full overflow-hidden">
              <Skeleton className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-300 animate-pulse">
                  ...
                </div>
              </div>
            </div>

            {/* Analysis Title & Summary */}
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Analysis Results
              </h2>
              <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600" />
              <Skeleton className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600" />
              <Skeleton className="h-4 w-4/6 bg-gray-200 dark:bg-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Analysis */}
      <Card className="bg-white dark:bg-black">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Skills Analysis
          </h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700" />
          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-600" />
        </CardContent>
      </Card>

      {/* Experience Analysis */}
      <Card className="bg-white dark:bg-black">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Experience Analysis
          </h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700" />
          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-600" />
        </CardContent>
      </Card>

      {/* Projects Analysis */}
      <Card className="bg-white dark:bg-black">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Projects Analysis
          </h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700" />
          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-600" />
        </CardContent>
      </Card>

      {/* Education Analysis */}
      <Card className="bg-white dark:bg-black">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Education Analysis
          </h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700" />
          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-600" />
        </CardContent>
      </Card>

      {/* ATS Analysis */}
      <Card className="bg-white dark:bg-black">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            ATS Analysis
          </h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700" />
          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-600" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeAnalysisLoading;
