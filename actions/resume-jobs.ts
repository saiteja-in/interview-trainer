"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Define the input type for clarity and possible validation
type JobInput = { title: string; skills: string[] };
type SaveResumeInput = {
  resumeUrl: string;
  jobs: JobInput[];
  skills: string[];
};
type ResumeData = {
    resumeJobs: {
      id: string;
      title: string;
      skills: string[];
    }[];
    skills: string[];
    resumeUrl: string | null;
  };
export const saveResume = async (data: SaveResumeInput) => {
  try {
    // Ensure the user is authenticated.
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { resumeUrl, jobs, skills } = data;
    if (!resumeUrl || !jobs || !skills) {
      return { success: false, error: "Missing required fields" };
    }
    console.log("resumeUrl123", resumeUrl);
    console.log("jobs132", jobs);
    console.log("skills123", skills);

    // First, update the user's resumeUrl and skills
    await db.user.update({
      where: { id: user.id },
      data: {
        resumeUrl,
        skills,
      },
    });

    // Then create the resume jobs separately to avoid potential conflicts
    if (user.id) {
      for (const job of jobs) {
        await db.resumeJob.create({
          data: {
            title: job.title,
            skills: job.skills,
            userId: user.id,
          },
        });
      }
    }

    // Optionally, revalidate the path if you are using Next.js caching
    revalidatePath("/interview/resume");

    return { success: true };
  } catch (error: any) {
    console.error("Error saving resume data:", error);
    return { success: false, error: "Failed to save resume data", message: error.message };
  }
};
export const getResumeData = async (): Promise<{ 
    success: boolean; 
    data?: ResumeData; 
    error?: string 
  }> => {
    try {
      // Ensure the user is authenticated
      const user = await currentUser();
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }
  
      // Get the user with related resumeJobs
      const userData = await db.user.findUnique({
        where: { id: user.id },
        select: {
          skills: true,
          resumeUrl: true,
          resumeJobs: {
            select: {
              id: true,
              title: true,
              skills: true,
            },
          },
        },
      });
  
      if (!userData) {
        return { success: false, error: "User not found" };
      }
  
      return {
        success: true,
        data: {
          resumeJobs: userData.resumeJobs,
          skills: userData.skills || [],
          resumeUrl: userData.resumeUrl,
        },
      };
    } catch (error: any) {
      console.error("Error fetching resume data:", error);
      return { 
        success: false, 
        error: "Failed to fetch resume data", 
      };
    }
  };