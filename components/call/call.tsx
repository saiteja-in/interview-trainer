"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Image from "next/image";
import axios from "axios";
import { RetellWebClient } from "retell-client-js-sdk";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { toast } from "sonner";
import { isLightColor } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const webClient = new RetellWebClient();

type InterviewSessionProps = {
  interviewSession: any;
  user: any;
};

type registerCallResponseType = {
  data: {
    registerCallResponse: {
      call_id: string;
      access_token: string;
    };
  };
};

type transcriptType = {
  role: string;
  content: string;
};

function Call({ interviewSession, user }: InterviewSessionProps) {
  const [lastInterviewerResponse, setLastInterviewerResponse] =
    useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [Loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const userName = user?.name || user?.email || "Anonymous User";
  const [callId, setCallId] = useState<string>("");
  const [interviewerImg, setInterviewerImg] = useState("");
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>("30");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");
  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);

  // Extract interview data from session with proper null checks
  const interview = {
    id: interviewSession?.id || "",
    name: interviewSession?.popularInterview?.title || "Interview Session",
    description:
      interviewSession?.popularInterview?.description ||
      "AI-powered interview session",
    time_duration: interviewSession?.duration?.toString() || "30",
    theme_color: "#4F46E5",
    is_anonymous: false,
    interviewer_id: interviewSession?.interviewerId || null,
    objective: `Conduct a ${
      interviewSession?.popularInterview?.category || "general"
    } interview focusing on ${
      interviewSession?.popularInterview?.title || "various topics"
    }`,
    questions:
      interviewSession?.questions?.map((question: string, index: number) => ({
        question: question,
      })) ||
      Array.from({ length: interviewSession?.questionCount || 5 }, (_, i) => ({
        question: `Tell me about your experience with ${
          interviewSession?.popularInterview?.category || "this field"
        } and how you would approach this type of challenge.`,
      })),
  };

  // Early return if no interview session data
  if (!interviewSession) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p>Loading interview session...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (lastUserResponseRef.current) {
      const { current } = lastUserResponseRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [lastUserResponse]);

  useEffect(() => {
    let intervalId: any;
    if (isCalling) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    setCurrentTimeDuration(String(Math.floor(time / 100)));
    if (Number(currentTimeDuration) == Number(interviewTimeDuration) * 60) {
      webClient.stopCall();
      setIsEnded(true);
    }
    return () => clearInterval(intervalId);
  }, [isCalling, time, currentTimeDuration, interviewTimeDuration]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    webClient.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsEnded(true);
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      setActiveTurn("user");
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};
        transcripts.forEach((transcript) => {
          roleContents[transcript?.role] = transcript?.content;
        });
        setLastInterviewerResponse(roleContents["agent"]);
        setLastUserResponse(roleContents["user"]);
      }
    });

    return () => {
      webClient.removeAllListeners();
    };
  }, []);

  const onEndCallClick = async () => {
    if (isStarted) {
      setLoading(true);
      webClient.stopCall();
      setIsEnded(true);
      setLoading(false);
    } else {
      setIsEnded(true);
    }
  };

  const startConversation = async () => {
    console.log("interview data", interview);
    const data = {
      mins: interview?.time_duration,
      objective: interview?.objective,
      questions: interview?.questions
        .map((q: { question: string }) => q.question)
        .join(", "),
      name: userName || "not provided",
    };
    console.log("data", data);
    console.log("Generated questions:", interview?.questions);

    setLoading(true);

    try {
      const registerCallResponse: registerCallResponseType = await axios.post(
        "/api/register-call",
        { dynamic_data: data, interviewer_id: interview?.interviewer_id }
      );

      if (registerCallResponse.data.registerCallResponse.access_token) {
        await webClient
          .startCall({
            accessToken:
              registerCallResponse.data.registerCallResponse.access_token,
          })
          .catch(console.error);

        setIsCalling(true);
        setIsStarted(true);
        setCallId(registerCallResponse?.data?.registerCallResponse?.call_id);
      } else {
        console.log("Failed to register call");
        toast.error("Failed to start interview call");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start interview");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
    }
  }, [interview]);

  useEffect(() => {
    // Set default interviewer image
    setInterviewerImg("/interviewer-avatar.png");
  }, [interview.interviewer_id]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-md md:w-[80%] w-[90%]">
        <Card className="h-[88vh] rounded-lg border-2 border-b-4 border-r-4 border-black text-xl font-bold transition-all md:block dark:border-white">
          <div>
            <div className="m-4 h-[15px] rounded-lg border-[1px] border-black">
              <div
                className="bg-indigo-600 h-[15px] rounded-lg"
                style={{
                  width: isEnded
                    ? "100%"
                    : `${
                        (Number(currentTimeDuration) /
                          (Number(interviewTimeDuration) * 60)) *
                        100
                      }%`,
                }}
              />
            </div>
            <CardHeader className="items-center p-1">
              {!isEnded && (
                <CardTitle className="flex flex-row items-center text-lg md:text-xl font-bold mb-2">
                  {interview?.name}
                </CardTitle>
              )}
              {!isEnded && (
                <div className="flex mt-2 flex-row">
                  <AlarmClockIcon
                    className="text-indigo-600 h-[1rem] w-[1rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 mr-2 font-bold"
                    style={{ color: interview.theme_color }}
                  />
                  <div className="text-sm font-normal">
                    Expected duration:{" "}
                    <span
                      className="font-bold"
                      style={{ color: interview.theme_color }}
                    >
                      {interviewTimeDuration} mins{" "}
                    </span>
                    or less
                  </div>
                </div>
              )}
            </CardHeader>

            {!isStarted && !isEnded && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2 border border-indigo-200 rounded-md p-2 m-2 bg-slate-50">
                <div>
                  <div className="p-2 font-normal text-sm mb-4 whitespace-pre-line">
                    {interview?.description}
                    <p className="font-bold text-sm">
                      {"\n"}
                      Ensure your volume is up and grant microphone access when
                      prompted. Additionally, please make sure you are in a
                      quiet environment.
                      {"\n\n"}
                      Note: Tab switching will be recorded.
                    </p>
                  </div>
                </div>
                <div className="w-[80%] flex flex-row mx-auto justify-center items-center align-middle">
                  <Button
                    className="min-w-20 h-10 rounded-lg flex flex-row justify-center mb-8"
                    style={{
                      backgroundColor: interview.theme_color ?? "#4F46E5",
                      color: isLightColor(interview.theme_color ?? "#4F46E5")
                        ? "black"
                        : "white",
                    }}
                    disabled={Loading}
                    onClick={startConversation}
                  >
                    {!Loading ? "Start Interview" : <MiniLoader />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        className="bg-white border ml-2 text-black min-w-15 h-10 rounded-lg flex flex-row justify-center mb-8"
                        style={{ borderColor: interview.theme_color }}
                        disabled={Loading}
                      >
                        Exit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-indigo-600 hover:bg-indigo-800"
                          onClick={async () => {
                            await onEndCallClick();
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {isStarted && !isEnded && (
              <div className="flex flex-row p-2 grow">
                <div className="border-x-2 border-grey w-[50%] my-auto min-h-[70%]">
                  <div className="flex flex-col justify-evenly">
                    <div className="text-[22px] w-[80%] md:text-[26px] mt-4 min-h-[250px] mx-auto px-6">
                      {lastInterviewerResponse}
                    </div>
                    <div className="flex flex-col mx-auto justify-center items-center align-middle">
                      <div
                        className={`w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-semibold mx-auto my-auto ${
                          activeTurn === "agent"
                            ? `border-4 border-[${interview.theme_color}]`
                            : ""
                        }`}
                      >
                        AI
                      </div>
                      <div className="font-semibold">Interviewer</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-evenly w-[50%]">
                  <div
                    ref={lastUserResponseRef}
                    className="text-[22px] w-[80%] md:text-[26px] mt-4 mx-auto h-[250px] px-6 overflow-y-auto"
                  >
                    {lastUserResponse}
                  </div>
                  <div className="flex flex-col mx-auto justify-center items-center align-middle">
                    <div
                      className={`w-[120px] h-[120px] rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-4xl font-semibold mx-auto my-auto ${
                        activeTurn === "user"
                          ? `border-4 border-[${interview.theme_color}]`
                          : ""
                      }`}
                    >
                      👤
                    </div>
                    <div className="font-semibold">You</div>
                  </div>
                </div>
              </div>
            )}

            {isStarted && !isEnded && (
              <div className="items-center p-2">
                <AlertDialog>
                  <AlertDialogTrigger className="w-full">
                    <Button
                      className="bg-white text-black border border-indigo-600 h-10 mx-auto flex flex-row justify-center mb-8"
                      disabled={Loading}
                    >
                      End Interview{" "}
                      <XCircleIcon className="h-[1.5rem] ml-2 w-[1.5rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-red" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This action will end the
                        call.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-indigo-600 hover:bg-indigo-800"
                        onClick={async () => {
                          await onEndCallClick();
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {isEnded && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2 border border-indigo-200 rounded-md p-2 m-2 bg-slate-50 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
                    <p className="text-lg font-semibold text-center">
                      {isStarted
                        ? "Thank you for taking the time to participate in this interview"
                        : "Thank you very much for considering."}
                    </p>
                    <p className="text-center">
                      {"\n"}You can close this tab now.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Call;
