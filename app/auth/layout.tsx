"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="container p-4">
        <Link 
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-fit"
          )} 
          href="/"
        >
          Home
        </Link>
      </nav>
      <main className="flex-1 flex items-center justify-center">
        <div className="container flex items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;