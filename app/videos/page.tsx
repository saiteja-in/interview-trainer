import { getUserVideo } from "@/actions/videoupload";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModeToggle } from "../_components/ModeToggle";

export default async function VideosPage() {
    const videoResult = await getUserVideo();
    console.log("videoResult",videoResult)

    if (videoResult.failure) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">{videoResult.failure}</p>
            </div>
        );
    }

    const videos = videoResult.success;

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
            <h1 className="text-xl font-bold mb-4">Your Uploaded Videos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos?.map((video: { userId: string; id: string; videoUrl: string | null }) => (
                    <div key={video.id} className="w-full max-w-lg">
                        <video
                            className="w-full rounded-lg shadow-lg"
                            controls
                            playsInline
                            src={video.videoUrl || ""}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ))}
            </div>
        </div>
    );
}
