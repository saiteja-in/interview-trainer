"use client";

import { BehavioralInterviewCard } from "./behavioral-interview-card";

interface BehavioralInterview {
  id: string;
  title: string;
  description: string;
  category: string;
  company: string | null;
}

interface BehavioralInterviewsGridProps {
  interviews: BehavioralInterview[];
  userStats?: { behavioralInterviewId: string; _count: { id: number } }[];
}

export function BehavioralInterviewsGrid({ interviews, userStats = [] }: BehavioralInterviewsGridProps) {

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {interviews.map((interview) => (
        <BehavioralInterviewCard
          key={interview.id}
          id={interview.id}
          title={interview.title}
          description={interview.description}
          category={interview.category}
          company={interview.company}
        />
      ))}
    </div>
  );
}