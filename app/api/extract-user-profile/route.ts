import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';

export const runtime = 'edge';

// Define environment variable type check
const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Singleton pattern with lazy initialization
let llmInstance: ChatGoogleGenerativeAI | null = null;

// Factory function with type safety
const getLLM = (): ChatGoogleGenerativeAI => {
  if (!llmInstance) {
    
    llmInstance = new ChatGoogleGenerativeAI({
      modelName: 'gemini-2.0-flash', // Latest model as of 2025-04
      maxOutputTokens: 4096,
      maxRetries: 2,
      temperature: 0.1, // Low temperature for consistent outputs
    });
  }
  return llmInstance;
};

// Comprehensive schema with improved validation
const resumeSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  shortBio: z.string().optional(),
  location: z.string().optional(),
  contactInfo: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
  
  links: z.object({
    website: z.string().url().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
  
  skills: z.array(z.string()).min(1, "At least one skill is expected"),
  
  summary: z.string(),
  
  workExperience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      technologies: z.array(z.string()).optional(),
    })
  ),
  
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      gpa: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    })
  ).optional(),
  
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      url: z.string().url().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      technologies: z.array(z.string()).optional(),
    })
  ).optional(),
  
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string().optional(),
      url: z.string().url().optional(),
      validUntil: z.string().optional(),
    })
  ).optional(),
  
  languages: z.array(
    z.object({
      language: z.string(),
      proficiency: z.string().optional(),
    })
  ).optional(),
  
  achievements: z.array(z.string()).optional(),
  
  interests: z.array(z.string()).optional(),
});

type ResumeProfile = z.infer<typeof resumeSchema>;

// URL normalization utility
const normalizeUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  
  try {
    url = url.trim();
    
    // Regular expressions for different URL patterns
    const twitterPattern = /^@?(\w{1,15})$/;
    const githubPattern = /^([a-zA-Z0-9](?:-?[a-zA-Z0-9]){0,38})$/;
    const linkedinPattern = /^([\w-\.]+)$/;
    
    // Twitter handle
    if (twitterPattern.test(url)) {
      return `https://twitter.com/${url.replace('@', '')}`;
    }
    
    // GitHub username (when not a full URL)
    if (githubPattern.test(url) && !url.includes('.') && !url.includes('/')) {
      return `https://github.com/${url}`;
    }
    
    // LinkedIn username (when not a full URL)
    if (linkedinPattern.test(url) && !url.includes('.') && !url.includes('/')) {
      return `https://www.linkedin.com/in/${url}`;
    }
    
    // Add https if missing but has domain
    if (url.includes('.') && !url.startsWith('http')) {
      return url.startsWith('www.') ? `https://${url}` : `https://www.${url}`;
    }
    
    return url;
  } catch (e) {
    console.error('URL normalization error:', e);
    return url;
  }
};

// Main extraction prompt
const extractionPrompt = PromptTemplate.fromTemplate(`
You are a professional resume parser. Extract structured information from the resume text into JSON.

REQUIREMENTS:
1. Extract person's details: name, contact info, location, skills, etc.
2. Parse all work experience and education history with accurate dates.
3. Format dates consistently as YYYY-MM.
4. Extract all skills, technologies, and specializations.
5. Create a concise professional summary.
6. For missing fields, leave as null or empty arrays [].

RESUME TEXT:
{text}

Output ONLY valid JSON with no markdown, comments, or explanations.
`);

// Fallback prompt (simpler and faster)
const fallbackPrompt = PromptTemplate.fromTemplate(`
Parse this resume into JSON with these fields:
- fullName: person's name
- summary: brief professional summary
- skills: array of skills
- workExperience: array of jobs with company, title, dates
- education: array of education with institution, degree, dates

RESUME:
{text}

Output ONLY valid JSON.
`);

