"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPopularInterviews() {
  try {
    const interviews = await db.popularInterview.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    return { success: true, data: interviews };
  } catch (error) {
    console.error("Error fetching popular interviews:", error);
    return { success: false, error: "Failed to fetch popular interviews" };
  }
}

export async function getPopularInterviewById(id: string) {
  try {
    const interview = await db.popularInterview.findUnique({
      where: { id, isActive: true },
    });

    if (!interview) {
      return { success: false, error: "Interview not found" };
    }

    return { success: true, data: interview };
  } catch (error) {
    console.error("Error fetching popular interview:", error);
    return { success: false, error: "Failed to fetch interview details" };
  }
}

export async function createPopularInterviewSession({
  popularInterviewId,
  questionCount,
  duration,
  interviewerId,
}: {
  popularInterviewId: string;
  questionCount: number;
  duration: number;
  interviewerId?: string;
}) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the popular interview exists
    const popularInterview = await db.popularInterview.findUnique({
      where: { id: popularInterviewId, isActive: true },
    });

    if (!popularInterview) {
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

    const session = await db.popularInterviewSession.create({
      data: {
        userId: user.id,
        popularInterviewId,
        interviewerId,
        questionCount,
        duration,
        startTime: new Date(),
      },
      include: {
        popularInterview: true,
        interviewer: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: session };
  } catch (error) {
    console.error("Error creating popular interview session:", error);
    return { success: false, error: "Failed to start interview session" };
  }
}

export async function getUserPopularInterviewStats() {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const stats = await db.popularInterviewSession.groupBy({
      by: ["popularInterviewId"],
      where: { userId: user.id },
      _count: {
        id: true,
      },
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching user popular interview stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

export async function getPopularInterviewSession(sessionId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const session = await db.popularInterviewSession.findUnique({
      where: { 
        id: sessionId,
        userId: user.id 
      },
      include: {
        popularInterview: true,
        interviewer: true
      }
    });

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    return { success: true, data: session };
  } catch (error) {
    console.error("Error fetching interview session:", error);
    return { success: false, error: "Failed to fetch session" };
  }
}

export async function updateInterviewSessionStatus(sessionId: string, status: "IN_PROGRESS" | "COMPLETED") {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const session = await db.popularInterviewSession.update({
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
    console.error("Error updating session status:", error);
    return { success: false, error: "Failed to update session" };
  }
}

export async function saveInterviewResponse({
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
    const session = await db.popularInterviewSession.findUnique({
      where: { 
        id: sessionId,
        userId: user.id 
      }
    });

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    const response = await db.interviewResponse.create({
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
    console.error("Error saving interview response:", error);
    return { success: false, error: "Failed to save response" };
  }
}
