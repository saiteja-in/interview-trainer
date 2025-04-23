"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Loader2,
  Upload,
} from "lucide-react";
import Tesseract from "tesseract.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import JobSelection, { JobRequirement } from "./JobSelection"; // Import our refactored component

// Set PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.js";

// Validate that the text appears to be from a resume
const validateResumeText = (text: string): boolean => {
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\d{10}\b/.test(text);
  
  // Count sections found
  const sectionsFound = [
    /experience/i.test(text),
    /education/i.test(text),
    /skills/i.test(text),
    /projects/i.test(text),
  ].filter(Boolean).length;

  return (hasEmail && hasPhone) || sectionsFound >= 2;
};

interface ResumeUploadProps {
  setPdfUrl: (url: string) => void;
  setAnalysis: (analysis: any) => void;
  setParsedData: (data: any) => void;
  setInvalidFile: (invalid: boolean) => void;
  setExtractedText: (text: string) => void;
  selectedJob: JobRequirement | null;
  setSelectedJob: (job: JobRequirement | null) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  setPdfUrl,
  setAnalysis,
  setParsedData,
  setInvalidFile,
  setExtractedText,
  selectedJob,
  setSelectedJob,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      await handleFile(file);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const readFile = async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("loadend", (event) =>
        resolve(
          new Uint8Array((event.target as FileReader).result as ArrayBuffer)
        )
      );
      reader.readAsArrayBuffer(file);
    });
  };

  const getStructured = async (text: string): Promise<void> => {
    if (!text) {
      toast.error("Upload a valid report.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/extract-resume-data`,
        { extractedText: text, jobDescription: selectedJob }
      );
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      setParsedData(response.data.parsedResume);
      setAnalysis(response.data.analysis);
    } catch (error) {
      setLoading(false);
      setInvalidFile(true);
      console.error("Error in getStructured:", error);
      toast.error("Model Overloaded. Please Try again.");
      router.push("/resume-analysis");
    } finally {
      setLoading(false);
    }
  };

  const convertToImage = async (pdf: pdfjsLib.PDFDocumentProxy): Promise<string[]> => {
    const images: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
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

  const convertToText = async (images: string[]): Promise<string> => {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    let fullText = "";

    for (const image of images) {
      const { data: { text } } = await worker.recognize(image);
      fullText += text + "\n\n";
    }

    await worker.terminate();
    return fullText;
  };

  const uploadImage = async (file: File): Promise<void> => {
    try {
      const fileExtension = file.name.split('.').pop() || 'pdf';
      const fileName = `resumes/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }
  
      const data = await response.json();
      setPdfUrl(data.fileUrl);
    } catch (error) {
      console.error("Error uploading resume:", error);
      throw error;
    }
  };

  const handleFile = async (file: File): Promise<void> => {
    if (!file) return;

    setIsLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const fileData = await readFile(file);
      const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
      const images = await convertToImage(pdf);
      const text = await convertToText(images);
      
      if (!validateResumeText(text)) {
        setInvalidFile(true);
        toast.error("That doesn't look like a resume. Please upload a real resume PDF.");
        return;
      }
  
      // Save the extracted text and get user profile
      setExtractedText(text);
      
      // await axios.post(
      //   `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/extract-user-profile`,
      //   { text }
      // );
      
      await uploadImage(file);
      await getStructured(text);
    } catch (error) {
      toast.error("Error processing PDF");
      setError(
        `Error processing PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-[80%] mx-auto border-none shadow-none bg-transparent">
      <CardContent className="space-y-8 mt-8">
        {/* Use our refactored JobSelection component */}
        <JobSelection 
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          inUploadMode={true}
        />

        {selectedJob && (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-primary/60"}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isLoading || loading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <span className="text-lg text-gray-800 dark:text-gray-100">
                  Analyzing your resume...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Upload
                  className={`w-12 h-12 ${isDragging ? "text-primary" : "text-gray-400"} transition-colors duration-200`}
                />
                <div className="text-lg text-gray-800 dark:text-gray-100">
                  Drag and drop your resume PDF here, or
                  <label className="ml-1 text-primary cursor-pointer hover:text-primary/80">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports PDF files only
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;