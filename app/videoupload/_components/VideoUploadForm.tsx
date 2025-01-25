"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Upload, X, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSignedURL } from "@/actions/videoupload"

export default function VideoUploadForm() {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState(0)

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    return hashHex
  }

  function handleFile(file: File) {
    if (file.type !== "video/mp4" && file.type !== "video/webm") {
      setStatusMessage("Please upload MP4 or WebM video files only")
      return
    }
    console.log("File",file)
    setFile(file)
    console.log("File Name",file.name)
    setFileName(file.name)
    console.log("File Size",file.size)
    setFileSize(file.size)
    const url = URL.createObjectURL(file)
    console.log("Object Url",url)
    setPreview(url)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return

    handleFile(droppedFile)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    handleFile(selectedFile)
  }

  function removeFile() {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setFileName("")
    setFileSize(0)
    setPreview(null)
    setStatusMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setStatusMessage("Uploading video...")
    setLoading(true)

    try {
      console.log("File Type",file.type)
      const signedURLResult = await getSignedURL({
        fileType: file.type,
        checksum: await computeSHA256(file),
      })
      console.log("signed Url",signedURLResult)

      if (signedURLResult.failure !== undefined) {
        throw new Error(signedURLResult.failure)
      }

      const url = signedURLResult.success.url
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      setStatusMessage("Video uploaded successfully!")
    } catch (error) {
      setStatusMessage("Failed to upload video")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusMessage && (
          <Alert>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        <div
          className={cn(
            "relative group cursor-pointer",
            "rounded-lg border-2 border-dashed",
            "transition-colors duration-200",
            isDragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
              : "border-zinc-200 dark:border-zinc-800"
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          aria-label="Upload video"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleChange}
            className="hidden"
          />

          <div className="p-8 space-y-4">
            {!fileName ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Drag and drop or click to upload video
                </p>
                <p className="text-xs text-zinc-500">MP4 or WebM format</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {preview ? (
                  <div className="relative w-48 rounded-lg overflow-hidden aspect-video">
                    <video
                      src={preview}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <p className="text-xs text-zinc-500">
                    {fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : "0 MB"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={removeFile}
            disabled={!file || loading}
          >
            Remove
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || loading}
          >
            {loading ? "Uploading..." : "Upload Video"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}