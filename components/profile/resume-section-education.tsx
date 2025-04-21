"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Plus, Save, Trash2 } from "lucide-react"
import { type ParsedResume, formatDate } from "@/lib/resume-parser"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ResumeSectionEducationProps {
  education: ParsedResume["education"]
  onUpdate: (education: ParsedResume["education"]) => void
}

export function ResumeSectionEducation({ education, onUpdate }: ResumeSectionEducationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(education)

  const handleChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addEducation = () => {
    setFormData((prev) => [
      ...prev,
      {
        institution: "",
        area: "",
        studyType: "",
        startDate: "",
        endDate: "",
        gpa: "",
      },
    ])
  }

  const removeEducation = (index: number) => {
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
          <CardTitle>Education</CardTitle>
          <CardDescription>Your academic background</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">{isEditing ? "Cancel editing" : "Edit education"}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-6">
            {formData.map((edu, eduIndex) => (
              <div key={eduIndex} className="space-y-4 p-4 border border-border rounded-md relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeEducation(eduIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove education</span>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`institution-${eduIndex}`}>Institution</Label>
                    <Input
                      id={`institution-${eduIndex}`}
                      value={edu.institution}
                      onChange={(e) => handleChange(eduIndex, "institution", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`studyType-${eduIndex}`}>Degree</Label>
                    <Input
                      id={`studyType-${eduIndex}`}
                      value={edu.studyType}
                      onChange={(e) => handleChange(eduIndex, "studyType", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`area-${eduIndex}`}>Field of Study</Label>
                    <Input
                      id={`area-${eduIndex}`}
                      value={edu.area}
                      onChange={(e) => handleChange(eduIndex, "area", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gpa-${eduIndex}`}>GPA</Label>
                    <Input
                      id={`gpa-${eduIndex}`}
                      value={edu.gpa}
                      onChange={(e) => handleChange(eduIndex, "gpa", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${eduIndex}`}>Start Date</Label>
                    <Input
                      id={`startDate-${eduIndex}`}
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => handleChange(eduIndex, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${eduIndex}`}>End Date</Label>
                    <Input
                      id={`endDate-${eduIndex}`}
                      type="date"
                      value={edu.endDate}
                      onChange={(e) => handleChange(eduIndex, "endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addEducation} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Education
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {education.length === 0 ? (
              <p className="text-sm text-muted-foreground">No education added yet.</p>
            ) : (
              education.map((edu, index) => (
                <div key={index} className="space-y-2">
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-medium">
                        {edu.studyType} in {edu.area}
                      </h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                    <Badge variant="outline" className="self-start md:self-center">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </Badge>
                  </div>
                  {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
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
