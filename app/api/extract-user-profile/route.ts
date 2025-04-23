// app/api/extract-user-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { optional, z } from 'zod';

export const runtime = 'edge';

// 1. Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  maxRetries: 2,
});

// 2. Define a Zod schema matching full resume profile details
const profileSchema = z.object({
  personal_details: z.object({
    fullName: z.string(),
    mail: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    summary: z.string().optional(),
  }),
  experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      summary: z.string().optional(),
      techStack: z.array(z.string()).optional(),
      highlights: z.array(z.string()).optional(),
    })
  ).optional(),
  education: z.array(
    z.object({
      institution: z.string(),
      area: z.string(),
      studyType: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      gpa: z.string().optional(),
    })
  ).optional(),
  skills: z.array(
    z.object({
      name: z.string(),
      level: z.string().optional(),
      keywords: z.array(z.string()),
    })
  ).optional(),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      url: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    })
  ).optional(),
  codingProfiles: z.array(
    z.object({
      platform: z.string(),
      url: z.string(),
    })
  ).optional(),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string().optional(),
    })
  ).optional(),
  hobbies: z.array(z.string()).optional(),
});

// 3. Build a prompt instructing the model to output exactly that schema
const extractPrompt = PromptTemplate.fromTemplate(`
You are a resume parsing assistant. Extract the following sections exactly as JSON matching this Zod schema:

${profileSchema.toString()}

Resume Text:
{text}

Return only valid JSON matching the schema.`);

export async function POST(req: NextRequest) {
  console.log("console comes here")
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: 'No resume text provided' },
        { status: 400 }
      );
    }

    // 4. Build and run the chain
    const chain = extractPrompt.pipe(
      llm.withStructuredOutput(profileSchema)
    );
    const parsed = await chain.invoke({ text });

    // 5. Log for now; later persist to database
    console.log(
      '🔍 Extracted Full Resume Profile:',
      JSON.stringify(parsed, null, 2)
    );

    // 6. Return parsed object
    return NextResponse.json({ profile: parsed });
  } catch (err: any) {
    console.error('❌ Error extracting user profile:', err);
    return NextResponse.json(
      { error: 'Failed to extract profile', details: err.message },
      { status: 500 }
    );
  }
}
