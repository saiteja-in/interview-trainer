"use client"

import { CardFooter } from "@/components/ui/card"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { Brain, Code, Upload, Users } from "lucide-react"

interface InterviewTypeCardProps {
  title: string
  description: string
  iconName: string
  href: string
  completedCount: number
  averageScore: number
}

export function InterviewTypeCard({
  title,
  description,
  iconName,
  href,
  completedCount,
  averageScore,
}: InterviewTypeCardProps) {
  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader>
        {iconName === "code" && <Code className="h-6 w-6 text-primary mb-2" />}
        {iconName === "brain" && <Brain className="h-6 w-6 text-primary mb-2" />}
        {iconName === "users" && <Users className="h-6 w-6 text-primary mb-2" />}
        {iconName === "upload" && <Upload className="h-6 w-6 text-primary mb-2" />}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Completed: {completedCount} interviews</p>
          <p className="text-sm text-muted-foreground">Average Score: {averageScore}%</p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Card className="w-full">
            <CardContent className="p-2 text-center">Start Practicing</CardContent>
          </Card>
        </Link>
      </CardFooter>
    </Card>
  )
}
