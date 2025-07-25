import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INTERVIEWERS_SEED_DATA = [
  {
    id: "interviewer_lisa_001",
    name: "Explorer Lisa",
    agentId: "agent_lisa_placeholder", // You'll replace this with actual agentId when you create Retell agents
    rapport: 7,
    exploration: 10,
    empathy: 7,
    speed: 5,
    image: "/interviewers/Lisa.png",
    description:
      "Hi! I'm Lisa, an enthusiastic and empathetic interviewer who loves to explore. With a perfect balance of empathy and rapport, I delve deep into conversations while maintaining a steady pace. Let's embark on this journey together and uncover meaningful insights!",
    audio: "Lisa.wav",
    specialties: ["Technical Interviews", "Problem Solving", "Exploration"],
    isActive: true,
  },
  {
    id: "interviewer_bob_001",
    name: "Empathetic Bob",
    agentId: "agent_bob_placeholder", // You'll replace this with actual agentId when you create Retell agents
    rapport: 7,
    exploration: 7,
    empathy: 10,
    speed: 5,
    image: "/interviewers/Bob.png",
    description:
      "Hi! I'm Bob, your go-to empathetic interviewer. I excel at understanding and connecting with people on a deeper level, ensuring every conversation is insightful and meaningful. With a focus on empathy, I'm here to listen and learn from you. Let's create a genuine connection!",
    audio: "Bob.wav",
    specialties: ["Behavioral Interviews", "Empathy", "Communication"],
    isActive: true,
  },
  {
    id: "interviewer_sarah_001",
    name: "Technical Sarah",
    agentId: "agent_sarah_placeholder",
    rapport: 8,
    exploration: 8,
    empathy: 6,
    speed: 7,
    image: "/interviewers/Sarah.png",
    description:
      "Hello! I'm Sarah, a technical interviewer with a passion for deep-diving into complex problems. I specialize in system design, algorithms, and technical architecture discussions. Let's explore your technical expertise together!",
    audio: "Sarah.wav",
    specialties: ["System Design", "Algorithms", "Technical Architecture"],
    isActive: true,
  },
  {
    id: "interviewer_mike_001",
    name: "Analytical Mike",
    agentId: "agent_mike_placeholder",
    rapport: 6,
    exploration: 9,
    empathy: 5,
    speed: 8,
    image: "/interviewers/Mike.png",
    description:
      "I'm Mike, an analytical interviewer who focuses on problem-solving methodologies and logical thinking. I enjoy challenging candidates with complex scenarios and helping them demonstrate their analytical skills.",
    audio: "Mike.wav",
    specialties: ["Problem Solving", "Analytical Thinking", "Logic"],
    isActive: true,
  },
  {
    id: "interviewer_emma_001",
    name: "Behavioral Emma",
    agentId: "agent_emma_placeholder",
    rapport: 10,
    exploration: 6,
    empathy: 9,
    speed: 4,
    image: "/interviewers/Emma.png",
    description:
      "Hi there! I'm Emma, specializing in behavioral and cultural fit interviews. I create a comfortable environment where you can share your experiences, motivations, and career aspirations. Let's have a meaningful conversation!",
    audio: "Emma.wav",
    specialties: ["Behavioral Questions", "Cultural Fit", "Career Development"],
    isActive: true,
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed interviewers
  for (const interviewer of INTERVIEWERS_SEED_DATA) {
    const existingInterviewer = await prisma.interviewer.findUnique({
      where: { id: interviewer.id },
    });

    if (!existingInterviewer) {
      await prisma.interviewer.create({
        data: interviewer,
      });
      console.log(`✅ Created interviewer: ${interviewer.name}`);
    } else {
      console.log(`⏭️  Interviewer already exists: ${interviewer.name}`);
    }
  }

  console.log("🎉 Database seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });