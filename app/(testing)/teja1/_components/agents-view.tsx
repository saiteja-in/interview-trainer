"use client";
import { ErrorState } from "@/components/error-state";
import { Loader } from "@/components/loading-state";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const AgentsView = () => {
  const trpc = useTRPC();
  const { data, isLoading, isError } = useQuery(
    trpc.agents.getMany.queryOptions()
  );
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }
  if (isError) {
    return (<div>
        <ErrorState title="Failed to load agents" description="Something went wrong" />
    </div>)
  }
  return <div>{JSON.stringify(data, null, 2)}</div>;
};