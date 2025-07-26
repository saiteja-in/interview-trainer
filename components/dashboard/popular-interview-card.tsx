"use client";

import { cn } from "@/lib/utils";
import {
  Code2,
  Users,
  Brain,
  Target,
  BookOpen,
  Shield,
  BarChart3,
  Rocket,
  Database,
  Workflow,
  Code,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface PopularInterviewCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
}

const categoryConfig = {
  "Data Structures": {
    icon: Code,
  },
  "Web Development": {
    icon: Code2,
  },
  "Operating Systems": {
    icon: Shield,
  },
  "System Design": {
    icon: Target,
  },
  DevOps: {
    icon: Workflow,
  },
  Databases: {
    icon: Database,
  },
  Security: {
    icon: Shield,
  },
  Algorithms: {
    icon: Brain,
  },
  "Software Engineering": {
    icon: Target,
  },
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

export function PopularInterviewCard({
  id,
  title,
  description,
  category,
}: PopularInterviewCardProps) {
  const config =
    categoryConfig[category as keyof typeof categoryConfig] ||
    categoryConfig["Software Engineering"];
  const IconComponent = config.icon;
  const p = genRandomPattern();

  return (
    <Link href={`/interview/popular/${id}`}>
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
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-6 text-sm md:text-base font-medium group-hover:text-primary transition-colors">
          {title}
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
