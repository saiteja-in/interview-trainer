"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Save } from "lucide-react"
import type { ParsedResume } from "@/lib/resume-parser"

interface ResumeSectionBasicsProps {
  basics: ParsedResume["basics"]
  onUpdate: (basics: ParsedResume["basics"]) => void
}

export function ResumeSectionBasics({ basics, onUpdate }: ResumeSectionBasicsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(basics)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic contact and personal details</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">{isEditing ? "Cancel editing" : "Edit personal information"}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" value={formData.website} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Full Name</p>
                <p className="text-sm text-muted-foreground">{basics.name || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Job Title</p>
                <p className="text-sm text-muted-foreground">{basics.title || "Not specified"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{basics.email || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{basics.phone || "Not specified"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{basics.location || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Website</p>
                <p className="text-sm text-muted-foreground">
                  {basics.website ? (
                    <a
                      href={basics.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {basics.website}
                    </a>
                  ) : (
                    "Not specified"
                  )}
                </p>
              </div>
            </div>
            {basics.summary && (
              <div>
                <p className="text-sm font-medium">Professional Summary</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{basics.summary}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
