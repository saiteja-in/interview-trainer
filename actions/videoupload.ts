"use server"

import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { revalidatePath } from "next/cache"

const generateFileName = (bytes = 32) => {
    const array = new Uint8Array(bytes)
    crypto.getRandomValues(array)
    return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("")
}

const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION1!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY1!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1!
    }   
})

const acceptedTypes = [
    "video/mp4",
    "video/webm",
]

type GetSignedURLParams = {
    fileType: string
    checksum: string
}

export async function getSignedURL({ fileType, checksum }: GetSignedURLParams) {
    const user = await currentUser();
    
    if (!user) {
        return { failure: "Not authenticated" }
    }
    
    if (!acceptedTypes.includes(fileType)) {
        return { failure: "Invalid file type" }
    }

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME1!,
        Key: generateFileName(),
        ContentType: fileType,
        ChecksumSHA256: checksum,
        Metadata: {
            userId: user.id!
        }
    })

    const signedURL = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 60
    })

    return { success: { url: signedURL } }
}

export async function addVideo({
    videoUrl,
    userId
}: {
    videoUrl: string,
    userId: string
}) {
    const user = await currentUser();
    
    if (!user || user.id !== userId) {
        return { failure: "Not authenticated" }
    }

    try {
        // Check if a video already exists for this user
        const existingVideo = await db.video.findUnique({
            where: { userId }
        });

        if (existingVideo) {
            // Update existing video
            await db.video.update({
                where: { userId },
                data: { 
                    resumeUrl: videoUrl,
                }
            });
        } else {
            // Create new video entry
            await db.video.create({
                data: {
                    userId,
                    resumeUrl: videoUrl,
                }
            });
        }
        
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error adding video:", error);
        return { failure: "Failed to add video" }
    }
}