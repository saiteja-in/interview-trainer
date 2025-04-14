// app/api/extract-resume-jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

// Define the expected structure for job extraction.
const jobsExtractionStructure = {
  type: "array",
  items: {
    type: "object",
    properties: {
      title: { type: "string" },
      skills: { type: "array", items: { type: "string" } },
    },
    required: ["title", "skills"],
  },
};

// Simple runtime validator that checks if the parsed object meets the jobsExtractionStructure.
function validateJobsStructure(parsed: any): void {
  if (!Array.isArray(parsed)) {
    throw new Error("Parsed output is not an array");
  }
  if (parsed.length !== 2) {
    throw new Error("Expected exactly two job objects");
  }
  parsed.forEach((job, idx) => {
    if (typeof job.title !== "string" || job.title.trim() === "") {
      throw new Error(`Job object at index ${idx} is missing a valid title`);
    }
    if (!Array.isArray(job.skills)) {
      throw new Error(`Job object at index ${idx} does not have a skills array`);
    }
    job.skills.forEach((skill: any, skillIdx: number) => {
      if (typeof skill !== "string" || skill.trim() === "") {
        throw new Error(`Skill at index ${skillIdx} in job ${idx} is not a valid string`);
      }
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { extractedText } = await req.json();
    console.log("extractedText", extractedText);
    if (!extractedText) {
      return NextResponse.json(
        { error: "Missing extracted text" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const extractResumePrompt = `
You are a professional resume parser specializing in technical skill extraction.
Carefully analyze the entire resume text and extract TWO distinct job titles with their unique sets of technical skills.
Output a JSON array containing objects with keys "title" and "skills".

For example:
[
  {
    "title": "Frontend Developer",
    "skills": ["React", "TypeScript", "CSS", "Tailwind CSS", "Framer Motion", "Redux", "Jest"]
  },
  {
    "title": "DevOps Engineer",
    "skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Jenkins", "Linux"]
  }
]

CRITICAL REQUIREMENTS:
1. Extract exactly TWO DIFFERENT job titles that represent distinct career paths or specializations from the resume.
2. For each job title, extract 5-10 relevant technical skills that are SPECIFIC to that role.
3. The skills for each job title should be unique for that role.
4. If the resume strongly indicates only one career path, use transferable skills to create a complementary second role.
5. Read and analyze the ENTIRE resume text thoroughly before making your determination.

*** RESUME STARTS ***
${extractedText}
*** RESUME ENDS ***
`;

    const result = await model.generateContent(extractResumePrompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean up the response by removing any markdown code fences, if present.
    const clean = text
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    // Parse the JSON response.
    const parsed = JSON.parse(clean);

    // Validate the parsed result using our defined structure.
    validateJobsStructure(parsed);

    // Create a flattened array of all skills from both jobs (preserving duplicates).
    const parsedSkills = parsed.flatMap((job: { skills: string[] }) => job.skills);

    return NextResponse.json(
      {
        parsedJobs: parsed,
        parsedSkills: parsedSkills,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error extracting resume data:", error);
    return NextResponse.json(
      { error: "Failed to extract resume data", details: error.message },
      { status: 500 }
    );
  }
}
