"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Download, Edit, Eye, FileText, Upload, User } from "lucide-react"
import { ResumeUpload } from "@/components/profile/resume-upload"
import { ResumeSectionBasics } from "@/components/profile/resume-section-basics"
import { ResumeSectionWork } from "@/components/profile/resume-section-work"
import { ResumeSectionEducation } from "@/components/profile/resume-section-education"
import { ResumeSectionSkills } from "@/components/profile/resume-section-skills"
import { ResumeSectionProjects } from "@/components/profile/resume-section-projects"
import { ResumePreview } from "@/components/profile/resume-preview"
import { type ParsedResume, defaultResume } from "@/lib/resume-parser"

export default function ProfilePageClient() {
  const [hasResume, setHasResume] = useState(false)
  const [resumeData, setResumeData] = useState<ParsedResume>(defaultResume)
  const [activeTab, setActiveTab] = useState("upload")

  const handleResumeUploaded = (parsedResume: ParsedResume) => {
    setResumeData(parsedResume)
    setHasResume(true)
    setActiveTab("personal")
  }

  const updateBasics = (basics: ParsedResume["basics"]) => {
    setResumeData((prev) => ({ ...prev, basics }))
  }

  const updateWork = (work: ParsedResume["work"]) => {
    setResumeData((prev) => ({ ...prev, work }))
  }

  const updateEducation = (education: ParsedResume["education"]) => {
    setResumeData((prev) => ({ ...prev, education }))
  }

  const updateSkills = (skills: ParsedResume["skills"]) => {
    setResumeData((prev) => ({ ...prev, skills }))
  }

  const updateProjects = (projects: ParsedResume["projects"]) => {
    setResumeData((prev) => ({ ...prev, projects }))
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account and professional information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-2 space-y-6">
          {/* Profile Card - Fixed Height */}
          <Card className="md:h-[420px]">
            <CardHeader>
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                  <AvatarFallback>
                    {resumeData.basics.name
                      ? resumeData.basics.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "JD"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center space-y-1.5">
                <CardTitle>{resumeData.basics.name || "John Doe"}</CardTitle>
                <CardDescription>{resumeData.basics.title || "Frontend Developer"}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> January 15, 2023
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Practice Time</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> 42.5 hours
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Interviews Completed</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" /> 24 sessions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resume Actions - Only show after resume is uploaded */}
          {hasResume && (
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
                <CardDescription>Manage your professional resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <FileText className="h-4 w-4 mr-2" /> resume_
                      {resumeData.basics.name.toLowerCase().replace(/\s+/g, "_") || "user"}.pdf
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("preview")} className="w-full">
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  </div>
                  <Button variant="default" onClick={() => setActiveTab("upload")} className="w-full">
                    <Upload className="h-4 w-4 mr-2" /> Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-5 space-y-6">
          {!hasResume || activeTab === "upload" ? (
            <ResumeUpload
              onResumeUploaded={handleResumeUploaded}
              existingResume={hasResume}
              title={hasResume ? "Update Resume" : "Upload Your Resume"}
              description={
                hasResume
                  ? "Upload a new version of your resume to update your profile"
                  : "Upload your resume to automatically fill your profile information"
              }
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6 pt-6">
                <ResumeSectionBasics basics={resumeData.basics} onUpdate={updateBasics} />
              </TabsContent>

              <TabsContent value="experience" className="space-y-6 pt-6">
                <ResumeSectionWork work={resumeData.work} onUpdate={updateWork} />
                <ResumeSectionEducation education={resumeData.education} onUpdate={updateEducation} />
              </TabsContent>

              <TabsContent value="projects" className="space-y-6 pt-6">
                <ResumeSectionProjects projects={resumeData.projects} onUpdate={updateProjects} />
              </TabsContent>

              <TabsContent value="skills" className="space-y-6 pt-6">
                <ResumeSectionSkills skills={resumeData.skills} onUpdate={updateSkills} />
              </TabsContent>

              <TabsContent value="preview" className="space-y-6 pt-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Resume Preview</h2>
                  <Button variant="outline" onClick={() => setActiveTab("personal")}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
                <ResumePreview resume={resumeData} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
