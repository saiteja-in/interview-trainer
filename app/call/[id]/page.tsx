import { currentUser } from "@/lib/auth";
import InterviewClient from "./interview-client";

type Props = {
  params: {
    id: string;
  };
};

export default async function InterviewPage({ params }: Props) {
  const user = await currentUser();
  
  return <InterviewClient params={params} user={user} />;
}
