"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Call from "@/components/call/call";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { getPopularInterviewSession } from "@/actions/popular-interviews";
import { getBehavioralInterviewSession } from "@/actions/behavioral-interviews";

type Props = {
  params: {
    id: string;
  };
  user: any;
};

type PopupProps = {
  title: string;
  description: string;
  image: string;
};

function PopupLoader() {
  return (
    <div className="bg-white rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] justify-center items-center rounded-lg border-2 border-b-4 border-r-4 border-black font-bold transition-all md:block dark:border-white">
        <div className="relative flex flex-col items-center justify-center h-full">
          <LoaderWithText />
        </div>
      </div>
    </div>
  );
}

function PopUpMessage({ title, description, image }: PopupProps) {
  return (
    <div className="bg-white rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] content-center rounded-lg border-2 border-b-4 border-r-4 border-black font-bold transition-all md:block dark:border-white">
        <div className="flex flex-col items-center justify-center my-auto">
          <div className="mb-4 w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">📱</span>
          </div>
          <h1 className="text-md font-medium mb-2">{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

function InterviewClient({ params, user }: Props) {
  const [interviewSession, setInterviewSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewNotFound, setInterviewNotFound] = useState(false);

  // Check if interview session is available for starting
  // Allow sessions that are not completed or explicitly marked as unavailable
  const isSessionAvailable =
    interviewSession &&
    interviewSession.status !== "COMPLETED" &&
    interviewSession.status !== "CANCELLED";

  console.log("isSessionAvailable:", isSessionAvailable);
  console.log("interviewSession exists:", !!interviewSession);
  console.log("session status:", interviewSession?.status);

  useEffect(() => {
    const fetchInterviewSession = async () => {
      setIsLoading(true);
      try {
        // Try to fetch as popular interview first
        let result = await getPopularInterviewSession(params.id);
        console.log("Popular interview result", result);

        if (result.success && result.data) {
          console.log("Popular interview session data:", result.data);
          console.log("Session status:", result.data.status);
          setInterviewSession({ ...result.data, type: "popular" });
          document.title = `Interview Session - ${
            result.data.popularInterview?.title || "InterviewAI"
          }`;
        } else {
          // If not found as popular interview, try behavioral interview
          console.log("Trying behavioral interview...");
          const behavioralResult = await getBehavioralInterviewSession(
            params.id
          );
          console.log("Behavioral interview result", behavioralResult);

          if (behavioralResult.success && behavioralResult.data) {
            console.log(
              "Behavioral interview session data:",
              behavioralResult.data
            );
            console.log("Session status:", behavioralResult.data.status);
            setInterviewSession({
              ...behavioralResult.data,
              type: "behavioral",
            });
            document.title = `Interview Session - ${
              behavioralResult.data.behavioralInterview?.title ||
              "Behavioral Interview"
            }`;
          } else {
            console.log(
              "No data found in either interview type:",
              behavioralResult.error
            );
            setInterviewNotFound(true);
          }
        }
      } catch (error) {
        console.error(error);
        setInterviewNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewSession();
  }, [params.id]);

  return (
    <div>
      <div className="hidden md:block p-8 mx-auto form-container">
        {isLoading ? (
          <PopupLoader />
        ) : interviewNotFound ? (
          <PopUpMessage
            title="Invalid URL"
            description="The interview link you're trying to access is invalid. Please check the URL and try again."
            image="/invalid-url.png"
          />
        ) : !isSessionAvailable ? (
          <PopUpMessage
            title="Interview Is Unavailable"
            description="This interview session is no longer active. Please contact support for more information."
            image="/closed.png"
          />
        ) : (
          <Call interviewSession={interviewSession} user={user} />
        )}
      </div>
      <div className="md:hidden flex flex-col items-center md:h-[0px] justify-center my-auto">
        <div className="mt-48 px-3">
          <p className="text-center my-5 text-md font-semibold">
            {interviewSession?.type === "behavioral"
              ? interviewSession?.behavioralInterview?.title
              : interviewSession?.popularInterview?.title}
          </p>
          <p className="text-center text-gray-600 my-5">
            Please use a PC to respond to the interview. Apologies for any
            inconvenience caused.
          </p>
        </div>
      </div>
    </div>
  );
}

export default InterviewClient;
