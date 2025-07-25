"use server";

import { db } from "@/lib/db";

export async function getInterviewers() {
  try {
    const interviewers = await db.interviewer.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return { success: true, data: interviewers };
  } catch (error) {
    console.error("Error fetching interviewers:", error);
    return { success: false, error: "Failed to fetch interviewers" };
  }
}

export async function getInterviewerById(id: string) {
  try {
    const interviewer = await db.interviewer.findUnique({
      where: { id, isActive: true }
    });

    if (!interviewer) {
      return { success: false, error: "Interviewer not found" };
    }

    return { success: true, data: interviewer };
  } catch (error) {
    console.error("Error fetching interviewer:", error);
    return { success: false, error: "Failed to fetch interviewer details" };
  }
}