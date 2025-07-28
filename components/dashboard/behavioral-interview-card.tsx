"use client";

import {
  Users,
  Crown,
  MessageSquare,
  Clock,
  Lightbulb,
  Shuffle,
  Phone,
  Building2,
  Heart,
  Zap,
  Target,
  Globe,
  Briefcase,
  Star,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface BehavioralInterviewCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  company: string | null;
}

const themeConfig = {
  "Teamwork": { icon: Users },
  "Leadership": { icon: Crown },
  "Conflict Resolution": { icon: MessageSquare },
  "Time Management": { icon: Clock },
  "Problem Solving": { icon: Lightbulb },
  "Adaptability": { icon: Shuffle },
  "Communication": { icon: Phone },
};

const companyConfig = {
  "Google": { icon: Globe },
  "Microsoft": { icon: Building2 },
  "Amazon": { icon: Briefcase },
  "Meta": { icon: Heart },
  "Apple": { icon: Star },
  "Netflix": { icon: Zap },
  "TCS": { icon: Target },
  "Infosys": { icon: Building2 },
  "Wipro": { icon: Briefcase },
  "Accenture": { icon: Target },
};

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<'svg'> & {
  width: number;
  height: number;
  x: string;
  y: string;
  squares?: number[][];
}) {
  const patternId = React.useId();
  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect
              strokeWidth="0"
              key={index}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

function genRandomPattern(length?: number): number[][] {
  length = length ?? 5;
  return Array.from({ length }, () => [
    Math.floor(Math.random() * 4) + 7, // random x between 7 and 10
    Math.floor(Math.random() * 6) + 1, // random y between 1 and 6
  ]);
}

export function BehavioralInterviewCard({
  id,
  title,
  description,
  category,
  company,
}: BehavioralInterviewCardProps) {
  // Determine config based on category and company
  let config;
  let displayTitle = title;
  let badgeText = category;

  if (category === "Common Themes") {
    config = themeConfig[title as keyof typeof themeConfig] || { icon: Users };
  } else {
    // Company specific
    config = companyConfig[company as keyof typeof companyConfig] || { icon: Building2 };
    badgeText = company || "Company";
  }

  const IconComponent = config.icon;
  const p = genRandomPattern();

  return (
    <Link href={`/interview/behavioral/${id}`}>
      <div className="relative overflow-hidden p-6 border border-dashed hover:bg-muted/50 transition-colors cursor-pointer group">
        {/* Background Pattern */}
        <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
          <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
            <GridPattern
              width={20}
              height={20}
              x="-12"
              y="4"
              squares={p}
              className="fill-foreground/5 stroke-foreground/25 absolute inset-0 h-full w-full mix-blend-overlay"
            />
          </div>
        </div>

        {/* Icon */}
        <IconComponent 
          className="text-foreground/75 size-6 group-hover:text-primary transition-colors" 
          strokeWidth={1} 
          aria-hidden 
        />

        {/* Category Badge */}
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-muted rounded-md text-muted-foreground">
            {badgeText}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-6 text-sm md:text-base font-medium group-hover:text-primary transition-colors">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground relative z-20 mt-2 text-xs font-light line-clamp-3">
          {description}
        </p>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
}