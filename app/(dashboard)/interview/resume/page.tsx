import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getResumeData } from "@/actions/resume-jobs";
import type { ExtendedUser } from "@/schemas";
import ClientResumeInterviewPage from "./_components/client-resume-page";
import { getResumeTextUrl } from "@/actions/extracted-text-and-url";
import ResumeUploadContainer from "@/components/resume-analysis/resume-upload-container";
import ResumeDataDisplay from "@/components/resume-analysis/resume-data-display";

export default async function ResumeInterviewPage() {
  const user = (await currentUser()) as ExtendedUser | undefined;
  
  if (!user) {
    redirect("/sign-up");
  }
  
  // Get all resume-related data in parallel for improved performance
  const [resumeTextUrlResult, resumeDataResult] = await Promise.all([
    getResumeTextUrl(),
    getResumeData()
  ]);
  
  const { resumeUrl, extractedText } = resumeTextUrlResult;
  const resumeData = resumeDataResult.success && resumeDataResult.data ? resumeDataResult.data : null;
  
  // Determine which view to show based on available data
  const hasResumeJobData = resumeData?.resumeJobs && resumeData.resumeJobs.length > 0;
  const hasResumeFile = resumeUrl && extractedText;
  
  return (
    <div className="container space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Resume-Based Interview</h1>
      <p className="text-muted-foreground">
        Upload your resume to get personalized interview questions
      </p>

      {/* If no resume information is available, show the upload component */}
      {!hasResumeFile && <ResumeUploadContainer />}
      
      {/* If resume data exists, show the resume information and configuration options */}
      {hasResumeJobData && (
        <ResumeDataDisplay 
          resumeUrl={resumeUrl!} 
          resumeData={resumeData} 
        />
      )}
      
      {/* Only if we have resumeUrl/extractedText but no jobs, show the client component to handle extraction */}
      {hasResumeFile && !hasResumeJobData && (
        <ClientResumeInterviewPage 
          resumeUrl={resumeUrl} 
          extractedText={extractedText} 
          initialResumeData={resumeData} 
          showExtractButton={true}
        />
      )}
    </div>
  );
}