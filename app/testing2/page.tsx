"use client";

import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

// Set PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.js";

const SimplePdfExtractor = () => {
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Read file as ArrayBuffer
  const readFile = async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(new Uint8Array(event.target.result as ArrayBuffer));
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Convert PDF pages to images
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

  // Extract text from images using Tesseract
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

  // Process the uploaded file
  const handleFile = async (file: File): Promise<void> => {
    if (!file) return;

    setIsExtracting(true);
    setError("");
    setExtractedText("");

    try {
      // Extract text from PDF
      const fileData = await readFile(file);
      const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
      const images = await convertToImage(pdf);
      const text = await convertToText(images);
      
      setExtractedText(text);
      console.log("Extracted text:", text);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError(
        `Error processing PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>PDF Text Extractor</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          style={{ display: "block", margin: "0 auto" }}
        />
        <p style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
          Select a PDF file to extract text
        </p>
      </div>

      {isExtracting && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <p>Extracting text... This may take a moment.</p>
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: "#FFEBEE", 
          color: "#D32F2F", 
          padding: "10px", 
          borderRadius: "4px",
          marginBottom: "20px" 
        }}>
          {error}
        </div>
      )}

      {extractedText && (
        <div>
          <h2>Extracted Text:</h2>
          <pre style={{ 
            backgroundColor: "#f5f5f5", 
            padding: "15px", 
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            maxHeight: "500px",
            overflow: "auto"
          }}>
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SimplePdfExtractor;