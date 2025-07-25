import { db } from "@/lib/db";

const getAllInterviewers = async (clientId: string = "") => {
  try {
    const interviewers = await db.interviewer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return interviewers || [];
  } catch (error) {
    console.error("Error fetching interviewers:", error);
    return [];
  }
};

const createInterviewer = async (payload: any) => {
  try {
    // Check for existing interviewer with the same name and agentId
    const existingInterviewer = await db.interviewer.findFirst({
      where: {
        name: payload.name,
        agentId: payload.agentId,
      },
    });

    if (existingInterviewer) {
      console.error("An interviewer with this name and agentId already exists");
      return existingInterviewer; // Return existing instead of null
    }

    const interviewer = await db.interviewer.create({
      data: {
        ...payload,
        isActive: true,
      },
    });

    return interviewer;
  } catch (error) {
    console.error("Error creating interviewer:", error);
    return null;
  }
};

const getInterviewer = async (interviewerId: string) => {
  try {
    const interviewer = await db.interviewer.findUnique({
      where: {
        id: interviewerId,
        isActive: true,
      },
    });

    return interviewer;
  } catch (error) {
    console.error("Error fetching interviewer:", error);
    return null;
  }
};

export const InterviewerService = {
  getAllInterviewers,
  createInterviewer,
  getInterviewer,
};
