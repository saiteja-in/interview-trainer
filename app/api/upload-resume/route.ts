// app/api/upload-resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { currentUser } from "@/lib/auth";

// Function to parse FormData from request
async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const fileName = formData.get('fileName') as string;
  
  if (!file || !fileName) {
    throw new Error("Missing file or fileName");
  }
  
  return { file, fileName };
}

// Function to read file as Buffer
async function readFileAsBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication (optional, based on your requirements)
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse the form data
    const { file, fileName } = await parseFormData(req);
    
    // Get file content as Buffer
    const fileBuffer = await readFileAsBuffer(file);
    
    // Ensure user.id and file.name are defined
    if (!user.id || !file.name) {
      return NextResponse.json({ error: "Missing user ID or file name" }, { status: 400 });
    }

    // Initialize S3 client
    const s3 = new S3Client({
      region: process.env.AWS_BUCKET_REGION1!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY1!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1!,
      },
    });

    // Create command for object upload
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME1!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.type,
      Metadata: {
        userId: user.id,
        originalFilename: file.name,
      },
    });

    // Upload to S3
    await s3.send(putObjectCommand);
    
    // Construct the file URL
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME1}.s3.${process.env.AWS_BUCKET_REGION1}.amazonaws.com/${fileName}`;

    // Return success response
    return NextResponse.json({ 
      success: true,
      fileUrl: fileUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return NextResponse.json(
      { error: "Failed to upload file", message: (error as Error).message },
      { status: 500 }
    );
  }
}