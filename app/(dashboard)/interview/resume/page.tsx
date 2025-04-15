import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getResumeData } from "@/actions/resume-jobs";
import type { ExtendedUser } from "@/schemas";
import ClientResumeInterviewPage from "./_components/client-resume-page";

export default async function ResumeInterviewPage() {
  const user = (await currentUser()) as ExtendedUser | undefined;
  if (!user) {
    redirect("/sign-up");
  }
  const result = await getResumeData();
  const resumeData = result.success && result.data ? result.data : null;

  return <ClientResumeInterviewPage user={user} initialResumeData={resumeData} />;
}
