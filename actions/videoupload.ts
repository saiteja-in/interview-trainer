"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";

const generateFileName = (bytes = 32) => {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION1!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY1!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1!,
  },
});

const acceptedTypes = ["video/mp4", "video/webm"];
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB max file size

type GetSignedURLParams = {
  fileType: string;
  checksum: string;
  isMultipart?: boolean;
  uploadId?: string;
  partNumber?: number;
  fileName?: string;
};

export async function getSignedURL({
  fileType, 
  checksum, 
  isMultipart = false, 
  uploadId, 
  partNumber,
  fileName
}: GetSignedURLParams) {
  const user = await currentUser();

  if (!user) {
    return { failure: "Not authenticated" };
  }

  if (!acceptedTypes.includes(fileType)) {
    return { failure: "Invalid file type" };
  }

  const uniqueFileName = fileName || generateFileName();
  const videoUrl = `https://${process.env.AWS_BUCKET_NAME1}.s3.${process.env.AWS_BUCKET_REGION1}.amazonaws.com/${uniqueFileName}`;

  try {
    if (isMultipart) {
      if (!uploadId) {
        const createMultipartUploadCommand = new CreateMultipartUploadCommand({
          Bucket: process.env.AWS_BUCKET_NAME1!,
          Key: uniqueFileName,
          ContentType: fileType,
          Metadata: {
            userId: user.id!,
            checksum: checksum
          }
        });

        const multipartUpload = await s3.send(createMultipartUploadCommand);
        
        return { 
          success: { 
            uploadId: multipartUpload.UploadId!, 
            fileName: uniqueFileName 
          } 
        };
      } else {
        if (!partNumber) {
          return { failure: "Part number is required for multipart upload" };
        }

        const uploadPartCommand = new UploadPartCommand({
          Bucket: process.env.AWS_BUCKET_NAME1!,
          Key: uniqueFileName,
          PartNumber: partNumber,
          UploadId: uploadId,
        });

        const signedURL = await getSignedUrl(s3, uploadPartCommand, {
          expiresIn: 3600 // 1 hour
        });

        return { success: { url: signedURL } };
      }
    } else {
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME1!,
        Key: uniqueFileName,
        ContentType: fileType,
        ChecksumSHA256: checksum,
        Metadata: {
          userId: user.id!,
        },
      });

      const signedURL = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 60,
      });

      const result = await addVideo({ videoUrl, userId: user.id! });

      if (result.failure) {
        return { failure: "Failed to save video to the database" };
      }

      return { success: { url: signedURL } };
    }
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { failure: "Failed to generate signed URL" };
  }
}

export async function completeMultipartUpload({
  fileName,
  uploadId,
  parts
}: {
  fileName: string;
  uploadId: string;
  parts: Array<{ETag: string, PartNumber: number}>
}) {
  const user = await currentUser();

  if (!user) {
    return { failure: "Not authenticated" };
  }

  try {
    const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

    const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_BUCKET_NAME1!,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: sortedParts.map(part => ({
          ETag: part.ETag,
          PartNumber: part.PartNumber
        }))
      }
    });

    const result = await s3.send(completeMultipartUploadCommand);
    // Continued from previous artifact
    const videoUrl = `https://${process.env.AWS_BUCKET_NAME1}.s3.${process.env.AWS_BUCKET_REGION1}.amazonaws.com/${fileName}`;
    const addResult = await addVideo({ videoUrl, userId: user.id! });

    if (addResult.failure) {
      return { failure: "Failed to save video to the database" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error completing multipart upload:", error);
    return { failure: "Failed to complete multipart upload" };
  }
}

export async function getUserVideo() {
  const user = await currentUser();

  if (!user) {
    return { failure: "Not authenticated" };
  }

  try {
    const videos = await db.video.findMany({
      where: { userId: user.id },
    });

    if (!videos || videos.length === 0) {
      return { failure: "No videos found for the current user" };
    }

    // Generate signed URLs for each video
    const videosWithSignedUrls = await Promise.all(
      videos.map(async (video) => {
        if (!video.videoUrl) return video;
        
        try {
          // Extract S3 object key from stored URL
          const key = video.videoUrl.split('/').pop()!;
          
          const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME1!,
            Key: key,
          });

          // Generate pre-signed URL valid for 1 hour
          const signedUrl = await getSignedUrl(s3, getObjectCommand, { 
            expiresIn: 3600 
          });

          return {
            ...video,
            videoUrl: signedUrl,
          };
        } catch (error) {
          console.error(`Error signing URL for video ${video.id}:`, error);
          return video; // Return original video if signing fails
        }
      })
    );

    return { success: videosWithSignedUrls };
  } catch (error) {
    console.error("Error fetching videos:", error);
    return { failure: "Failed to fetch videos" };
  }
}

export async function addVideo({
  videoUrl,
  userId,
}: {
  videoUrl: string;
  userId: string;
}) {
  try {
    const video = await db.video.create({
      data: {
        userId,
        videoUrl,
        // processingStatus: 'PENDING', // Add processing status tracking
        // metadata: {
        //   uploadedAt: new Date().toISOString()
        // }
      }
    });

    // Optional: Trigger video processing or thumbnail generation
    // await triggerVideoProcessing(video.id);

    revalidatePath("/videos")
    return { success: true, videoId: video.id };
  } catch (error) {
    console.error("Error adding video:", error);
    return { failure: "Failed to add video to the database" };
  }
}

// Optional: Video processing trigger
// async function triggerVideoProcessing(videoId: string) {
//   try {
//     // Placeholder for video processing logic
//     // Could involve sending a message to a queue, 
//     // calling a video processing service, etc.
//     await db.video.update({
//       where: { id: videoId },
//       data: { 
//         processingStatus: 'PROCESSING' 
//       }
//     });
//   } catch (error) {
//     console.error("Video processing trigger failed:", error);
//   }
// }

// // Optional: Error logging and monitoring
// export async function logUploadError(errorDetails: {
//   userId: string, 
//   fileType: string, 
//   fileSize: number, 
//   errorMessage: string
// }) {
//   try {
//     await db.uploadError.create({
//       data: {
//         ...errorDetails,
//         timestamp: new Date()
//       }
//     });
//   } catch (error) {
//     console.error("Failed to log upload error:", error);
//   }
// }