"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSignedURL } from "@/actions/videoupload";

export default function VideoUploadForm() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setStatusMessage("Uploading video...");
    setLoading(true);

    try {
      const signedURLResult = await getSignedURL({
        fileType: file.type,
        checksum: await computeSHA256(file),
      });

      if (signedURLResult.failure !== undefined) {
        throw new Error(signedURLResult.failure);
      }

      const url = signedURLResult.success.url;
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      setStatusMessage("Video uploaded successfully!");
    } catch (error) {
      setStatusMessage("Failed to upload video");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFile(file);
    
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    } else {
      setFileUrl(undefined);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {statusMessage && (
            <Alert>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-violet-100"
            />

            {fileUrl && file && (
              <div className="rounded-lg overflow-hidden w-full aspect-video relative">
                <video
                  className="w-full h-full object-cover"
                  src={fileUrl}
                  controls
                  playsInline
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFile(undefined);
                  setFileUrl(undefined);
                }}
                disabled={!file || loading}
              >
                Remove
              </Button>
              
              <Button type="submit" disabled={!file || loading}>
                {loading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}