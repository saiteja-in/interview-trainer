"use client";

import { PopularInterviewCard } from "./popular-interview-card";

interface PopularInterview {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  category: string;
}

interface PopularInterviewsGridProps {
  interviews: PopularInterview[];
  userStats?: { popularInterviewId: string; _count: { id: number } }[];
}

export function PopularInterviewsGrid({ interviews, userStats = [] }: PopularInterviewsGridProps) {
  const getCompletedCount = (interviewId: string) => {
    const stat = userStats.find(s => s.popularInterviewId === interviewId);
    return stat?._count.id || 0;
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {interviews.map((interview) => (
        <PopularInterviewCard
          key={interview.id}
          id={interview.id}
          title={interview.title}
          description={interview.description}
          difficulty={interview.difficulty}
          duration={interview.duration}
          category={interview.category}
          completedCount={getCompletedCount(interview.id)}
        />
      ))}
    </div>
  );
}