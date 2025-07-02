"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

// Common interfaces moved to a shared location
export interface JobRequirement {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  isCustom?: boolean;
}

interface JobSelectionProps {
  selectedJob: JobRequirement | null;
  setSelectedJob: (job: JobRequirement | null) => void;
  inUploadMode?: boolean;
  // New prop to determine if component is alongside PDF
  isWithPdf?: boolean;
}

interface JobCardProps {
  job: JobRequirement;
  isSelected: boolean;
  onSelect: (job: JobRequirement) => void;
  isCompact?: boolean;
}

// Shared job descriptions that can be imported from both components
export const defaultJobDescriptions: JobRequirement[] = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Solutions Ltd.",
    description:
      "We are looking for a passionate Frontend Developer with a strong understanding of modern frontend technologies. The ideal candidate should be proficient in JavaScript, React.js, and Next.js, with experience in building dynamic and high-performance web applications. Familiarity with CSS frameworks like Tailwind CSS or Bootstrap is essential, along with a solid grasp of state management tools such as Redux or Zustand. Responsibilities include developing and maintaining scalable UI components, optimizing frontend performance, debugging issues, and ensuring cross-browser compatibility. Exposure to server-side rendering (SSR), static site generation (SSG), and client-side rendering (CSR) is beneficial. Collaboration with designers, backend developers, and participation in code reviews, technical discussions, and UI/UX brainstorming sessions is expected.",
    requirements: [
      "Strong proficiency in JavaScript, React.js, and Next.js",
      "Experience with Tailwind CSS or Bootstrap for responsive UI design",
      "Knowledge of state management tools (Redux, Zustand, or Context API)",
      "Familiarity with SSR, SSG, and CSR techniques",
      "Understanding of API integration and RESTful services",
      "Ability to debug, test, and optimize frontend performance",
      "Experience with version control systems like Git",
      "Strong problem-solving skills and attention to detail",
    ],
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "CloudTech Innovations",
    description:
      "We are seeking a highly skilled Backend Developer who specializes in building scalable and secure backend systems. The candidate should have experience with Node.js and Express.js and be comfortable working with databases such as MongoDB, PostgreSQL, or MySQL. The role involves designing and developing RESTful APIs, optimizing database queries, implementing authentication mechanisms like JWT and OAuth, and ensuring system security and performance. Familiarity with cloud services like AWS or GCP is a plus. The ideal candidate should also have experience with microservices architecture, caching strategies, and message queues for efficient backend operations. Collaboration with frontend teams and DevOps engineers to deploy and maintain applications is expected.",
    requirements: [
      "Proficiency in Node.js and Express.js",
      "Experience with databases like MongoDB, PostgreSQL, or MySQL",
      "Knowledge of ORM tools (Prisma, Drizzle, Sequelize, or Mongoose)",
      "Understanding of authentication (JWT, OAuth) and security best practices",
      "Familiarity with RESTful API design and GraphQL",
      "Experience with cloud platforms (AWS, GCP) and containerization (Docker)",
      "Knowledge of caching strategies (Redis, Memcached) and message queues (RabbitMQ, Kafka)",
      "Ability to write efficient, scalable, and maintainable backend code",
    ],
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "NextGen Web Solutions",
    description:
      "We are looking for a versatile Web Developer who is proficient in both frontend and backend development. The candidate should have experience working with HTML, CSS, JavaScript, and modern frameworks like React.js or Vue.js. Strong backend knowledge, including Node.js and Express.js, is preferred. Responsibilities include developing and maintaining interactive web applications, optimizing website performance, ensuring responsiveness across devices, and integrating third-party APIs. The ideal candidate should be comfortable with database management and have a good understanding of web security principles. Strong collaboration skills are essential, as the role requires working closely with designers, product managers, and backend developers to deliver seamless user experiences.",
    requirements: [
      "Proficiency in HTML, CSS, and JavaScript",
      "Experience with frontend frameworks like React.js or Vue.js",
      "Basic to intermediate knowledge of backend technologies (Node.js, Express.js)",
      "Familiarity with databases such as MongoDB, MySQL, or PostgreSQL",
      "Ability to integrate APIs and third-party services",
      "Understanding of web performance optimization and SEO best practices",
      "Experience with Git for version control and CI/CD pipelines",
      "Strong analytical and problem-solving skills",
    ],
  },
];

