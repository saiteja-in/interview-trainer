import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

export const runtime = 'edge';

// Create singleton instance of LLM with proper initialization check
let llmInstance: ChatGoogleGenerativeAI | null = null;

const getLLM = () => {
  if (!llmInstance && process.env.GOOGLE_API_KEY) {
    llmInstance = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      maxRetries: 2,
      maxConcurrency: 5,
      temperature: 0.05, // Very low temperature for consistency
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
  return llmInstance;
};

// Helper function to safely normalize URLs
const normalizeUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  
  try {
    // Remove any whitespace and trailing/leading characters
    url = url.trim();
    
    // Check if it looks like a URL already
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Convert @username format for Twitter
    if (url.startsWith('@')) {
      return `https://twitter.com/${url.substring(1)}`;
    }
    
    // Handle platform-specific URLs
    if (url.includes('github.com/')) {
      return url.startsWith('www.') ? `https://${url}` : `https://www.${url}`;
    }
    
    if (url.includes('linkedin.com/')) {
      return url.startsWith('www.') ? `https://${url}` : `https://www.${url}`; 
    }
    
    // Handle GitHub username conversion (simple username pattern)
    if (/^[a-zA-Z0-9][-\w]{0,38}$/.test(url) && !url.includes('.') && !url.includes('/')) {
      return `https://github.com/${url}`;
    }
    
    // Handle LinkedIn username conversion
    if (/^[a-zA-Z0-9][\w-]{0,29}$/.test(url) && !url.includes('.') && !url.includes('/')) {
      return `https://www.linkedin.com/in/${url}`;
    }
    
    // Default case - add https if it looks like a domain
    if (url.includes('.')) {
      return url.startsWith('www.') ? `https://${url}` : `https://${url}`;
    }
    
    return url;
  } catch (e) {
    console.error('URL normalization error:', e);
    return url; // Return original if normalization fails
  }
};

// Schema with improved validation and descriptions
const profileSchema = z.object({
  fullName: z.string().describe('Full name of the person'),
  shortAbout: z.string().describe('Brief professional tagline or title').optional(),
  location: z.string().describe('Location with format "City, Country" or "City, State, Country"'),
  email: z.string().describe('Email address').optional(),
  phone: z.string().describe('Phone number with country code if available').optional(),
  website: z.string().describe('Personal website or portfolio URL').optional(),
  linkedin: z.string().describe('LinkedIn profile URL or username').optional(),
  github: z.string().describe('GitHub profile URL or username').optional(),
  twitter: z.string().describe('Twitter/X username or URL').optional(),
  skills: z.array(z.string())
    .describe('Core technical and professional skills extracted from experience'),
  summary: z.string().describe('Professional summary highlighting expertise and career objectives'),
  
  workExperience: z.array(
    z.object({
      company: z.string().describe('Company or organization name'),
      title: z.string().describe('Job title or position'),
      startDate: z.string().describe('Start date in format YYYY-MM'),
      endDate: z.string().describe('End date in format YYYY-MM, or "Present"').optional(),
      location: z.string().describe('Job location (City, Country) or Remote/Hybrid').optional(),
      description: z.string().describe('Job description').optional(),
      highlights: z.array(z.string()).describe('Key achievements or responsibilities').optional(),
      techStack: z.array(z.string()).describe('Technologies used in this role').optional(),
    })
  ),
  
  education: z.array(
    z.object({
      institution: z.string().describe('School or university name'),
      degree: z.string().describe('Degree or certification obtained'),
      field: z.string().describe('Field of study or major').optional(),
      startDate: z.string().describe('Start year or date'),
      endDate: z.string().describe('End year or date, or "Present"'),
      gpa: z.string().describe('GPA or academic performance metric').optional(),
    })
  ).optional(),
  
  projects: z.array(
    z.object({
      name: z.string().describe('Project name'),
      description: z.string().describe('Project description'),
      link: z.string().describe('Project URL or repository').optional(),
      startDate: z.string().describe('Start date').optional(),
      endDate: z.string().describe('End date or "Present"').optional(),
      highlights: z.array(z.string()).describe('Key features or achievements').optional(),
      techStack: z.array(z.string()).describe('Technologies used').optional(),
    })
  ).optional(),
  
  certifications: z.array(
    z.object({
      name: z.string().describe('Certification name'),
      issuer: z.string().describe('Certification issuing organization'),
      date: z.string().describe('Date obtained').optional(),
    })
  ).optional(),
  
  achievements: z.array(z.string()).describe('Notable professional achievements').optional(),
  
  languages: z.array(
    z.object({
      language: z.string(),
      proficiency: z.string().describe('Proficiency level').optional(),
    })
  ).optional(),
  
  interests: z.array(z.string()).describe('Professional interests and hobbies').optional(),
});

