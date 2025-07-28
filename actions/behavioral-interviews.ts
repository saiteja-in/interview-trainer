"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getBehavioralInterviews() {
  try {
    const interviews = await db.behavioralInterview.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { company: "asc" }, { title: "asc" }],
    });

    return { success: true, data: interviews };
  } catch (error) {
    console.error("Error fetching behavioral interviews:", error);
    return { success: false, error: "Failed to fetch behavioral interviews" };
  }
}

export async function getBehavioralInterviewById(id: string) {
  try {
    const interview = await db.behavioralInterview.findUnique({
      where: { id, isActive: true },
    });

    if (!interview) {
      return { success: false, error: "Interview not found" };
    }

    return { success: true, data: interview };
  } catch (error) {
    console.error("Error fetching behavioral interview:", error);
    return { success: false, error: "Failed to fetch interview details" };
  }
}

export async function createBehavioralInterviewSession({
  behavioralInterviewId,
  questionCount,
  duration,
  experienceLevel,
  targetRole,
  interviewerId,
}: {
  behavioralInterviewId: string;
  questionCount: number;
  duration: number;
  experienceLevel: "ENTRY" | "MID" | "SENIOR";
  targetRole: string;
  interviewerId?: string;
}) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the behavioral interview exists
    const behavioralInterview = await db.behavioralInterview.findUnique({
      where: { id: behavioralInterviewId, isActive: true },
    });

    if (!behavioralInterview) {
      return { success: false, error: "Interview not found" };
    }

    // Verify interviewer exists if provided
    if (interviewerId) {
      const interviewer = await db.interviewer.findUnique({
        where: { id: interviewerId, isActive: true },
      });

      if (!interviewer) {
        return { success: false, error: "Interviewer not found" };
      }
    }

    const session = await db.behavioralInterviewSession.create({
      data: {
        userId: user.id,
        behavioralInterviewId,
        interviewerId,
        questionCount,
        duration,
        experienceLevel,
        targetRole,
        startTime: new Date(),
      },
      include: {
        behavioralInterview: true,
        interviewer: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: session };
  } catch (error) {
    console.error("Error creating behavioral interview session:", error);
    return { success: false, error: "Failed to start interview session" };
  }
}

export async function createBehavioralInterviewSessionWithQuestions({
  behavioralInterviewId,
  questionCount,
  duration,
  experienceLevel,
  targetRole,
  interviewerId,
  questions,
}: {
  behavioralInterviewId: string;
  questionCount: number;
  duration: number;
  experienceLevel: "ENTRY" | "MID" | "SENIOR";
  targetRole: string;
  interviewerId?: string;
  questions: string[];
}) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the behavioral interview exists
    const behavioralInterview = await db.behavioralInterview.findUnique({
      where: { id: behavioralInterviewId, isActive: true },
    });

    if (!behavioralInterview) {
      return { success: false, error: "Interview not found" };
    }

    // Verify interviewer exists if provided
    if (interviewerId) {
      const interviewer = await db.interviewer.findUnique({
        where: { id: interviewerId, isActive: true },
      });

      if (!interviewer) {
        return { success: false, error: "Interviewer not found" };
      }
    }

    const session = await db.behavioralInterviewSession.create({
      data: {
        userId: user.id,
        behavioralInterviewId,
        interviewerId,
        questionCount,
        duration,
        experienceLevel,
        targetRole,
        questions, // Store the AI-generated questions
        startTime: new Date(),
      },
      include: {
        behavioralInterview: true,
        interviewer: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: session };
  } catch (error) {
    console.error("Error creating behavioral interview session:", error);
    return { success: false, error: "Failed to start interview session" };
  }
}

export async function getUserBehavioralInterviewStats() {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const stats = await db.behavioralInterviewSession.groupBy({
      by: ["behavioralInterviewId"],
      where: { userId: user.id },
      _count: {
        id: true,
      },
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching user behavioral interview stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

export async function getBehavioralInterviewSession(sessionId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const session = await db.behavioralInterviewSession.findUnique({
      where: { 
        id: sessionId,
        userId: user.id 
      },
      include: {
        behavioralInterview: true,
        interviewer: true
      }
    });

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    return { success: true, data: session };
  } catch (error) {
    console.error("Error fetching behavioral interview session:", error);
    return { success: false, error: "Failed to fetch session" };
  }
}

export async function updateBehavioralInterviewSessionStatus(sessionId: string, status: "IN_PROGRESS" | "COMPLETED") {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const session = await db.behavioralInterviewSession.update({
      where: { 
        id: sessionId,
        userId: user.id 
      },
      data: {
        status,
        endTime: status === "COMPLETED" ? new Date() : undefined
      }
    });

    return { success: true, data: session };
  } catch (error) {
    console.error("Error updating behavioral session status:", error);
    return { success: false, error: "Failed to update session" };
  }
}

export async function saveBehavioralInterviewResponse({
  sessionId,
  questionText,
  userResponse,
  aiResponse,
  responseTime
}: {
  sessionId: string;
  questionText: string;
  userResponse?: string;
  aiResponse?: string;
  responseTime?: number;
}) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify session belongs to user
    const session = await db.behavioralInterviewSession.findUnique({
      where: { 
        id: sessionId,
        userId: user.id 
      }
    });

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    const response = await db.behavioralInterviewResponse.create({
      data: {
        sessionId,
        questionText,
        userResponse,
        aiResponse,
        responseTime
      }
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Error saving behavioral interview response:", error);
    return { success: false, error: "Failed to save response" };
  }
}

// Alias for getBehavioralInterviewSession to match the expected function name
export const getBehavioralInterviewSessionById = getBehavioralInterviewSession;