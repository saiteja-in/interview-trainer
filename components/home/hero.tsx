"use client";

import * as React from "react";

import {
  Activity,
  ArrowRight,
  BarChart,
  Bird,
  Menu,
  Plug,
  Sparkles,
  Zap,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Variants, motion, useAnimation, useInView } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ExtendedUser } from "@/schemas";
import { useRouter } from "nextjs-toploader/app";

type Props={
    user:ExtendedUser | undefined
}

const labels = [
    { icon: Sparkles, label: "Role-Specific Questions" },
    { icon: Plug, label: "Real-Time Feedback" },
    { icon: Activity, label: "Performance Analytics" },
  ];
  
  const features = [
    {
      icon: BarChart,
      label: "Personalized Mock Interviews",
      description:
        "Simulate real interviews with questions customized to your target job role and experience level.",
    },
    {
      icon: Zap,
      label: "AI-Powered Analysis",
      description:
        "Get instant feedback on your responses, speech patterns, and body language through AI evaluation.",
    },
    {
      icon: Activity,
      label: "Progress Tracking",
      description:
        "Monitor your improvement over time with detailed performance reports and historical comparisons.",
    },
  ];

const titleVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const labelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      mass: 0.5,
    },
  },
};

const featureVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  }),
};

export function MynaHero({user}:Props) {
    const router=useRouter()
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const handleStartPractice = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };
  React.useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const titleWords = [
    "MASTER",
    "YOUR",
    "JOB",
    "INTERVIEWS",
    "WITH",
    "AI",
    "COACHING",
  ];
  return (
    <div className="min-h-screen bg-background">


      <main>
        <section className="container pt-24 pb-12 ">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="flex flex-col items-center text-center"
          >
            <motion.h1
              initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              className="relative font-mono text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight"
            >
              {[
               "MASTER",
                "YOUR",
                "JOB",
                "INTERVIEWS",
                "WITH",
                "AI",
                "COACHING",
              ].map((text, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  className="inline-block mx-2 md:mx-4"
                  variants={titleVariants}
                >
                  {text}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.5, duration: 0.5 },
                },
              }}
              className="mx-auto mt-8 max-w-2xl text-xl text-foreground font-mono"
            >
               Transform your interview skills with AI-powered mock sessions,
               personalized feedback, and performance tracking.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 0.6,
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="mt-12 flex flex-wrap justify-center gap-6"
            >
              {labels.map((feature) => (
                <motion.div
                  key={feature.label}
                  variants={labelVariants}
                  className="flex items-center gap-2 px-6"
                >
                  <feature.icon className="h-5 w-5 text-[#FF6B2C]" />
                  <span className="text-sm font-mono">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: 1,
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  },
                },
              }}
            >
              <Button
            size="lg"
            className="rounded-none mt-12 bg-[#FF6B2C] hover:bg-[#FF6B2C]/90 font-mono"
            onClick={handleStartPractice}
          >
            START PRACTICING NOW <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
            </motion.div>
          </motion.div>
        </section>

        <section className="container" ref={ref}>
          <motion.h2
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                },
              },
            }}
            className="text-center text-4xl font-mono font-bold mb-6"
          >
            Elevate Your Interview Game
          </motion.h2>
          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            className="grid md:grid-cols-3 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                custom={index}
                variants={featureVariants}
                className="flex flex-col items-center text-center p-8 bg-background border"
              >
                <motion.div
                  className="mb-6 rounded-full bg-[#FF6B2C]/10 p-4"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <feature.icon className="h-8 w-8 text-[#FF6B2C]" />
                </motion.div>
                <h3 className="mb-4 text-xl font-mono font-bold">
                  {feature.label}
                </h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}