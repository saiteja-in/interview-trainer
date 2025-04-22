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

interface ResumeSectionProjectsProps {
  projects: ParsedResume["projects"]
  onUpdate: (projects: ParsedResume["projects"]) => void
}

export function ResumeSectionProjects({ projects, onUpdate }: ResumeSectionProjectsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(projects)

  const handleChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleHighlightChange = (projectIndex: number, highlightIndex: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev]
      const highlights = [...updated[projectIndex].highlights]
      highlights[highlightIndex] = value
      updated[projectIndex] = { ...updated[projectIndex], highlights }
      return updated
    })
  }

  const addHighlight = (projectIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev]
      updated[projectIndex] = {
        ...updated[projectIndex],
        highlights: [...updated[projectIndex].highlights, ""],
      }
      return updated
    })
  }

  const removeHighlight = (projectIndex: number, highlightIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev]
      const highlights = [...updated[projectIndex].highlights]
      highlights.splice(highlightIndex, 1)
      updated[projectIndex] = { ...updated[projectIndex], highlights }
      return updated
    })
  }

  const addProject = () => {
    setFormData((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        url: "",
        highlights: [],
      },
    ])
  }

  const removeProject = (index: number) => {
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
          <CardTitle>Projects</CardTitle>
          <CardDescription>Your personal and professional projects</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">{isEditing ? "Cancel editing" : "Edit projects"}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-6">
            {formData.map((project, projectIndex) => (
              <div key={projectIndex} className="space-y-4 p-4 border border-border rounded-md relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeProject(projectIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove project</span>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`project-${projectIndex}`}>Project Name</Label>
                    <Input
                      id={`project-${projectIndex}`}
                      value={project.name}
                      onChange={(e) => handleChange(projectIndex, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`url-${projectIndex}`}>Project URL</Label>
                    <Input
                      id={`url-${projectIndex}`}
                      value={project.url}
                      onChange={(e) => handleChange(projectIndex, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${projectIndex}`}>Start Date</Label>
                    <Input
                      id={`startDate-${projectIndex}`}
                      type="date"
                      value={project.startDate}
                      onChange={(e) => handleChange(projectIndex, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${projectIndex}`}>End Date</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`endDate-${projectIndex}`}
                        type="date"
                        value={project.endDate !== "Present" ? project.endDate : ""}
                        onChange={(e) => handleChange(projectIndex, "endDate", e.target.value)}
                        disabled={project.endDate === "Present"}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${projectIndex}`}
                          checked={project.endDate === "Present"}
                          onChange={(e) => handleChange(projectIndex, "endDate", e.target.checked ? "Present" : "")}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`current-${projectIndex}`} className="text-sm">
                          Current
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${projectIndex}`}>Description</Label>
                  <Textarea
                    id={`description-${projectIndex}`}
                    value={project.description}
                    onChange={(e) => handleChange(projectIndex, "description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Key Features/Technologies</Label>
                    <Button variant="outline" size="sm" onClick={() => addHighlight(projectIndex)}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {project.highlights.map((highlight, highlightIndex) => (
                      <div key={highlightIndex} className="flex items-center gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => handleHighlightChange(projectIndex, highlightIndex, e.target.value)}
                          placeholder="Describe a feature or technology used"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHighlight(projectIndex, highlightIndex)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove highlight</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addProject} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects added yet.</p>
            ) : (
              projects.map((project, index) => (
                <div key={index} className="space-y-2">
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-medium">
                        {project.name}
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-sm text-primary hover:underline"
                          >
                            (Link)
                          </a>
                        )}
                      </h3>
                    </div>
                    <Badge variant="outline" className="self-start md:self-center">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </Badge>
                  </div>
                  {project.description && <p className="text-sm">{project.description}</p>}
                  {project.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                      {project.highlights.map((highlight, hIndex) => (
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
