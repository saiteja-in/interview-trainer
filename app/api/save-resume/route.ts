// app/api/save-resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { resumeUrl, jobs, skills } = await req.json();
    if (!resumeUrl || !jobs || !skills) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update user with resume URL and skills, then create multiple resume job entries.
    await db.user.update({
      where: { id: user.id },
      data: {
        resumeUrl: resumeUrl,
        skills: skills, // update the skills array
        resumeJobs: {
          // Create new ResumeJob entries from the provided jobs array.
          create: jobs.map((job: { title: string; skills: string[] }) => ({
            title: job.title,
            skills: job.skills,
          })),
        },
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error saving resume data:", error);
    return NextResponse.json(
      { error: "Failed to save resume data", message: error.message },
      { status: 500 }
    );
  }
}