// Reusable JobCard component
export const JobCard: React.FC<JobCardProps> = ({ job, isSelected, onSelect, isCompact = false }) => {
  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg ${
        isSelected ? "border-primary ring-2 ring-primary" : ""
      } bg-white dark:bg-black cursor-pointer ${isCompact ? "h-full" : ""}`}
      onClick={() => onSelect(job)}
    >
      <CardHeader className={`${isCompact ? "p-3 pb-2" : "p-4 pb-2"}`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${
              isCompact ? "text-sm sm:text-base" : "text-base sm:text-lg"
            } font-semibold text-gray-800 dark:text-gray-100 leading-tight`}>
              <span className="line-clamp-2">
                {job.title}
                {job.isCustom && " (Custom)"}
              </span>
            </CardTitle>
          </div>
          {isSelected && (
            <CheckCircle2 className="text-primary h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5" />
          )}
        </div>
      </CardHeader>
      <CardContent className={`${isCompact ? "px-3 py-2" : "px-4 py-3"} pt-0`}>
        <div className="space-y-3">
          <p className={`${
            isCompact ? "text-xs sm:text-sm" : "text-sm"
          } text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed`}>
            {job.description}
          </p>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    isCompact 
                      ? "text-xs px-2 py-1.5 h-auto min-h-[28px]" 
                      : "text-xs px-3 py-1.5 h-auto min-h-[32px]"
                  } cursor-pointer flex-1 sm:flex-initial`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className={`${isCompact ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} shrink-0`} />
                  <span className="hidden xs:inline">View Details</span>
                  <span className="xs:hidden">Details</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-white dark:bg-black">
                <DialogHeader>
                  <DialogTitle className="text-gray-800 dark:text-gray-100">
                    {job.title}
                    {job.isCustom && " (Custom Job Description)"}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-100">
                      Job Description
                    </h3>
                    <div className="bg-gray-50 dark:bg-black p-4 rounded-md">
                      <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {job.description}
                      </p>
                    </div>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-100">
                        Requirements
                      </h3>
                      <div className="bg-gray-50 dark:bg-black p-4 rounded-md">
                        <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="text-sm">
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              className={`${
                isCompact 
                  ? "text-xs px-2 py-1.5 h-auto min-h-[28px]" 
                  : "text-xs px-3 py-1.5 h-auto min-h-[32px]"
              } cursor-pointer flex-1 sm:flex-initial`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(job);
              }}
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const JobSelection: React.FC<JobSelectionProps> = ({ 
  selectedJob, 
  setSelectedJob, 
  inUploadMode = false,
  isWithPdf = false 
}) => {
  const [customJobDescription, setCustomJobDescription] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [customJobs, setCustomJobs] = useState<JobRequirement[]>([]);
  const [tempSelectedJob, setTempSelectedJob] = useState<JobRequirement | null>(selectedJob);
  
  // Combined job descriptions (predefined + custom)
  const allJobs = [...defaultJobDescriptions, ...customJobs];

  const handleCustomJobSubmit = () => {
    if (!customJobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    const newCustomJob: JobRequirement = {
      id: Date.now(),
      title: "Custom Position",
      company: "Custom Company",
      description: customJobDescription,
      requirements: [],
      isCustom: true,
    };

    setCustomJobs([...customJobs, newCustomJob]);
    
    // In upload mode, directly set selected job
    if (inUploadMode) {
      setSelectedJob(newCustomJob);
    } else {
      setTempSelectedJob(newCustomJob);
    }
    
    setIsAddDialogOpen(false);
    setCustomJobDescription("");
    toast.success("Custom job description added!");
  };

  const confirmSelection = () => {
    if (tempSelectedJob) {
      setSelectedJob(tempSelectedJob);
    } else {
      toast.error("Please select a job position first");
    }
  };

  // Adjust styling and layout based on whether the component is displayed alongside a PDF
  const cardWidth = isWithPdf ? "max-w-full" : "max-w-[95%]";
  const cardMargin = isWithPdf ? "mx-4" : "mx-auto"; // Add horizontal margin when next to PDF
  const cardPadding = isWithPdf ? "p-4" : ""; 
  const headerPadding = isWithPdf ? "p-4 pb-2" : "";
  const contentPadding = isWithPdf ? "p-4 pt-0" : "";
  
  // Always show 2 jobs per row when with PDF
  const gridCols = isWithPdf 
    ? "grid-cols-1 sm:grid-cols-2" 
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  
  return (
    <div className={isWithPdf ? "pl-2 pr-2 pt-4" : ""}>
      <Card className={`${cardWidth} ${cardMargin} ${isWithPdf ? 'mt-0' : 'mt-8'} bg-white dark:bg-black border border-secondary ${cardPadding}`}>
        <CardHeader className={`${headerPadding}`}>
          <CardTitle className={`${isWithPdf ? "text-xl" : "text-2xl"} font-bold text-gray-800 dark:text-gray-100`}>
            Select a Job Description
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Choose a job description to compare your resume against
          </CardDescription>
        </CardHeader>
        <CardContent className={`space-y-4 ${contentPadding}`}>
          <div className={`grid ${gridCols} gap-4`}>
            {allJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={inUploadMode ? selectedJob?.id === job.id : tempSelectedJob?.id === job.id}
                onSelect={inUploadMode ? setSelectedJob : setTempSelectedJob}
                isCompact={isWithPdf}
              />
            ))}

            {/* Add Custom Job Card */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Card className={`flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${isWithPdf ? "p-3" : "p-6"} bg-white dark:bg-black h-full`}>
                  <Plus className={`${isWithPdf ? "h-8 w-8" : "h-12 w-12"} text-gray-400`} />
                  <p className={`${isWithPdf ? "mt-2 text-sm" : "mt-4"} text-gray-600 dark:text-gray-300 font-medium`}>
                    Add Custom Job
                  </p>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-black">
                <DialogHeader>
                  <DialogTitle>Add Custom Job Description</DialogTitle>
                  <DialogDescription>
                    Paste the job description here for targeted resume analysis.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Textarea
                    placeholder="Paste the job description here..."
                    value={customJobDescription}
                    onChange={(e) => setCustomJobDescription(e.target.value)}
                    className="min-h-[200px] bg-gray-50 dark:bg-black text-gray-700 dark:text-gray-300"
                  />
                  <DialogFooter>
                    <Button onClick={handleCustomJobSubmit} className="w-full">
                      Add & Select Job Description
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Only show confirm button in standalone mode (not in upload) */}
          {!inUploadMode && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={confirmSelection}
                disabled={!tempSelectedJob}
                className={`${isWithPdf ? "px-4 py-1 text-sm" : "px-8 py-2"}`}
              >
                Analyze Resume for Selected Position
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobSelection;