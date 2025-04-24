"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { saveResumeTextUrl } from "./extracted-text-and-url";

// Define the input type for clarity and possible validation
type JobInput = { title: string; skills: string[] };
type SaveResumeInput = {
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
  };
export const saveResume = async (data: SaveResumeInput) => {
  try {
    // Ensure the user is authenticated.
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { jobs, skills } = data;
    if (!jobs || !skills) {
      return { success: false, error: "Missing required fields" };
    }
    console.log("jobs132", jobs);
    console.log("skills123", skills);

    // First, update the user's resumeUrl and skills
    await db.user.update({
      where: { id: user.id },
      data: {
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



  type ExtractedJobsData = {
    parsedJobs: { title: string; skills: string[] }[];
    parsedSkills: string[];
  };
  
  export async function processExtractedText(extractedText: string) {
    try {
      const user = await currentUser();
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }
  
      // Make the API call to extract resume jobs from the text
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/extract-resume-jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ extractedText }),
        cache: "no-store",
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
  
      const data = await response.json() as ExtractedJobsData;
  
      // Save the extracted data
      const saveResult = await saveResume({
        jobs: data.parsedJobs,
        skills: data.parsedSkills,
      });
  
      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save resume info");
      }
  
      // Revalidate the path to update server data
      revalidatePath("/interview/resume");
  
      return { success: true, data };
    } catch (error: any) {
      console.error("Error processing extracted text:", error);
      return { 
        success: false, 
        error: error.message || "Failed to process extracted text" 
      };
    }
  }

  export async function processResumeComplete(resumeUrl: string, extractedText: string) {
    try {
      const user = await currentUser();
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }
  
      // 1. Save the resume URL and extracted text to the database
      await saveResumeTextUrl({ resumeUrl, extractedText });
  
      // 2. Make the API call to extract resume jobs from the text
      // Use absolute URL with proper protocol
      const apiUrl = new URL('/api/extract-resume-jobs', process.env.NEXT_PUBLIC_APP_URL || 
        `https://${process.env.VERCEL_URL}` || 
        'http://localhost:3000');
      
      console.log("Calling API endpoint:", apiUrl.toString());
      
      try {
        const response = await fetch(apiUrl.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ extractedText }),
          cache: "no-store",
        });
  
        // Log status and content type for debugging
        console.log("API response status:", response.status);
        console.log("API response content-type:", response.headers.get('content-type'));
        
        // Handle non-OK responses
        if (!response.ok) {
          // Try to get the error message from the response
          let errorMessage = `API error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If response can't be parsed as JSON, get text content instead
            const textContent = await response.text();
            console.error("API response is not JSON:", textContent.substring(0, 200));
            errorMessage = `API returned invalid JSON (status ${response.status})`;
          }
          throw new Error(errorMessage);
        }
  
        // Parse the JSON response with error handling
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText) as ExtractedJobsData;
        } catch (parseError) {
          console.error("Failed to parse API response as JSON:", responseText.substring(0, 200));
          throw new Error("API returned invalid JSON");
        }
  
        // 3. Save the extracted job data
        const saveResult = await saveResume({
          jobs: data.parsedJobs,
          skills: data.parsedSkills,
        });
  
        if (!saveResult.success) {
          throw new Error(saveResult.error || "Failed to save resume info");
        }
  
        // Revalidate the path to update server data
        revalidatePath("/interview/resume");
  
        return { success: true, data };
      } catch (apiError: any) {
        console.error("API call failed:", apiError);
        throw new Error(`Error calling API: ${apiError.message}`);
      }
    } catch (error: any) {
      console.error("Error processing resume:", error);
      return { 
        success: false, 
        error: error.message || "Failed to process resume" 
      };
    }
  }