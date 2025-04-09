"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { ExtendedUser } from "@/schemas";
import { Card } from "@/components/ui/card";
import { AlertCircle, VideoOff, Video, Upload, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSignedURL, completeMultipartUpload } from "@/actions/videoupload";

const ROLE_QUESTIONS = {
  FRONTEND_DEVELOPER: [
    "Explain the virtual DOM concept",
    "How would you optimize React performance?",
    "Describe your experience with state management",
    "What's your approach to responsive design?",
    "Explain CORS and how to handle it",
  ],
  BACKEND_DEVELOPER: [
    "Explain REST vs GraphQL",
    "How do you handle database migrations?",
    "Describe your experience with API security",
    "What's your approach to caching strategies?",
    "Explain ACID properties in databases",
  ],
  DATA_SCIENTIST: [
    "Explain bias-variance tradeoff",
    "How would you handle missing data?",
    "Describe a challenging ML project",
    "What's your experience with big data tools?",
    "Explain cross-validation techniques",
  ],
} as const;

type JobRole = keyof typeof ROLE_QUESTIONS;

interface ClientComponentProps {
  user: ExtendedUser | undefined;
}

const MAX_CONCURRENT_UPLOADS = 5;

export default function TrainerPageClient({ user }: ClientComponentProps) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const videoConstraints = {
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  const isValidJobRole = (role: string): role is JobRole => {
    return Object.keys(ROLE_QUESTIONS).includes(role);
  };

  useEffect(() => {
    try {
      if (!user?.jobRole) throw new Error("Please set your target role in profile settings");
      if (!isValidJobRole(user.jobRole)) throw new Error("Invalid job role in profile settings");

      setSelectedRole(user.jobRole as JobRole);
      setQuestions([...ROLE_QUESTIONS[user.jobRole as JobRole]]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid configuration");
    } finally {
      setIsInitializing(false);
    }
  }, [user]);

  useEffect(() => {
    if (testStarted) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted]);

  const computeSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const calculateOptimalChunkSize = (fileSize: number): number => {
    if (fileSize < 100 * 1024 * 1024) return 10 * 1024 * 1024;
    if (fileSize < 500 * 1024 * 1024) return 25 * 1024 * 1024;
    return 50 * 1024 * 1024;
  };

  const uploadChunks = async (file: File, CHUNK_SIZE: number, uploadId: string, fileName: string) => {
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    const uploadedParts: { ETag: string; PartNumber: number }[] = [];

    const uploadChunk = async (partNumber: number) => {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const chunkFile = new File([chunk], file.name, { type: file.type });

      const presignedURLResult = await getSignedURL({
        fileType: file.type,
        checksum: await computeSHA256(chunkFile),
        isMultipart: true,
        uploadId,
        partNumber,
        fileName
      });

      const presignedURL = presignedURLResult.success?.url;
      if (!presignedURL) throw new Error("Failed to get presigned URL");

      const response = await fetch(presignedURL, {
        method: "PUT",
        body: chunk,
        headers: { "Content-Type": file.type }
      });

      const etag = response.headers.get("ETag");
      if (!etag) throw new Error("ETag missing from response");

      return { ETag: etag, PartNumber: partNumber };
    };

    const uploadQueue: Promise<{ ETag: string; PartNumber: number }>[] = [];
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const uploadPromise = uploadChunk(partNumber);
      uploadQueue.push(uploadPromise);

      if (uploadQueue.length === MAX_CONCURRENT_UPLOADS || partNumber === totalParts) {
        const batchResults = await Promise.all(uploadQueue);
        uploadedParts.push(...batchResults);
        uploadQueue.length = 0;
        setUploadProgress(Math.floor((uploadedParts.length / totalParts) * 100));
      }
    }

    return uploadedParts;
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    if (webcamRef.current?.stream) {
      const videoTrack = webcamRef.current.stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const startTest = async () => {
    try {
      const stream = webcamRef.current?.stream;
      if (!stream) throw new Error("Camera not initialized");

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      
      mediaRecorderRef.current.start(1000);
      setTestStarted(true);
      setIsRecording(true);
      setElapsedTime(0);
    } catch (err) {
      setError(`Failed to start recording: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const stopTest = async () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        const blob = await new Promise<Blob>((resolve) => {
          mediaRecorderRef.current!.onstop = () => {
            resolve(new Blob(chunksRef.current, { type: "video/webm" }));
          };
        });

        const file = new File([blob], `interview-${Date.now()}.webm`, {
          type: "video/webm"
        });

        setIsUploading(true);
        setUploadStatus("Preparing upload...");

        const checksum = await computeSHA256(file);
        const CHUNK_SIZE = calculateOptimalChunkSize(file.size);
        const isMultipartUpload = file.size > CHUNK_SIZE;

        if (isMultipartUpload) {
          const signedURLResult = await getSignedURL({
            fileType: file.type,
            checksum,
            isMultipart: true
          });

          if (signedURLResult.failure) throw new Error(signedURLResult.failure);

          const uploadId = signedURLResult.success?.uploadId;
          const fileName = signedURLResult.success?.fileName;

          if (!uploadId || !fileName) throw new Error("Invalid upload parameters");

          setUploadStatus("Uploading interview...");
          const uploadedParts = await uploadChunks(file, CHUNK_SIZE, uploadId, fileName);

          setUploadStatus("Finalizing upload...");
          const completeResult = await completeMultipartUpload({
            fileName,
            uploadId,
            parts: uploadedParts
          });

          if (completeResult.failure) throw new Error(completeResult.failure);
          setUploadStatus("Upload completed successfully!");
        } else {
          const signedURLResult = await getSignedURL({
            fileType: file.type,
            checksum,
            isMultipart: false
          });

          if (signedURLResult.failure) throw new Error(signedURLResult.failure);

          const signedURL = signedURLResult.success?.url;
          if (!signedURL) throw new Error("Failed to get signed URL");

          setUploadStatus("Uploading interview...");
          await fetch(signedURL, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type }
          });
          setUploadStatus("Upload completed successfully!");
        }
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Failed to upload recording");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("");
      }, 3000);
      setIsRecording(false);
      setTestStarted(false);
      chunksRef.current = [];
      setUploadProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleQuestionNavigation = (direction: "previous" | "next") => {
    setCurrentQuestionIndex(prev => Math.max(0, Math.min(questions.length - 1, 
      direction === "next" ? prev + 1 : prev - 1
    )));
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4 animate-pulse">
          <div className="mx-auto h-12 w-12 bg-black rounded-full" />
          <p className="text-gray-400 text-lg">Initializing interview session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md p-8 bg-black border-gray-800 shadow-2xl">
          <Alert variant="destructive" className="border-none bg-red-900/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 text-red-400" />
              <div>
                <AlertTitle className="text-lg font-semibold text-gray-100">Session Error</AlertTitle>
                <AlertDescription className="mt-2 text-gray-300">{error}</AlertDescription>
              </div>
            </div>
          </Alert>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full mt-6 py-4 bg-black hover:bg-gray-700 text-gray-100 rounded-xl transition-colors"
          >
            Refresh Session
          </Button>
        </Card>
      </div>
    );
  }

  if (!selectedRole || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-6 max-w-md p-8">
          <div className="mx-auto h-16 w-16 bg-black rounded-full flex items-center justify-center">
            <VideoOff className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-100">No questions available</h2>
          <p className="text-gray-400">We couldn't find questions for your selected role.</p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-xl"
          >
            Return to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      {!testStarted ? (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-10">
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-xl bg-black relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isVideoMuted ? "opacity-0" : "opacity-100"
              }`}
              videoConstraints={videoConstraints}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            <Button
              onClick={toggleVideo}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 backdrop-blur-sm bg-black/50 text-gray-100 hover:bg-black/50"
            >
              {isVideoMuted ? (
                <VideoOff className="h-5 w-5" />
              ) : (
                <Video className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-100">
              {selectedRole.replace(/_/g, " ")} Interview Prep
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Practice your skills with realistic interview questions
            </p>
            <Button
              onClick={startTest}
              className="bg-indigo-600 hover:bg-indigo-700 px-8 py-5 text-lg rounded-xl shadow-lg transition-all hover:scale-105"
            >
              Start Practice Session
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-3rem)]">
          <div className="relative h-full rounded-2xl overflow-hidden shadow-xl bg-black">
            <Webcam
              ref={webcamRef}
              audio={false}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isVideoMuted ? "opacity-0" : "opacity-100"
              }`}
              videoConstraints={videoConstraints}
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleVideo}
                  variant="ghost"
                  size="sm"
                  className="backdrop-blur-sm bg-black/50 text-gray-100 hover:bg-black/50"
                >
                  {isVideoMuted ? (
                    <VideoOff className="h-5 w-5" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                </Button>
                <div className="text-sm font-medium text-gray-300 bg-black/50 px-3 py-1 rounded-lg">
                  {formatTime(elapsedTime)}
                </div>
              </div>
              {isRecording && (
                <div className="flex items-center bg-red-500/90 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                  <span className="text-sm font-medium">Recording</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-black rounded-2xl shadow-xl p-6 flex flex-col">
            <div className="border-b border-gray-800 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-100">
                {selectedRole.replace(/_/g, " ")} Questions
              </h2>
              <div className="flex items-center mt-2 text-gray-400">
                <span className="text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
              </div>
            </div>

            <Card className="flex-1 flex items-center justify-center p-8 bg-black/30 border-gray-800 rounded-xl mb-6">
              <p className="text-2xl text-gray-100 text-center leading-relaxed">
                {questions[currentQuestionIndex]}
              </p>
            </Card>

            <div className="flex gap-4 mt-auto">
              <Button
                variant="outline"
                onClick={() => handleQuestionNavigation("previous")}
                disabled={currentQuestionIndex === 0}
                className="flex-1 py-4 rounded-xl border-gray-700 text-gray-100 hover:border-indigo-500 hover:bg-indigo-500/10"
              >
                Previous
              </Button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={() => handleQuestionNavigation("next")}
                  className="flex-1 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={stopTest}
                  disabled={isUploading}
                  className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-700"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Finish Interview"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="fixed bottom-4 right-4 bg-black/90 px-4 py-3 rounded-lg backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3">
            {uploadProgress === 100 ? (
              <Loader2 className="h-5 w-5 text-green-400 animate-spin" />
            ) : (
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-100">{uploadStatus}</p>
              <div className="w-32 bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadStatus.startsWith("Failed") && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
          <Alert variant="destructive" className="bg-red-900/30 border-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {uploadStatus}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}