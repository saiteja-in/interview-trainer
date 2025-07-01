import { getResumeTextUrl } from '@/actions/extracted-text-and-url';
import { currentUser } from '@/lib/auth';
import { ExtendedUser } from '@/schemas';
import { redirect } from 'next/navigation';
import React from 'react';
import ResumeParserClient from './test-file';

const ResumeParserPage = async () => {
  const user = (await currentUser()) as ExtendedUser | undefined;
      
  if (!user) {
    redirect("/sign-up");
  }
      
  // Get all resume-related data in parallel for improved performance
  const [resumeTextUrlResult] = await Promise.all([
    getResumeTextUrl(),
  ]);
  
  return (
    <ResumeParserClient
      initialData={{
        resumeUrl: resumeTextUrlResult.resumeUrl ?? '',
        extractedText: resumeTextUrlResult.extractedText ?? '',
      }}
    />
  );
};

export default ResumeParserPage;