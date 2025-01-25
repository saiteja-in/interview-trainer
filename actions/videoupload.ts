"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
};

export async function getSignedURL({ fileType, checksum }: GetSignedURLParams) {
  console.log("server file type",fileType)
  console.log("server checksum",checksum)
  const user = await currentUser();

  if (!user) {
    return { failure: "Not authenticated" };
  }

  if (!acceptedTypes.includes(fileType)) {
    return { failure: "Invalid file type" };
  }

  const fileName = generateFileName(); // Unique file name
  console.log("server file name (unique file name)",fileName)
  const videoUrl = `https://${process.env.AWS_BUCKET_NAME1}.s3.${process.env.AWS_BUCKET_REGION1}.amazonaws.com/${fileName}`;
  console.log("videoUrl (main link)",videoUrl)
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME1!,
    Key: fileName,
    ContentType: fileType,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: user.id!,
    },
  });

  const signedURL = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 60,
  });
  console.log("signedUrl server",signedURL)

  try {
    // Add video URL to the database
    const result = await addVideo({ videoUrl, userId: user.id! });
    console.log("result",result)

    if (result.failure) {
      return { failure: "Failed to save video to the database" };
    }
  } catch (error) {
    console.error("Error saving video to database:", error);
    return { failure: "Failed to save video to the database" };
  }

  return { success: { url: signedURL } };
}

export async function getUserVideo() {
  const user = await currentUser();

  if (!user) {
    return { failure: "Not authenticated" };
  }

  try {
    // Fetch all videos for the current user
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
