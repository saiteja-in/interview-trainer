"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Plus, Save, Trash2, X } from "lucide-react"
import type { ParsedResume } from "@/lib/resume-parser"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ResumeSectionSkillsProps {
  skills: ParsedResume["skills"]
  onUpdate: (skills: ParsedResume["skills"]) => void
}

export function ResumeSectionSkills({ skills, onUpdate }: ResumeSectionSkillsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(skills)

  const handleChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleKeywordChange = (skillIndex: number, keywordIndex: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev]
      const keywords = [...updated[skillIndex].keywords]
      keywords[keywordIndex] = value
      updated[skillIndex] = { ...updated[skillIndex], keywords }
      return updated
    })
  }

  const addKeyword = (skillIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev]
      updated[skillIndex] = {
        ...updated[skillIndex],
        keywords: [...updated[skillIndex].keywords, ""],
      }
      return updated
    })
  }

  const removeKeyword = (skillIndex: number, keywordIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev]
      const keywords = [...updated[skillIndex].keywords]
      keywords.splice(keywordIndex, 1)
      updated[skillIndex] = { ...updated[skillIndex], keywords }
      return updated
    })
  }

  const addSkill = () => {
    setFormData((prev) => [
      ...prev,
      {
        name: "",
        level: "Beginner",
        keywords: [],
      },
    ])
  }

  const removeSkill = (index: number) => {
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
          <CardTitle>Skills</CardTitle>
          <CardDescription>Your technical and professional skills</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">{isEditing ? "Cancel editing" : "Edit skills"}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-6">
            {formData.map((skill, skillIndex) => (
              <div key={skillIndex} className="space-y-4 p-4 border border-border rounded-md relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeSkill(skillIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove skill</span>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`skill-${skillIndex}`}>Skill Category</Label>
                    <Input
                      id={`skill-${skillIndex}`}
                      value={skill.name}
                      onChange={(e) => handleChange(skillIndex, "name", e.target.value)}
                      placeholder="e.g., Programming, Design, Marketing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`level-${skillIndex}`}>Proficiency Level</Label>
                    <Select value={skill.level} onValueChange={(value) => handleChange(skillIndex, "level", value)}>
                      <SelectTrigger id={`level-${skillIndex}`}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Keywords/Technologies</Label>
                    <Button variant="outline" size="sm" onClick={() => addKeyword(skillIndex)}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skill.keywords.map((keyword, keywordIndex) => (
                      <div key={keywordIndex} className="flex items-center gap-1 bg-muted rounded-md pl-2 pr-1 py-1">
                        <Input
                          value={keyword}
                          onChange={(e) => handleKeywordChange(skillIndex, keywordIndex, e.target.value)}
                          className="border-0 bg-transparent p-0 h-auto w-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder="Keyword"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => removeKeyword(skillIndex, keywordIndex)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove keyword</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addSkill} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Skill Category
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            ) : (
              skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{skill.name}</h3>
                      <Badge variant="secondary">{skill.level}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skill.keywords.map((keyword, kIndex) => (
                      <Badge key={kIndex} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
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
