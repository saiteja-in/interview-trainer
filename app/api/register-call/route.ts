import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request) {
  logger.info("register-call request received");

  const body = await req.json();

  const interviewerId = body.interviewer_id;
  const interviewer = await InterviewerService.getInterviewer(interviewerId);
  console.log("intervierwfasdlkjid", interviewerId);

  if (!interviewer) {
    logger.error("Interviewer not found", { interviewerId });
    return NextResponse.json(
      { error: "Interviewer not found" },
      { status: 404 }
    );
  }

  if (!interviewer.agentId) {
    logger.error("Interviewer agentId not configured", { interviewerId });
    return NextResponse.json(
      { error: "Interviewer not properly configured" },
      { status: 500 }
    );
  }

  const registerCallResponse = await retellClient.call.createWebCall({
    agent_id: interviewer.agentId,
    retell_llm_dynamic_variables: body.dynamic_data,
  });

  logger.info("Call registered successfully");

  return NextResponse.json(
    {
      registerCallResponse,
    },
    { status: 200 }
  );
}
