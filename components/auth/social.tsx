"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaSpinner } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import React from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { theme } = useTheme();
  const [signingIn, setSigningIn] = React.useState<"google" | "github" | null>(null);

  const onClick = async (provider: "google" | "github") => {
    setSigningIn(provider);
    await signIn(provider, {
      callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => onClick("google")}
        className="w-72 font-medium border-2 text-neutral-950 dark:text-neutral-50"
        disabled={signingIn !== null}
      >
        <div className="flex flex-row justify-center items-center gap-2 w-full">
          {signingIn === "google" ? (
            <>
              <FaSpinner className="h-4 w-4 animate-spin" />
              <span className="whitespace-nowrap">Redirecting...</span>
            </>
          ) : (
            <>
              <FcGoogle className="h-4 w-4" />
              <span className="whitespace-nowrap">Login With Google</span>
            </>
          )}
        </div>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => onClick("github")}
        className="w-72 font-medium border-2 text-neutral-950 dark:text-neutral-50"
        disabled={signingIn !== null}
      >
        <div className="flex flex-row justify-center items-center gap-2 w-full">
          {signingIn === "github" ? (
            <>
              <FaSpinner className="h-4 w-4 animate-spin" />
              <span className="whitespace-nowrap">Redirecting...</span>
            </>
          ) : (
            <>
              <FaGithub className="h-4 w-4" />
              <span className="whitespace-nowrap">Login With Github</span>
            </>
          )}
        </div>
      </Button>
    </div>
  );
};

export default Social;