// "use client";

// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Upload, Loader2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import * as pdfjsLib from "pdfjs-dist";
// import Tesseract from "tesseract.js";
// import { saveResumeTextUrl } from "@/actions/extracted-text-and-url";
// import { saveResume } from "@/actions/resume-jobs";

// pdfjsLib.GlobalWorkerOptions.workerSrc =
//   "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.js";

// interface ResumeUploadProps {
//   onSuccess?: () => void;
// }

// const ResumeUpload: React.FC<ResumeUploadProps> = ({ onSuccess }) => {
//   const [file, setFile] = useState<File | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [processingStage, setProcessingStage] = useState<string>("");
//   const [progress, setProgress] = useState(0);
//   const { toast } = useToast();

//   // Read file as ArrayBuffer
//   const readFile = async (file: File): Promise<Uint8Array> => {
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = (event) => {
//         resolve(new Uint8Array(event.target?.result as ArrayBuffer));
//       };
//       reader.readAsArrayBuffer(file);
//     });
//   };

//   // Convert PDF pages to images
//   const convertToImages = async (pdf: pdfjsLib.PDFDocumentProxy): Promise<string[]> => {
//     setProcessingStage("Converting PDF to images");
//     const images: string[] = [];
//     const totalPages = pdf.numPages;
    
//     for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const viewport = page.getViewport({ scale: 1.5 });
//       const canvas = document.createElement("canvas");
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;
//       await page.render({
//         canvasContext: canvas.getContext("2d")!,
//         viewport: viewport,
//       }).promise;
//       images.push(canvas.toDataURL("image/png"));
      
//       // Update progress (PDF conversion is 40% of the process)
//       setProgress(Math.round((pageNum / totalPages) * 40));
//     }
//     return images;
//   };

//   // Use Tesseract to extract text from images
//   const extractTextFromImages = async (images: string[]): Promise<string> => {
//     setProcessingStage("Extracting text from images");
//     const worker = await Tesseract.createWorker();
//     await worker.loadLanguage("eng");
//     await worker.initialize("eng");
//     let fullText = "";
    
//     for (let i = 0; i < images.length; i++) {
//       const { data } = await worker.recognize(images[i]);
//       fullText += data.text + "\n\n";
      
//       // Update progress (OCR is 30% of the process)
//       setProgress(40 + Math.round(((i + 1) / images.length) * 30));
//     }
    
//     await worker.terminate();
//     return fullText;
//   };

//   // Upload file to S3 by calling /api/upload-resume
//   const uploadFile = async (file: File): Promise<string> => {
//     setProcessingStage("Uploading resume to server");
//     setProgress(70);
    
//     const fileExtension = file.name.split('.').pop() || "pdf";
//     const fileName = `resumes/${Date.now()}-${Math.random().toString(36).substring(2,15)}.${fileExtension}`;
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("fileName", fileName);
    
//     const response = await fetch("/api/upload-resume", {
//       method: "POST",
//       body: formData,
//     });
    
//     if (!response.ok) {
//       const errData = await response.json();
//       throw new Error(errData.message || "Upload failed");
//     }
    
//     setProgress(80);
//     const data = await response.json();
//     return data.fileUrl;
//   };

//   // Main file handling function
//   const handleFile = async (file: File) => {
//     setIsProcessing(true);
//     setProgress(0);
    
//     try {
//       // 1. Read file and convert PDF to images
//       setProcessingStage("Reading PDF file");
//       const fileData = await readFile(file);
//       setProgress(10);
      
//       const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
//       setProgress(20);
      
//       const images = await convertToImages(pdf);

//       // 2. Convert images to text using Tesseract OCR
//       const extractedText = await extractTextFromImages(images);

//       // 3. Upload file to S3 and get resume URL
//       const resumeUrl = await uploadFile(file);

//       // 4. Process everything in sequence but in the same flow
//       try {
//         // First save resume text and URL
//         setProcessingStage("Saving resume data");
//         setProgress(85);
//         await saveResumeTextUrl({ resumeUrl, extractedText });
        
//         // Then extract and save job data in one go
//         setProcessingStage("Extracting and saving job information");
//         setProgress(90);
        
//         // Extract the jobs
//         const extractResponse = await fetch("/api/extract-resume-jobs", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ extractedText }),
//         });
        
//         if (!extractResponse.ok) {
//           // If job extraction fails, we still have the resume text and URL saved
//           // We'll redirect to the page where the user can trigger extraction manually
//           toast({
//             title: "Partial Success",
//             description: "Your resume was uploaded, but job extraction needs to be done manually.",
//           });
          
//           setTimeout(() => {
//             if (onSuccess) {
//               onSuccess();
//             }
//           }, 1000);
//           return;
//         }
        
//         const extractedData = await extractResponse.json();
//         setProgress(95);
        
//         // Save the extracted job data
//         const saveResult = await saveResume({
//           jobs: extractedData.parsedJobs,
//           skills: extractedData.parsedSkills,
//         });
        
//         if (!saveResult.success) {
//           throw new Error(saveResult.error || "Failed to save resume data");
//         }
        
//         setProgress(100);
//         setProcessingStage("Complete!");
        
//         toast({
//           title: "Success",
//           description: "Resume uploaded and processed successfully!",
//         });
        
//         // Short delay to show 100% completion before refreshing
//         setTimeout(() => {
//           if (onSuccess) {
//             onSuccess();
//           }
//         }, 1000);
//       } catch (processingError: any) {
//         console.error("Processing error:", processingError);
        
//         // We still have the resume text and URL saved
//         toast({
//           title: "Partial Success",
//           description: "Your resume was uploaded, but we encountered an issue processing job information.",
//         });
        
//         setTimeout(() => {
//           if (onSuccess) {
//             onSuccess();
//           }
//         }, 1000);
//       }
//     } catch (error: any) {
//       console.error("Error processing resume:", error);
      
//       toast({
//         title: "Error",
//         description: error.message || "Error processing resume",
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <Card className="max-w-[80%] mx-auto my-8">
//       <CardHeader>
//         <CardTitle className="text-center text-3xl">
//           Upload & Analyze Your Resume
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {!isProcessing && (
//           <>
//             {!file && (
//               <div className="grid max-w-sm items-center gap-1.5">
//                 <Label htmlFor="resume">Resume File</Label>
//                 <Input
//                   id="resume"
//                   type="file"
//                   accept=".pdf"
//                   onChange={(e) => {
//                     if (e.target.files?.[0]) {
//                       setFile(e.target.files[0]);
//                     }
//                   }}
//                 />
//               </div>
//             )}
//             {file && (
//               <p className="text-sm text-muted-foreground">
//                 Selected file: <span className="font-medium">{file.name}</span>
//               </p>
//             )}
//             <Button
//               onClick={() => file && handleFile(file)}
//               disabled={!file}
//               className="mt-4"
//             >
//               <Upload className="mr-2 h-4 w-4" /> Upload & Process Resume
//             </Button>
//           </>
//         )}
        
//         {isProcessing && (
//           <div className="flex flex-col items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
//             <h3 className="text-lg font-medium mb-2">Processing Your Resume</h3>
//             <p className="text-sm text-muted-foreground mb-4">{processingStage}...</p>
            
//             {/* Progress bar */}
//             <div className="w-full max-w-md bg-secondary h-2 rounded-full overflow-hidden">
//               <div 
//                 className="bg-primary h-full transition-all duration-300 ease-in-out"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//             <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default ResumeUpload;



"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { saveResumeTextUrl } from "@/actions/extracted-text-and-url";
import { saveResume } from "@/actions/resume-jobs";

// Set PDF.js worker outside component to avoid re-initialization
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.js";

interface ResumeUploadProps {
  onSuccess?: () => void;
}

interface ProcessingState {
  isProcessing: boolean;
  stage: string;
  progress: number;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    stage: "",
    progress: 0
  });
  const { toast } = useToast();

  // Update processing state helper
  const updateProcessing = useCallback((stage: string, progress: number) => {
    setProcessing(prev => ({ ...prev, stage, progress }));
  }, []);

  // Read file as ArrayBuffer
  const readFile = useCallback(async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        resolve(new Uint8Array(event.target?.result as ArrayBuffer));
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Convert PDF pages to images
  const convertToImages = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy): Promise<string[]> => {
    updateProcessing("Converting PDF to images", 20);
    const images: string[] = [];
    const totalPages = pdf.numPages;
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
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
      
      // Update progress (PDF conversion is 40% of the process)
      updateProcessing(
        "Converting PDF to images", 
        20 + Math.round((pageNum / totalPages) * 20)
      );
    }
    return images;
  }, [updateProcessing]);

  // Use Tesseract to extract text from images
  const extractTextFromImages = useCallback(async (images: string[]): Promise<string> => {
    updateProcessing("Extracting text from images", 40);
    
    // Initialize once and reuse for all images
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    
    let fullText = "";
    
    for (let i = 0; i < images.length; i++) {
      const { data } = await worker.recognize(images[i]);
      fullText += data.text + "\n\n";
      
      // Update progress (OCR is 30% of the process)
      updateProcessing(
        "Extracting text from images", 
        40 + Math.round(((i + 1) / images.length) * 30)
      );
    }
    
    await worker.terminate();
    return fullText;
  }, [updateProcessing]);

  // Upload file to S3 by calling /api/upload-resume
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    updateProcessing("Uploading resume to server", 70);
    
    const fileExtension = file.name.split('.').pop() || "pdf";
    const fileName = `resumes/${Date.now()}-${Math.random().toString(36).substring(2,15)}.${fileExtension}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    
    try {
      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Upload failed");
      }
      
      updateProcessing("Processing resume", 80);
      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }, [updateProcessing]);

  // Process resume data after extraction
  const processResumeData = useCallback(async (resumeUrl: string, extractedText: string) => {
    updateProcessing("Saving resume data", 85);
    
    // 1. Save resume text and URL
    await saveResumeTextUrl({ resumeUrl, extractedText });
    
    // 2. Extract job information
    updateProcessing("Extracting job information", 90);
    
    const extractResponse = await fetch("/api/extract-resume-jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ extractedText }),
      cache: 'no-store',
    });
    
    if (!extractResponse.ok) {
      throw new Error(`Failed to extract resume data: ${extractResponse.status}`);
    }
    
    const extractedData = await extractResponse.json();
    updateProcessing("Saving job information", 95);
    
    // 3. Save extracted job data
    const saveResult = await saveResume({
      jobs: extractedData.parsedJobs,
      skills: extractedData.parsedSkills,
    });
    
    if (!saveResult.success) {
      throw new Error(saveResult.error || "Failed to save resume data");
    }
    
    updateProcessing("Complete!", 100);
    return true;
  }, [updateProcessing]);

  // Main file handling function
  const handleFile = useCallback(async (file: File) => {
    // Reset and start processing
    setProcessing({
      isProcessing: true,
      stage: "Reading PDF file",
      progress: 0
    });
    
    try {
      // 1. Process PDF
      const fileData = await readFile(file);
      updateProcessing("Loading PDF", 10);
      
      const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
      const images = await convertToImages(pdf);
      
      // 2. Extract text
      const extractedText = await extractTextFromImages(images);
      
      // 3. Upload file
      const resumeUrl = await uploadFile(file);
      
      try {
        // 4. Process resume data (save URL/text, extract and save jobs)
        await processResumeData(resumeUrl, extractedText);
        
        toast({
          title: "Success",
          description: "Resume uploaded and processed successfully!",
        });
        
        // Short delay to show 100% completion before refreshing
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1000);
      } catch (processingError: any) {
        console.error("Processing error:", processingError);
        
        // We still have the resume text and URL saved
        toast({
          title: "Partial Success",
          description: "Your resume was uploaded, but we encountered an issue processing job information.",
        });
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error processing resume:", error);
      
      toast({
        title: "Error",
        description: error.message || "Error processing resume",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => ({ ...prev, isProcessing: false }));
    }
  }, [readFile, convertToImages, extractTextFromImages, uploadFile, processResumeData, toast, onSuccess, updateProcessing]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  }, []);

  return (
    <Card className="max-w-[80%] mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-center text-3xl">
          Upload & Analyze Your Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!processing.isProcessing ? (
          <>
            {!file ? (
              <div className="grid max-w-sm items-center gap-1.5">
                <Label htmlFor="resume">Resume File</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
            )}
            <Button
              onClick={() => file && handleFile(file)}
              disabled={!file}
              className="mt-4"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload & Process Resume
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Processing Your Resume</h3>
            <p className="text-sm text-muted-foreground mb-4">{processing.stage}...</p>
            
            {/* Progress bar */}
            <div className="w-full max-w-md bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-in-out"
                style={{ width: `${processing.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{processing.progress}% complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;