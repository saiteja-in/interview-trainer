//working good with the dummy.tsx
"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
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

  // Generate a unique file name if not provided (for multipart upload)
  const uniqueFileName = fileName || generateFileName();
  const videoUrl = `https://${process.env.AWS_BUCKET_NAME1}.s3.${process.env.AWS_BUCKET_REGION1}.amazonaws.com/${uniqueFileName}`;

  try {
    if (isMultipart) {
      if (!uploadId) {
        // Initiate multipart upload
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
        // Generate presigned URL for a specific part
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
      // Single part upload
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

      // Add video URL to the database
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
  console.log("filename",fileName)
  console.log("uploadId",uploadId)
  console.log("parts",parts)

  if (!user) {
    return { failure: "Not authenticated" };
  }

  try {
    // Sort parts by part number in ascending order
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
    console.log("result",result)

    // Add video URL to the database
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

    return { success: videos };
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
    // Create a new video entry for every upload
    await db.video.create({
      data: {
        userId,
        videoUrl,
      },
    });
    revalidatePath("/videos")
    return { success: true };
  } catch (error) {
    console.error("Error adding video:", error);
    return { failure: "Failed to add video to the database" };
  }
}
