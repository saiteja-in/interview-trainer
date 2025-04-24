"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileUp } from "lucide-react"
import type { ParsedResume } from "@/lib/resume-parser"

interface ResumeUploadProps {
  onResumeUploaded: (resume: ParsedResume) => void
  existingResume?: boolean
  title?: string
  description?: string
}

export function ResumeUpload({
  onResumeUploaded,
  existingResume = false,
  title = "Upload Resume",
  description = "Upload your resume to automatically fill your profile",
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    setFileName(file.name)
    setIsUploading(true)

    // Simulate parsing the resume
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock parsed resume data
    const mockParsedResume: ParsedResume = {
      basics: {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        phone: "(555) 123-4567",
        title: "Senior Frontend Developer",
        location: "San Francisco, CA",
        website: "https://alexjohnson.dev",
        summary:
          "Experienced frontend developer with 5+ years of experience building responsive web applications with React, TypeScript, and modern CSS frameworks.",
      },
      work: [
        {
          company: "Tech Innovations Inc.",
          position: "Senior Frontend Developer",
          startDate: "2020-03",
          endDate: "Present",
          summary: "Led the development of innovative frontend solutions for the company's flagship product.",
          highlights: [
            "Led the frontend development of the company's flagship product, increasing user engagement by 35%",
            "Implemented a component library that reduced development time by 40%",
            "Mentored junior developers and conducted code reviews",
          ],
        },
        {
          company: "Digital Solutions LLC",
          position: "Frontend Developer",
          startDate: "2018-01",
          endDate: "2020-02",
          summary: "Contributed to building responsive and high-performance web applications.",
          highlights: [
            "Developed responsive web applications using React and Redux",
            "Collaborated with designers to implement pixel-perfect UIs",
            "Improved application performance by 25% through code optimization",
          ],
        },
      ],
      education: [
        {
          institution: "University of California, Berkeley",
          area: "Computer Science",
          studyType: "Bachelor of Science",
          startDate: "2014-09",
          endDate: "2018-05",
          gpa: "3.8",
        },
      ],
      skills: [
        {
          name: "React",
          level: "Expert",
          keywords: ["Hooks", "Context API", "Redux"],
        },
        {
          name: "TypeScript",
          level: "Expert",
          keywords: ["Type Safety", "Interfaces", "Generics"],
        },
        {
          name: "CSS",
          level: "Advanced",
          keywords: ["Tailwind CSS", "CSS-in-JS", "Responsive Design"],
        },
        {
          name: "JavaScript",
          level: "Expert",
          keywords: ["ES6+", "Async/Await", "Functional Programming"],
        },
      ],
      projects: [
        {
          name: "E-commerce Platform",
          description: "A full-featured e-commerce platform with product listings, cart, and checkout",
          startDate: "2021-01",
          endDate: "2021-12",
          highlights: [
            "Implemented a responsive design that works on all devices",
            "Integrated with payment gateways for secure transactions",
            "Built a custom CMS for product management",
          ],
          url: "https://example-ecommerce.com",
        },
        {
          name: "Task Management App",
          description: "A productivity app for managing tasks and projects",
          startDate: "2020-03",
          endDate: "2020-12",
          highlights: [
            "Implemented drag-and-drop functionality for task organization",
            "Added real-time collaboration features using WebSockets",
            "Created a notification system for task updates",
          ],
          url: "https://example-tasks.com",
        },
      ],
    }

    setIsUploading(false)
    onResumeUploaded(mockParsedResume)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{fileName ? fileName : "Drag & drop your resume here"}</h3>
              <p className="text-sm text-muted-foreground">Supports PDF, DOCX, and TXT files up to 5MB</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("resume-upload")?.click()}
                disabled={isUploading}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
              {fileName && (
                <Button disabled={isUploading}>
                  {isUploading ? "Uploading..." : existingResume ? "Update Resume" : "Upload Resume"}
                </Button>
              )}
            </div>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
