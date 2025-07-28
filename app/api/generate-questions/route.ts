import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";


// Schema for structured interview questions output
const interviewQuestionsSchema = z.object({
  description: z
    .string()
    .max(300)
    .describe("A brief description of the interview (50 words or less)"),
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .max(250)
          .describe("Interview question (concise and clear)"),
      })
    )
    .describe("Array of interview questions"),
});

export async function POST(req: NextRequest) {
  logger.info("generate-interview-questions request received");

  try {
    console.log("🔄 Starting POST request processing...");

    const body = await req.json();
    console.log("📥 Request body received:", JSON.stringify(body, null, 2));

    const { name, objective, number, context } = body;
    console.log("📋 Extracted fields:", {
      name: name || "MISSING",
      objective: objective || "MISSING",
      number: number || "MISSING",
      context: context || "MISSING",
    });

    if (!name || !objective || !number || !context) {
      console.log("❌ Validation failed - missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: name, objective, number, context" },
        { status: 400 }
      );
    }

    console.log("🤖 Initializing Google AI model (gemini-2.0-flash)...");
    const model = google("gemini-2.0-flash");

    const prompt = `Generate interview questions for the following interview:

Interview Title: ${name}
Interview Objective: ${objective}
Number of questions to generate: ${number}
Context: ${context}

STRICT REQUIREMENTS:
1. Description: Maximum 50 words (approximately 250 characters)
2. Questions: Each question must be under 35 words (approximately 200 characters)
3. Generate exactly ${number} questions

Guidelines for question creation:
- Focus on evaluating technical knowledge and project experience
- Assess problem-solving skills through practical examples
- Include questions about how candidates tackled challenges in previous projects
- Address soft skills (communication, teamwork, adaptability) with less emphasis than technical skills
- Maintain a professional yet approachable tone
- Create concise, clear, open-ended questions
- Encourage detailed responses that demonstrate expertise

Output requirements:
- Description: Brief second-person explanation of what the interview covers (under 50 words)
- Questions: Exactly ${number} concise, relevant questions (each under 35 words)
- Make questions specific to the role and encourage sharing examples
- Don't reveal the exact objective in the description

IMPORTANT: Keep all questions concise and under the word limits specified.`;

    console.log("📝 Generated prompt length:", prompt.length);
    console.log(
      "🔧 Using schema:",
      JSON.stringify(interviewQuestionsSchema._def, null, 2)
    );

    console.log("🚀 Calling generateObject with AI SDK...");
    const result = await generateObject({
      model,
      schema: interviewQuestionsSchema,
      prompt,
      temperature: 0.7,
    });

    console.log("✅ AI generation completed successfully!");
    console.log(
      "📊 Generated content:",
      JSON.stringify(result.object, null, 2)
    );
    console.log("🔍 Content validation:", {
      hasDescription: !!result.object.description,
      descriptionLength: result.object.description?.length || 0,
      questionsCount: result.object.questions?.length || 0,
      firstQuestion: result.object.questions?.[0]?.question || "No questions",
    });

    logger.info("Interview questions generated successfully");

    const responseData = JSON.stringify(result.object);
    console.log("📤 Sending response:", responseData);

    return NextResponse.json(
      {
        response: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("💥 ERROR CAUGHT:");
    console.log("Error type:", typeof error);
    console.log("Error constructor:", error?.constructor?.name);
    console.log(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.log(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack available"
    );
    console.log("Full error object:", error);

    logger.error(
      "Error generating interview questions",
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