// JSON extraction utility
const extractJSON = (content: string): any => {
  try {
    // Direct parsing first
    return JSON.parse(content);
  } catch (e) {
    try {
      // Extract from markdown code blocks if needed
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```|({[\s\S]*})/);
      if (jsonMatch) {
        const jsonString = (jsonMatch[1] || jsonMatch[2]).trim();
        return JSON.parse(jsonString);
      }
    } catch (innerErr) {
      console.warn("Failed to extract JSON from content");
    }
    
    throw new Error("Could not extract valid JSON from response");
  }
};

// Normalize all URLs in profile
const normalizeProfileUrls = (profile: any): any => {
  try {
    const normalized = JSON.parse(JSON.stringify(profile)); // Deep clone
    
    // Normalize links
    if (normalized.links) {
      if (normalized.links.website) normalized.links.website = normalizeUrl(normalized.links.website);
      if (normalized.links.linkedin) normalized.links.linkedin = normalizeUrl(normalized.links.linkedin);
      if (normalized.links.github) normalized.links.github = normalizeUrl(normalized.links.github);
      if (normalized.links.twitter) normalized.links.twitter = normalizeUrl(normalized.links.twitter);
    }
    
    // Normalize project URLs
    if (normalized.projects?.length > 0) {
      normalized.projects = normalized.projects.map((project: any) => {
        if (project.url) project.url = normalizeUrl(project.url);
        return project;
      });
    }
    
    // Normalize certification URLs
    if (normalized.certifications?.length > 0) {
      normalized.certifications = normalized.certifications.map((cert: any) => {
        if (cert.url) cert.url = normalizeUrl(cert.url);
        return cert;
      });
    }
    
    return normalized;
  } catch (e) {
    console.error("Error normalizing URLs:", e);
    return profile; // Return original on error
  }
};

// Process the resume with metrics
async function processResume(text: string): Promise<{ profile: any; metrics: any }> {
  const startTime = Date.now();
  const metrics: Record<string, any> = { textLength: text.length };
  
  // Truncate very large texts
  const processedText = text.length > 10000 ? text.substring(0, 10000) : text;
  metrics.truncated = text.length !== processedText.length;
  
  try {
    // Create chain with output parsing
    const llm = getLLM();
    const outputParser = new StringOutputParser();
    
    // Choose strategy based on text size
    const prompt = text.length > 5000 ? fallbackPrompt : extractionPrompt;
    metrics.strategy = text.length > 5000 ? 'fallback' : 'standard';
    
    // Create and execute the chain
    const chain = RunnableSequence.from([
      prompt,
      llm,
      outputParser,
    ]);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      metrics.timedOut = true;
    }, 13000); // 13 second timeout
    
    const result = await chain.invoke(
      { text: processedText },
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    // Parse the JSON result
    const parsedJson = extractJSON(result);
    const normalizedProfile = normalizeProfileUrls(parsedJson);
    
    // Validate against schema if possible
    let validatedProfile = normalizedProfile;
    try {
      validatedProfile = resumeSchema.parse(normalizedProfile);
      metrics.validated = true;
    } catch (validationError) {
      console.warn("Schema validation failed:", validationError);
      metrics.validated = false;
    }
    
    metrics.processingTime = (Date.now() - startTime) / 1000;
    return { profile: validatedProfile, metrics };
    
  } catch (error: any) {
    console.warn("Primary extraction failed:", error?.message);
    metrics.primaryFailed = true;
    
    try {
      // Ultra-fallback approach with minimal text
      const llm = getLLM();
      const outputParser = new StringOutputParser();
      
      const minimalChain = RunnableSequence.from([
        fallbackPrompt,
        llm,
        outputParser,
      ]);
      
      // For fallback, process even less text
      const truncatedText = text.substring(0, Math.min(text.length, 3000));
      metrics.fallbackTextLength = truncatedText.length;
      
      const fallbackResult = await minimalChain.invoke({ text: truncatedText });
      const fallbackParsed = extractJSON(fallbackResult);
      const normalizedFallback = normalizeProfileUrls(fallbackParsed);
      
      metrics.processingTime = (Date.now() - startTime) / 1000;
      metrics.method = 'ultra-fallback';
      
      return { profile: normalizedFallback, metrics };
    } catch (fallbackError: any) {
      throw new Error(`Failed to parse resume: ${fallbackError?.message}`);
    }
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log("Processing resume extraction request");
  const startTime = Date.now();
  
  try {
    // Check environment variables before processing
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured', success: false },
        { status: 500 }
      );
    }
    
    // Parse request with validation
    let text: string;
    try {
      const body = await req.json();
      text = body.text;
      
      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'No resume text provided or invalid format', success: false },
          { status: 400 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request format', success: false },
        { status: 400 }
      );
    }
    
    // Process the resume
    const { profile, metrics } = await processResume(text);
    
    // Build response with metrics
    const totalTime = (Date.now() - startTime) / 1000;
    
    return NextResponse.json({
      profile,
      success: true,
      metrics: {
        ...metrics,
        totalTime: `${totalTime}s`,
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (err: any) {
    const totalTime = (Date.now() - startTime) / 1000;
    
    console.error(`Error extracting profile (${totalTime}s):`, err);
    
    return NextResponse.json(
      {
        error: 'Failed to extract profile',
        details: err instanceof Error ? err.message : 'Unknown error',
        success: false,
        processingTime: `${totalTime}s`
      },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// import { PromptTemplate } from '@langchain/core/prompts';
// import { z } from 'zod';

// export const runtime = 'edge';

// // 1. Initialize the LLM with optimized settings
// const llm = new ChatGoogleGenerativeAI({
//   model: 'gemini-2.0-flash',
//   maxRetries: 3,
//   temperature: 0.1, // Lower temperature for more consistent outputs
//   apiKey: process.env.GOOGLE_API_KEY,
// });

// // 2. Simplified Zod schema with better validation
// const profileSchema = z.object({
//   fullName: z.string().describe('Full name of the person'),
//   shortAbout: z.string().describe('Brief professional tagline or title').optional(),
//   location: z.string().describe('Location with format "City, Country" or "City, State, Country"'),
//   email: z.string().describe('Email address').optional(),
//   phone: z.string().describe('Phone number with country code if available').optional(),
//   website: z.string().describe('Personal website or portfolio URL').optional(),
//   linkedin: z.string().describe('LinkedIn profile URL or username').optional(),
//   github: z.string().describe('GitHub profile URL or username').optional(),
//   twitter: z.string().describe('Twitter/X username or URL').optional(),
//   skills: z.array(z.string())
//     .describe('Core technical and professional skills extracted from experience'),
//   summary: z.string().describe('Professional summary highlighting expertise and career objectives'),
  
//   workExperience: z.array(
//     z.object({
//       company: z.string().describe('Company or organization name'),
//       title: z.string().describe('Job title or position'),
//       startDate: z.string().describe('Start date in format YYYY-MM or YYYY-MM-DD'),
//       endDate: z.string().describe('End date in format YYYY-MM or YYYY-MM-DD, or "Present" for current positions').optional(),
//       location: z.string().describe('Job location (City, Country) or Remote/Hybrid').optional(),
//       description: z.string().describe('Job description').optional(),
//       highlights: z.array(z.string()).describe('Key achievements or responsibilities').optional(),
//       techStack: z.array(z.string()).describe('Technologies used in this role').optional(),
//     })
//   ),
  
//   education: z.array(
//     z.object({
//       institution: z.string().describe('School or university name'),
//       degree: z.string().describe('Degree or certification obtained'),
//       field: z.string().describe('Field of study or major').optional(),
//       startDate: z.string().describe('Start year or date'),
//       endDate: z.string().describe('End year or date, or "Present" for ongoing education'),
//       gpa: z.string().describe('GPA or academic performance metric').optional(),
//     })
//   ).optional(),
  
//   projects: z.array(
//     z.object({
//       name: z.string().describe('Project name'),
//       description: z.string().describe('Project description'),
//       link: z.string().describe('Project URL or repository').optional(),
//       startDate: z.string().describe('Start date').optional(),
//       endDate: z.string().describe('End date or "Present"').optional(),
//       highlights: z.array(z.string()).describe('Key features or achievements').optional(),
//       techStack: z.array(z.string()).describe('Technologies used').optional(),
//     })
//   ).optional(),
  
//   certifications: z.array(
//     z.object({
//       name: z.string().describe('Certification name'),
//       issuer: z.string().describe('Certification issuing organization'),
//       date: z.string().describe('Date obtained').optional(),
//     })
//   ).optional(),
  
//   achievements: z.array(z.string()).describe('Notable professional achievements').optional(),
  
//   languages: z.array(
//     z.object({
//       language: z.string(),
//       proficiency: z.string().describe('Proficiency level').optional(),
//     })
//   ).optional(),
  
//   interests: z.array(z.string()).describe('Professional interests and hobbies').optional(),
// });

// // 3. More robust prompt with error prevention
// const extractPrompt = PromptTemplate.fromTemplate(`
// You are an expert resume parser. Extract structured information from the resume text into a JSON object.

// ## INSTRUCTIONS:

// 1. Analyze the resume text carefully
// 2. Extract all relevant information according to the schema
// 3. For missing information:
//    - Infer skills from job descriptions and titles
//    - Generate a professional summary based on career trajectory
//    - Use consistent date formatting (YYYY-MM preferred)
// 4. For missing sections, use empty arrays [] or null values
// 5. Return ONLY valid JSON that matches the schema exactly

// ## SCHEMA:
// ${profileSchema.toString()}

// ## RESUME TEXT:
// {text}

// Return ONLY the JSON object with no explanations, markdown, or additional text.
// `);

// export async function POST(req: NextRequest) {
//   console.log("Processing resume extraction request");
  
//   try {
//     // Parse request with better error handling
//     const body = await req.json().catch(e => {
//       console.error("Failed to parse request body:", e);
//       return {};
//     });
    
//     const { text } = body;
    
//     if (!text || typeof text !== 'string') {
//       console.warn("Invalid request: No text provided or text is not a string");
//       return NextResponse.json(
//         { error: 'No resume text provided or invalid format', success: false },
//         { status: 400 }
//       );
//     }

//     // Try structured output approach
//     try {
//       const chain = extractPrompt.pipe(llm);
//       const result = await chain.invoke({ text });
//       const content = result.content as string;
      
//       // Extract JSON from response
//       let jsonString = content;
//       const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*})/);
//       if (jsonMatch) {
//         jsonString = jsonMatch[1] || jsonMatch[2];
//       }
      
//       // Parse and validate
//       const parsedJson = JSON.parse(jsonString);
      
//       console.log('Successfully extracted resume profile');
      
//       return NextResponse.json({ 
//         profile: parsedJson,
//         success: true
//       });
//     } catch (error) {
//       console.error("Extraction failed:", error);
      
//       // Fallback to simpler approach
//       try {
//         // Use a simpler prompt as fallback
//         const fallbackPrompt = PromptTemplate.fromTemplate(`
//         Extract resume information into JSON format.
//         Include: fullName, shortAbout, location, email, phone, skills, summary, workExperience, education.
//         Format dates as YYYY-MM.
//         Return ONLY valid JSON.
        
//         RESUME:
//         {text}
//         `);
        
//         const fallbackChain = fallbackPrompt.pipe(llm);
//         const fallbackResult = await fallbackChain.invoke({ text });
//         const fallbackContent = fallbackResult.content as string;
        
//         // Extract JSON
//         let fallbackJsonString = fallbackContent;
//         const fallbackJsonMatch = fallbackContent.match(/```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*})/);
//         if (fallbackJsonMatch) {
//           fallbackJsonString = fallbackJsonMatch[1] || fallbackJsonMatch[2];
//         }
        
//         const fallbackParsed = JSON.parse(fallbackJsonString);
        
//         console.log('Successfully extracted resume using fallback method');
        
//         return NextResponse.json({ 
//           profile: fallbackParsed,
//           success: true,
//           method: 'fallback'
//         });
//       } catch (fallbackError) {
//         throw new Error(`Failed to parse resume with multiple approaches: ${fallbackError}`);
//       }
//     }
//   } catch (err: any) {
//     console.error('Error extracting user profile:', err);
    
//     return NextResponse.json(
//       { 
//         error: 'Failed to extract profile', 
//         details: err instanceof Error ? err.message : 'Unknown error',
//         success: false 
//       },
//       { status: 500 }
//     );
//   }
// }



// app/api/extract-user-profile/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// import { PromptTemplate } from '@langchain/core/prompts';
// import { z } from 'zod';

// export const runtime = 'edge';

// // 1. Initialize the LLM
// const llm = new ChatGoogleGenerativeAI({
//   model: 'gemini-2.0-flash',
//   maxRetries: 2,
// });

// // 2. Define a Zod schema matching full resume profile details
// const profileSchema = z.object({
//   personal_details: z.object({
//     fullName: z.string(),
//     mail: z.string().optional(),
//     phone: z.string().optional(),
//     location: z.string().optional(),
//     website: z.string().optional(),
//     linkedIn:z.string().optional(),
//     github: z.string().optional(),
//     summary: z.string().optional(),
//   }),
//   experience: z.array(
//     z.object({
//       company: z.string(),
//       position: z.string(),
//       startDate: z.string(),
//       endDate: z.string(),
//       summary: z.string().optional(),
//       techStack: z.array(z.string()).optional(),
//       highlights: z.array(z.string()).optional(),
//     })
//   ).optional(),
//   education: z.array(
//     z.object({
//       institution: z.string(),
//       area: z.string(),
//       studyType: z.string(),
//       startDate: z.string(),
//       endDate: z.string(),
//       gpa: z.string().optional(),
//     })
//   ).optional(),
//   skills: z.array(
//     z.object({
//       name: z.string(),
//       level: z.string().optional(),
//       keywords: z.array(z.string()),
//     })
//   ).optional(),
//   projects: z.array(
//     z.object({
//       name: z.string(),
//       description: z.string(),
//       startDate: z.string().optional(),
//       endDate: z.string().optional(),
//       highlights: z.array(z.string()).optional(),
//     })
//   ).optional(),
//   codingProfiles: z.array(
//     z.object({
//       platform: z.string().optional(),
//       username: z.string().optional(),
//     })
//   ).optional(),
//   certifications: z.array(
//     z.object({
//       name: z.string(),
//       issuer: z.string(),
//       date: z.string().optional(),
//     })
//   ).optional(),
//   achievements: z.array(z.string()).optional(),
//   hobbies: z.array(z.string()).optional(),
// });

// // 3. Build a prompt instructing the model to output exactly that schema
// const extractPrompt = PromptTemplate.fromTemplate(`
// You are a resume parsing assistant. Extract the following sections exactly as JSON matching this Zod schema:

// ${profileSchema.toString()}

// Resume Text:
// {text}

// Return only valid JSON matching the schema.`);

// export async function POST(req: NextRequest) {
//   console.log("console comes here");
//   try {
//     const { text } = await req.json();
//     if (!text) {
//       return NextResponse.json(
//         { error: 'No resume text provided' },
//         { status: 400 }
//       );
//     }

//     // 4. Build and run the chain
//     const chain = extractPrompt.pipe(
//       llm.withStructuredOutput(profileSchema)
//     );
//     const parsed = await chain.invoke({ text });

//     // 5. Log for now; later persist to database
//     console.log(
//       '🔍 Extracted Full Resume Profile:',
//       JSON.stringify(parsed, null, 2)
//     );

//     // 6. Return parsed object
//     return NextResponse.json({ profile: parsed });
//   } catch (err: any) {
//     console.error('❌ Error extracting user profile:', err);
//     return NextResponse.json(
//       { error: 'Failed to extract profile', details: err.message },
//       { status: 500 }
//     );
//   }
// }
