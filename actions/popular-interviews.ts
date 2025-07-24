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
}: {
  popularInterviewId: string;
  questionCount: number;
  duration: number;
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

    const session = await db.popularInterviewSession.create({
      data: {
        userId: user.id,
        popularInterviewId,
        questionCount,
        duration,
        startTime: new Date(),
      },
      include: {
        popularInterview: true,
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
