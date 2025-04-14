// components/resume-analysis/resume-jobs.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { saveResume } from "@/actions/resume-jobs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.js";

interface ExtractedData {
  title: string;
  skills: string[];
  // add any additional fields as needed
}

interface ExtractedJobsData {
  parsedJobs: ExtractedData[];
  parsedSkills: string[];
}

interface ResumeUploadProps {
  onSuccess?: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Read file as ArrayBuffer
  const readFile = async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        resolve(new Uint8Array(event.target?.result as ArrayBuffer));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Convert PDF pages to images
  const convertToImages = async (pdf: pdfjsLib.PDFDocumentProxy): Promise<string[]> => {
    const images: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({
        canvasContext: canvas.getContext("2d")!,
        viewport: viewport,
      }).promise;
      images.push(canvas.toDataURL("image/png"));
    }
    return images;
  };

  // Use Tesseract to extract text from images
  const extractTextFromImages = async (images: string[]): Promise<string> => {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    let fullText = "";
    for (const image of images) {
      const { data } = await worker.recognize(image);
      fullText += data.text + "\n\n";
    }
    await worker.terminate();
    return fullText;
  };

  // Upload file to S3 by calling /api/upload-resume
  const uploadFile = async (file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop() || "pdf";
    const fileName = `resumes/${Date.now()}-${Math.random().toString(36).substring(2,15)}.${fileExtension}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    const response = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Upload failed");
    }
    const data = await response.json();
    return data.fileUrl;
  };

  // Call API to extract resume data
  const extractResumeData = async (text: string): Promise<ExtractedJobsData> => {
    const response = await fetch("/api/extract-resume-jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ extractedText: text }),
    });
    
    if (!response.ok) throw new Error("Extraction failed");
    return await response.json() as ExtractedJobsData;
  };

  // Save resume information in the backend
  const saveResumeInfo = async (data: ExtractedJobsData, resumeUrl: string) => {
    // Check if job data exists
    if (!data.parsedJobs || data.parsedJobs.length === 0) {
      throw new Error("No job data extracted from the resume. Please try again with a clearer resume.");
    }
  
    // Call the server action with the required values.
    const response = await saveResume({
      resumeUrl,
      jobs: data.parsedJobs,
      skills: data.parsedSkills,
    });
    
    if (!response.success) {
      throw new Error(response.error || "Failed to save resume info");
    }
  };

  // Main file handling function
  const handleFile = async (file: File) => {
    setIsProcessing(true);
    try {
      // 1. Read file and convert PDF to images
      const fileData = await readFile(file);
      const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
      const images = await convertToImages(pdf);

      // 2. Convert images to text using Tesseract OCR
      const extractedText = await extractTextFromImages(images);

      // 3. Upload file to S3 and get resume URL
      const resumeUrl = await uploadFile(file);
      setPdfUrl(resumeUrl);

      // 4. Extract structured resume data via API
      const jobsData = await extractResumeData(extractedText);

      // 5. Save extracted resume info and resume URL in your database
      await saveResumeInfo(jobsData, resumeUrl);

      toast.success(`Resume processed successfully! Extracted ${jobsData.parsedJobs.length} job profiles.`);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error processing resume:", error);
      toast.error(error.message || "Error processing resume");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-[80%] mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-center text-3xl">
          Upload & Analyze Your Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file && (
          <div className="grid max-w-sm items-center gap-1.5">
            <Label htmlFor="resume">Resume File</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>
        )}
        {file && (
          <p className="text-sm text-muted-foreground">
            Selected file: <span className="font-medium">{file.name}</span>
          </p>
        )}
        <Button
          onClick={() => file && handleFile(file)}
          disabled={!file || isProcessing}
          className="mt-4"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Upload, Analyze & Save
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;