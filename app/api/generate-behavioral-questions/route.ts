import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Schema for structured behavioral interview questions output
const behavioralQuestionsSchema = z.object({
  description: z
    .string()
    .max(500)
    .describe("A brief description of the behavioral interview (50 words or less)"),
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .max(250)
          .describe("Behavioral interview question using STAR method framework"),
      })
    )
    .describe("Array of behavioral interview questions"),
});

export async function POST(req: NextRequest) {
  logger.info("generate-behavioral-questions request received");

  try {
    console.log("🔄 Starting behavioral questions POST request processing...");

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

    console.log("🤖 Initializing Google AI model (gemini-2.0-flash) for behavioral questions...");
    const model = google("gemini-2.0-flash");

    const prompt = `Generate behavioral interview questions for the following interview:

Interview Title: ${name}
Interview Objective: ${objective}
Number of questions to generate: ${number}
Context: ${context}

BEHAVIORAL INTERVIEW REQUIREMENTS:
1. Description: Maximum 50 words explaining the behavioral interview focus
2. Questions: Each question must be under 40 words and follow STAR method principles
3. Generate exactly ${number} behavioral questions

STAR Method Framework:
- Situation: Ask for specific examples from past experiences
- Task: What was required or expected
- Action: What specific actions did they take
- Result: What was the outcome or impact

Behavioral Question Categories to Include:
- Leadership and influence
- Problem-solving and decision-making
- Communication and collaboration
- Adaptability and learning
- Conflict resolution
- Time management and prioritization
- Initiative and ownership
- Teamwork and relationship building
- Handling pressure and stress
- Customer focus and service orientation

Guidelines for behavioral question creation:
- Start with phrases like "Tell me about a time when...", "Describe a situation where...", "Give me an example of..."
- Focus on past experiences and specific examples
- Encourage detailed responses using the STAR method
- Ask for concrete examples rather than hypothetical scenarios
- Include questions that reveal character, work style, and values
- Balance questions across different competency areas
- Make questions relevant to the role and experience level
- Avoid leading questions or those with obvious "right" answers

Experience Level Considerations:
- Entry Level: Focus on school projects, internships, part-time work, volunteer experiences
- Mid Level: Emphasize professional experiences, project leadership, team collaboration
- Senior Level: Leadership scenarios, strategic decisions, organizational impact, mentoring

Output requirements:
- Description: Brief explanation of the behavioral interview focus (under 50 words)
- Questions: Exactly ${number} behavioral questions using STAR framework (each under 40 words)
- Questions should encourage sharing specific examples and experiences
- Focus on competencies relevant to the role and experience level

IMPORTANT: All questions must follow behavioral interview best practices and encourage STAR method responses.`;

    console.log("📝 Generated behavioral prompt length:", prompt.length);
    console.log(
      "🔧 Using behavioral schema:",
      JSON.stringify(behavioralQuestionsSchema._def, null, 2)
    );

    console.log("🚀 Calling generateObject for behavioral questions...");
    const result = await generateObject({
      model,
      schema: behavioralQuestionsSchema,
      prompt,
      temperature: 0.7,
    });

    console.log("✅ Behavioral AI generation completed successfully!");
    console.log(
      "📊 Generated behavioral content:",
      JSON.stringify(result.object, null, 2)
    );
    console.log("🔍 Behavioral content validation:", {
      hasDescription: !!result.object.description,
      descriptionLength: result.object.description?.length || 0,
      questionsCount: result.object.questions?.length || 0,
      firstQuestion: result.object.questions?.[0]?.question || "No questions",
    });

    logger.info("Behavioral interview questions generated successfully");

    const responseData = JSON.stringify(result.object);
    console.log("📤 Sending behavioral response:", responseData);

    return NextResponse.json(
      {
        response: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("💥 BEHAVIORAL QUESTIONS ERROR CAUGHT:");
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
      "Error generating behavioral interview questions",
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}