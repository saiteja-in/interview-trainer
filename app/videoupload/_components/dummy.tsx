//working good- but large files with chunks take same time as single large upload
"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Upload, X, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSignedURL, completeMultipartUpload } from "@/actions/videoupload"

type UploadedPart = {
  ETag: string;
  PartNumber: number;
}

export default function VideoUploadForm() {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)

  const computeSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  }

  function handleFile(file: File) {
    if (file.type !== "video/mp4" && file.type !== "video/webm") {
      setStatusMessage("Please upload MP4 or WebM video files only")
      return
    }
    setFile(file)
    // console.log("file",file)
    setFileName(file.name)
    // console.log("filename",file.name)
    setFileSize(file.size)
    // console.log("filesize",file.size)
    const url = URL.createObjectURL(file)
    // console.log("url",url)
    setPreview(url)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
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
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setStatusMessage("Preparing upload...")
    setLoading(true)

    try {
      const checksum = await computeSHA256(file)
      // console.log("checksum",checksum)
      
      // Determine upload strategy based on file size (e.g., 10MB threshold)
      const CHUNK_SIZE = 30 * 1024 * 1024 // 10MB
      const isMultipartUpload = file.size > CHUNK_SIZE
      // console.log("is multipart uplaod",isMultipartUpload)

      if (isMultipartUpload) {
        // Multipart upload logic
        const signedURLResult = await getSignedURL({
          fileType: file.type,
          checksum,
          isMultipart: true
        })
        // console.log("signed url result , multipart",signedURLResult)

        if (signedURLResult.failure) {
          throw new Error(signedURLResult.failure)
        }

        const uploadId = signedURLResult.success?.uploadId
        // console.log("upload id ",uploadId)
        const fileName = signedURLResult.success?.fileName
        // console.log("file name in multipart",fileName)

        if (!uploadId || !fileName) {
          throw new Error("Invalid upload parameters")
        }

        // Calculate number of parts
        const totalParts = Math.ceil(file.size / CHUNK_SIZE)
        // console.log("total parts",totalParts)
        const uploadPromises: Promise<void>[] = []
        // console.log("uploadPromises",uploadPromises)
        const uploadedParts: UploadedPart[] = []
        // console.log("uploadParts",uploadedParts)

        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
          const start = (partNumber - 1) * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, file.size)
          const chunk = file.slice(start, end)
          const chunkFile = new File([chunk], file.name, { type: file.type })

          const presignedURLResult = await getSignedURL({
            fileType: file.type,
            checksum: await computeSHA256(chunkFile),
            isMultipart: true,
            uploadId,
            partNumber,
            fileName
          })
          // console.log("presigned url result",presignedURLResult)

          if (presignedURLResult.failure) {
            throw new Error(presignedURLResult.failure)
          }

          const presignedURL = presignedURLResult.success?.url
          if (!presignedURL) {
            throw new Error("Failed to get presigned URL")
          }

          const uploadPromise = fetch(presignedURL, {
            method: "PUT",
            body: chunk,
            headers: {
              "Content-Type": file.type,
            }
          }).then(response => {
            const etag = response.headers.get("ETag")
            if (!etag) throw new Error("ETag missing from response")
            
            uploadedParts.push({
              ETag: etag,
              PartNumber: partNumber
            })
            setUploadProgress(Math.floor((partNumber / totalParts) * 100))
          })

          uploadPromises.push(uploadPromise)
        }

        await Promise.all(uploadPromises)

        // Complete multipart upload
        const completeResult = await completeMultipartUpload({
          fileName,
          uploadId,
          parts: uploadedParts
        })
        // console.log("complete result",completeResult)

        if (completeResult.failure) {
          throw new Error(completeResult.failure)
        }

        setStatusMessage("Video uploaded successfully!")
      } else {
        // Single part upload (existing logic)
        const signedURLResult = await getSignedURL({
          fileType: file.type,
          checksum,
          isMultipart: false
        })

        if (signedURLResult.failure) {
          throw new Error(signedURLResult.failure)
        }

        const signedURL = signedURLResult.success?.url
        if (!signedURL) {
          throw new Error("Failed to get signed URL")
        }

        await fetch(signedURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          }
        })

        setStatusMessage("Video uploaded successfully!")
      }
    } catch (error) {
      console.error(error)
      setStatusMessage("Failed to upload video")
    } finally {
      setLoading(false)
      setUploadProgress(0)
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

        {loading && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{width: `${uploadProgress}%`}}
            ></div>
          </div>
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