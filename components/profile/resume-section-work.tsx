"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Plus, Save, Trash2, X } from "lucide-react"
import { type ParsedResume, formatDate } from "@/lib/resume-parser"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ResumeSectionWorkProps {
  work: ParsedResume["work"]
  onUpdate: (work: ParsedResume["work"]) => void
}

export function ResumeSectionWork({ work, onUpdate }: ResumeSectionWorkProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(work)

  const handleChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleHighlightChange = (workIndex: number, highlightIndex: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev]
      const highlights = [...updated[workIndex].highlights]
      highlights[highlightIndex] = value
      updated[workIndex] = { ...updated[workIndex], highlights }
      return updated
    })
  }

  const addHighlight = (workIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev]
      updated[workIndex] = {
        ...updated[workIndex],
        highlights: [...updated[workIndex].highlights, ""],
      }
      return updated
    })
  }

  const removeHighlight = (workIndex: number, highlightIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev]
      const highlights = [...updated[workIndex].highlights]
      highlights.splice(highlightIndex, 1)
      updated[workIndex] = { ...updated[workIndex], highlights }
      return updated
    })
  }

  const addWorkExperience = () => {
    setFormData((prev) => [
      ...prev,
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        summary: "",
        highlights: [],
      },
    ])
  }

  const removeWorkExperience = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev]
      updated.splice(index, 1)
      return updated
    })
  }

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Work Experience</CardTitle>
          <CardDescription>Your professional work history</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">{isEditing ? "Cancel editing" : "Edit work experience"}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-6">
            {formData.map((job, jobIndex) => (
              <div key={jobIndex} className="space-y-4 p-4 border border-border rounded-md relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeWorkExperience(jobIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove job</span>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`company-${jobIndex}`}>Company</Label>
                    <Input
                      id={`company-${jobIndex}`}
                      value={job.company}
                      onChange={(e) => handleChange(jobIndex, "company", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`position-${jobIndex}`}>Position</Label>
                    <Input
                      id={`position-${jobIndex}`}
                      value={job.position}
                      onChange={(e) => handleChange(jobIndex, "position", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${jobIndex}`}>Start Date</Label>
                    <Input
                      id={`startDate-${jobIndex}`}
                      type="date"
                      value={job.startDate !== "Present" ? job.startDate : ""}
                      onChange={(e) => handleChange(jobIndex, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${jobIndex}`}>End Date</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`endDate-${jobIndex}`}
                        type="date"
                        value={job.endDate !== "Present" ? job.endDate : ""}
                        onChange={(e) => handleChange(jobIndex, "endDate", e.target.value)}
                        disabled={job.endDate === "Present"}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${jobIndex}`}
                          checked={job.endDate === "Present"}
                          onChange={(e) => handleChange(jobIndex, "endDate", e.target.checked ? "Present" : "")}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`current-${jobIndex}`} className="text-sm">
                          Current
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`summary-${jobIndex}`}>Summary</Label>
                  <Textarea
                    id={`summary-${jobIndex}`}
                    value={job.summary}
                    onChange={(e) => handleChange(jobIndex, "summary", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Key Achievements/Responsibilities</Label>
                    <Button variant="outline" size="sm" onClick={() => addHighlight(jobIndex)}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {job.highlights.map((highlight, highlightIndex) => (
                      <div key={highlightIndex} className="flex items-center gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => handleHighlightChange(jobIndex, highlightIndex, e.target.value)}
                          placeholder="Describe an achievement or responsibility"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeHighlight(jobIndex, highlightIndex)}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove highlight</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addWorkExperience} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Work Experience
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {work.length === 0 ? (
              <p className="text-sm text-muted-foreground">No work experience added yet.</p>
            ) : (
              work.map((job, index) => (
                <div key={index} className="space-y-2">
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{job.position}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <Badge variant="outline" className="self-start md:self-center">
                      {formatDate(job.startDate)} - {formatDate(job.endDate)}
                    </Badge>
                  </div>
                  {job.summary && <p className="text-sm">{job.summary}</p>}
                  {job.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                      {job.highlights.map((highlight, hIndex) => (
                        <li key={hIndex}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
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
