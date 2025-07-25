"use server";

import { InterviewerService } from "@/services/interviewers.service";

export async function getInterviewers() {
  try {
    const interviewers = await InterviewerService.getAllInterviewers();
    
    // Transform the data to match the expected format
    const transformedInterviewers = interviewers.map((interviewer) => ({
      id: interviewer.id,
      name: interviewer.name,
      image: interviewer.image || "/interviewers/default.png",
      description: interviewer.description || "Professional AI interviewer",
      specialties: interviewer.specialties || ["Technical Interviews", "Behavioral Questions", "Problem Solving"], // Use database specialties or defaults
      rapport: interviewer.rapport || 7,
      exploration: interviewer.exploration || 7,
      empathy: interviewer.empathy || 7,
      speed: interviewer.speed || 5,
      audio: interviewer.audio || "",
      agentId: interviewer.agentId,
    }));

    return { success: true, data: transformedInterviewers };
  } catch (error) {
    console.error("Error fetching interviewers:", error);
    return { success: false, error: "Failed to fetch interviewers" };
  }
}