import Link from "next/link";
import VideoUploadForm from "./_components/VideoUploadForm";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "../_components/ModeToggle";

export default function Page() {
  return (
<div className="flex flex-col items-center min-h-screen p-4">
       <nav className="container py-4 px-10 flex justify-between ">
        <Link
          className={cn(buttonVariants({ variant: "outline-solid" }), "w-fit")}
          href="/"
          >
          Home
        </Link>
        <ModeToggle />    
      </nav>
        <div className="flex justify-center items-center min-h-screen p-4 pb-20">
      <VideoUploadForm />
    </div>
          </div>
  );
}