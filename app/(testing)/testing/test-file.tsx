'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ResumeParserClientProps = { 
  initialData: { resumeUrl: string; extractedText: string } 
};

const ResumeParserClient = ({ initialData }: ResumeParserClientProps) => {
  const [extractedProfile, setExtractedProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const handleExtractProfile = async () => {
    if (!initialData.extractedText) {
      setError("No resume text available to parse");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRawResponse(null);
    
    try {
      // Log that we're making the request
      console.log("Making API request to /api/extract-user-profile");
      console.log("Text length:", initialData.extractedText.length);
      
      // Make the API request
      const response = await fetch('/api/extract-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: initialData.extractedText }),
      });
      
      // Log the initial response
      console.log("API response received:", { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Not JSON, get the text and show it for debugging
        const textResponse = await response.text();
        console.error("Non-JSON response received:", textResponse.substring(0, 500));
        setRawResponse(textResponse.substring(0, 1000));
        throw new Error(`Received non-JSON response: ${response.status} ${response.statusText}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("API response data:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract profile');
      }

      if (data.rawContent) {
        console.log("Raw LLM output:", data.rawContent.substring(0, 500));
        setRawResponse(data.rawContent);
      }

      if (data.profile) {
        setExtractedProfile(data.profile);
        console.log('Extracted Profile:', data.profile);
      } else {
        throw new Error('No profile data in response');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while extracting the profile';
      setError(errorMessage);
      console.error('Error extracting profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Resume Parser</h1>
      
      {initialData.extractedText ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Resume Text Preview</h2>
          <div className="bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto">
            <p className="text-sm whitespace-pre-line">{initialData.extractedText.substring(0, 500)}...</p>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-amber-600">No resume text available. Please upload a resume first.</p>
        </div>
      )}
      
      <Button 
        onClick={handleExtractProfile} 
        disabled={isLoading || !initialData.extractedText}
        className="mb-6"
      >
        {isLoading ? 'Processing...' : 'Extract Profile from Resume'}
      </Button>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {rawResponse && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Raw Response (Debug)</h2>
          <Card className="p-4 bg-gray-50 overflow-x-auto">
            <pre className="text-xs whitespace-pre-wrap">{rawResponse}</pre>
          </Card>
        </div>
      )}
      
      {extractedProfile && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Extracted Profile</h2>
          <Card className="p-4 bg-gray-50 overflow-x-auto">
            <pre className="text-xs">{JSON.stringify(extractedProfile, null, 2)}</pre>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResumeParserClient;