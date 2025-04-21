"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileUp, Loader2, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { parseResume, type ParsedResume } from "@/lib/resume-parser"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ResumeUploadProps {
  onResumeUploaded: (resume: ParsedResume) => void
  existingResume?: boolean
}

export function ResumeUpload({ onResumeUploaded, existingResume = false }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const fileType = selectedFile.type
    if (
      fileType !== "application/pdf" &&
      fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      fileType !== "application/msword"
    ) {
      setError("Please upload a PDF or Word document")
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const parsedResume = await parseResume(file)
      onResumeUploaded(parsedResume)
    } catch (err) {
      setError("Failed to parse resume. Please try again.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{existingResume ? "Update Resume" : "Upload Your Resume"}</CardTitle>
        <CardDescription>
          {existingResume
            ? "Upload a new resume to update your profile information"
            : "Upload your resume to automatically fill your profile information"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="mb-2 text-lg font-medium">
            {file ? file.name : "Drag and drop your resume or click to browse"}
          </div>
          <p className="text-sm text-muted-foreground mb-4">Supports PDF and Word documents (.pdf, .docx, .doc)</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById("resume-upload")?.click()}
              disabled={isUploading}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            {file && (
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            )}
          </div>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Your resume will be parsed to extract your professional information. You can edit any details after uploading.
      </CardFooter>
    </Card>
  )
}
