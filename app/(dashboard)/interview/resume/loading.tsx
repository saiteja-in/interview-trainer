import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container space-y-8 py-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" /> {/* Simulate page title */}
        <Skeleton className="h-4 w-1/3" /> {/* Simulate subtitle/description */}
      </div>

      {/* Resume Upload / Resume Card Skeleton */}
      <div className="space-y-4">
        {/* This skeleton represents where the ResumeUpload or analyzed resume would be shown */}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>

      {/* Recommended Interviews Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2" /> {/* Section header */}
        <Skeleton className="h-4 w-full" /> {/* Description */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 border rounded-lg p-4">
              <Skeleton className="h-6 w-2/3" /> {/* Job title */}
              <Skeleton className="h-4 w-full" /> {/* Skills list line */}
              <Skeleton className="h-4 w-full" /> {/* Additional detail */}
            </div>
          ))}
        </div>
      </div>

      {/* Interview Configuration Skeleton */}
      <div className="border rounded-lg p-4 space-y-4">
        <Skeleton className="h-6 w-1/3" /> {/* Section title */}
        <Skeleton className="h-4 w-full" /> {/* Section description */}
        <div className="space-y-2">
          {/* Mimics the interview duration select */}
          <Skeleton className="h-10 w-40 rounded" />
          {/* Mimics the slider */}
          <Skeleton className="h-6 w-full rounded" />
        </div>
        {/* Mimics the Start Interview button */}
        <Skeleton className="h-10 w-32 rounded" />
      </div>
    </div>
  );
}
