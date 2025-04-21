"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Download, Edit, FileText, Upload, User } from "lucide-react"
// import { ProfileStats } from "@/components/profile/profile-stats"
// import { ProfileSkills } from "@/components/profile/profile-skills"
// import { ResumeUpload } from "@/components/profile/resume-upload"
// import { ResumeSectionBasics } from "@/components/profile/resume-section-basics"
// import { ResumeSectionWork } from "@/components/profile/resume-section-work"
// import { ResumeSectionEducation } from "@/components/profile/resume-section-education"
// import { ResumeSectionSkills } from "@/components/profile/resume-section-skills"
// import { ResumePreview } from "@/components/profile/resume-preview"
import { type ParsedResume, defaultResume } from "@/lib/resume-parser"
import { ResumeUpload } from "@/components/profile/resume-upload"
import { ResumeSectionBasics } from "@/components/profile/resume-section-basics"
import { ResumeSectionWork } from "@/components/profile/resume-section-work"
import { ResumeSectionEducation } from "@/components/profile/resume-section-education"
import { ResumeSectionSkills } from "@/components/profile/resume-section-skills"
import { ResumePreview } from "@/components/profile/resume-preview"

export default function ProfilePageClient() {
  const [activeTab, setActiveTab] = useState("resume")
  const [hasResume, setHasResume] = useState(false)
  const [resumeData, setResumeData] = useState<ParsedResume>(defaultResume)

  const handleResumeUploaded = (parsedResume: ParsedResume) => {
    setResumeData(parsedResume)
    setHasResume(true)
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

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account and professional information</p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
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
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Resume</p>
              {hasResume ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> resume_
                    {resumeData.basics.name.toLowerCase().replace(/\s+/g, "_")}.pdf
                  </p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveTab("resume")}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("resume")}>
                  <Upload className="h-4 w-4 mr-2" /> Upload Resume
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-5 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="space-y-6 pt-6">
              {!hasResume ? (
                <ResumeUpload onResumeUploaded={handleResumeUploaded} />
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Resume Information</h2>
                    <Button variant="outline" onClick={() => setActiveTab("preview")}>
                      <FileText className="h-4 w-4 mr-2" /> Preview Resume
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <ResumeSectionBasics basics={resumeData.basics} onUpdate={updateBasics} />
                    <ResumeSectionWork work={resumeData.work} onUpdate={updateWork} />
                    <ResumeSectionEducation education={resumeData.education} onUpdate={updateEducation} />
                    <ResumeSectionSkills skills={resumeData.skills} onUpdate={updateSkills} />

                    <Card>
                      <CardHeader>
                        <CardTitle>Update Resume</CardTitle>
                        <CardDescription>Upload a new resume to replace your current information</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResumeUpload onResumeUploaded={handleResumeUploaded} existingResume={true} />
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 pt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Resume Preview</h2>
                <Button variant="outline" onClick={() => setActiveTab("resume")}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Resume
                </Button>
              </div>
              <ResumePreview resume={resumeData} />
            </TabsContent>

            <TabsContent value="info" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={resumeData.basics.name.split(" ")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={resumeData.basics.name.split(" ")[1] || ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={resumeData.basics.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Current Role
                    </label>
                    <input
                      id="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={resumeData.basics.title}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="experience" className="text-sm font-medium">
                      Years of Experience
                    </label>
                    <input
                      id="experience"
                      type="number"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="3"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interview Preferences</CardTitle>
                  <CardDescription>Customize your interview experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="preferredDifficulty" className="text-sm font-medium">
                      Preferred Difficulty
                    </label>
                    <select
                      id="preferredDifficulty"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="medium"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="preferredInterviewType" className="text-sm font-medium">
                      Preferred Interview Type
                    </label>
                    <select
                      id="preferredInterviewType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="dsa"
                    >
                      <option value="dsa">DSA</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="role">Role-Specific</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="pt-4">
              <ResumeSectionSkills skills={resumeData.skills} onUpdate={updateSkills} />
            </TabsContent>

            <TabsContent value="stats" className="pt-4">
              <ResumePreview resume={resumeData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