// Shorter, optimized prompt for faster processing
const extractPrompt = PromptTemplate.fromTemplate(`
You are a resume parser. Extract information from the resume text into JSON.

INSTRUCTIONS:
1. Focus on extracting: name, location, contact details, skills, summary, work history, education
2. For missing info: infer skills from job descriptions, create a brief summary based on career path
3. Format all dates consistently as YYYY-MM
4. For links, extract just the username or URL without processing
5. Output ONLY valid JSON

RESUME TEXT:
{text}

Output ONLY valid JSON with no explanations or markdown.
`);

// Ultra-simplified fallback prompt for speed
const fallbackPrompt = PromptTemplate.fromTemplate(`
Create JSON from this resume:
{text}

Include at minimum: fullName, location, email, skills, summary, workExperience (company, title, dates), education.
Return ONLY valid JSON without explanations or markdown.
`);

// Helper to safely extract JSON from LLM responses
const extractJSON = (content: string): any => {
  try {
    // First try direct JSON parse
    return JSON.parse(content);
  } catch (e) {
    try {
      // Try to extract JSON from code blocks or text
      const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*})/);
      if (jsonMatch) {
        const jsonString = (jsonMatch[1] || jsonMatch[2]).trim();
        return JSON.parse(jsonString);
      }
    } catch (innerErr) {
      console.warn("Failed to extract JSON from content:", innerErr);
    }
    
    throw new Error("Could not extract valid JSON from response");
  }
};

// Helper to normalize URLs in the parsed profile
const normalizeProfileUrls = (profile: any): any => {
  try {
    // Clone to avoid modifying the original
    const normalized = { ...profile };
    
    // Normalize social/web links
    if (normalized.website) normalized.website = normalizeUrl(normalized.website);
    if (normalized.linkedin) normalized.linkedin = normalizeUrl(normalized.linkedin);
    if (normalized.github) normalized.github = normalizeUrl(normalized.github);
    if (normalized.twitter) normalized.twitter = normalizeUrl(normalized.twitter);
    
    // Fix project links if available
    if (normalized.projects?.length > 0) {
      normalized.projects = normalized.projects.map((project: any) => {
        const updatedProject = { ...project };
        if (updatedProject.link) updatedProject.link = normalizeUrl(updatedProject.link);
        return updatedProject;
      });
    }
    
    return normalized;
  } catch (e) {
    console.error("Error normalizing URLs:", e);
    return profile; // Return original if normalization fails
  }
};

export async function POST(req: NextRequest) {
  console.log("Processing resume extraction request");
  const startTime = Date.now();
  
  try {
    // Check LLM initialization
    const llm = getLLM();
    if (!llm) {
      return NextResponse.json(
        { error: 'AI model not initialized', success: false },
        { status: 500 }
      );
    }
    
    // Parse request efficiently with error handling
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

    // Choose processing strategy based on text size
    const textLength = text.length;
    console.log(`Processing resume with ${textLength} characters`);
    
    // For very large texts, truncate to improve processing speed
    const processedText = textLength > 8000 ? text.substring(0, 8000) : text;
    
    // Choose prompt based on text size
    const useQuickStrategy = textLength > 4000;
    const prompt = useQuickStrategy ? fallbackPrompt : extractPrompt;
    
    try {
      // Use AbortController for timeout control if supported
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
      const timeoutId = setTimeout(() => {
        controller?.abort();
      }, 14000); // 14 second timeout
      
      // Process with main strategy
      const chain = prompt.pipe(llm);
      const result = await chain.invoke({ 
        text: processedText,
        signal: controller?.signal
      });
      
      clearTimeout(timeoutId);
      
      // Extract and normalize JSON
      const parsedJson = extractJSON(result.content as string);
      const normalizedProfile = normalizeProfileUrls(parsedJson);
      
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      console.log(`Resume extraction completed in ${processingTime}s`);
      
      return NextResponse.json({ 
        profile: normalizedProfile,
        success: true,
        processingTime: `${processingTime}s`
      });
    } catch (error: any) {
      console.warn("Primary extraction failed:", error.message);
      
      // Ultra-fast fallback approach
      try {
        const fallbackChain = fallbackPrompt.pipe(llm);
        
        // For fallback, process even less text
        const truncatedText = text.substring(0, Math.min(text.length, 3000));
        
        const fallbackResult = await fallbackChain.invoke({ text: truncatedText });
        
        // Extract JSON from fallback response
        const fallbackParsed = extractJSON(fallbackResult.content as string);
        const normalizedFallback = normalizeProfileUrls(fallbackParsed);
        
        const endTime = Date.now();
        const processingTime = (endTime - startTime) / 1000;
        console.log(`Resume extraction (fallback) completed in ${processingTime}s`);
        
        return NextResponse.json({ 
          profile: normalizedFallback,
          success: true,
          method: 'fallback',
          processingTime: `${processingTime}s`
        });
      } catch (fallbackError: any) {
        throw new Error(`Failed to parse resume: ${fallbackError.message}`);
      }
    }
  } catch (err: any) {
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    console.error(`Error extracting profile (${processingTime}s):`, err);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract profile', 
        details: err instanceof Error ? err.message : 'Unknown error',
        success: false,
        processingTime: `${processingTime}s` 
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
