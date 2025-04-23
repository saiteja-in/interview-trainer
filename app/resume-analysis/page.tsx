import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getResumeTextUrl } from "@/actions/extracted-text-and-url";
import ResumeAnalysisClient from "./ResumeAnalysisClient";

export default async function ResumeAnalysisPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-up");
  }
  
  // Get user's resume data from the database
  const { resumeUrl, extractedText } = await getResumeTextUrl();
  
  return (
    <div className="bg-background text-gray-800 dark:text-gray-100 min-h-screen py-4 px-2">
      <ResumeAnalysisClient 
        initialResumeUrl={resumeUrl} 
        initialExtractedText={extractedText} 
      />
    </div>
  );
}