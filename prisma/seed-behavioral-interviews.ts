import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const behavioralInterviews = [
  // Common Themes
  {
    title: "Teamwork",
    description: "Questions about collaboration, working with others, and team dynamics. Focus on your ability to work effectively in team environments.",
    category: "Common Themes",
    company: null,
  },
  {
    title: "Leadership",
    description: "Questions about taking initiative, leading projects, and influencing others. Demonstrate your leadership potential and experience.",
    category: "Common Themes",
    company: null,
  },
  {
    title: "Conflict Resolution",
    description: "Questions about handling disagreements, difficult situations, and interpersonal conflicts in the workplace.",
    category: "Common Themes",
    company: null,
  },
  {
    title: "Time Management",
    description: "Questions about prioritizing tasks, meeting deadlines, and managing multiple responsibilities effectively.",
    category: "Common Themes",
    company: null,
  },
  {
    title: "Problem Solving",
    description: "Questions about analytical thinking, creative solutions, and overcoming challenges in your work.",
    category: "Common Themes",
    company: null,
  },
  {
    title: "Adaptability",
    description: "Questions about handling change, learning new skills, and adjusting to different situations or environments.",
    category: "Common Themes",
    company: null,
  },
  {
    title: "Communication",
    description: "Questions about presenting ideas, explaining complex concepts, and effective interpersonal communication.",
    category: "Common Themes",
    company: null,
  },

  // Company Specific - Google
  {
    title: "Google Behavioral",
    description: "Behavioral questions commonly asked at Google interviews. Focus on Googleyness, leadership, and role-related experience.",
    category: "Company Specific",
    company: "Google",
  },
  {
    title: "Microsoft Behavioral",
    description: "Behavioral questions commonly asked at Microsoft interviews. Emphasize collaboration, growth mindset, and customer focus.",
    category: "Company Specific",
    company: "Microsoft",
  },
  {
    title: "Amazon Behavioral",
    description: "Behavioral questions based on Amazon's Leadership Principles. Prepare STAR method examples for each principle.",
    category: "Company Specific",
    company: "Amazon",
  },
  {
    title: "Meta Behavioral",
    description: "Behavioral questions commonly asked at Meta (Facebook) interviews. Focus on impact, iteration, and building connections.",
    category: "Company Specific",
    company: "Meta",
  },
  {
    title: "Apple Behavioral",
    description: "Behavioral questions commonly asked at Apple interviews. Emphasize innovation, attention to detail, and user focus.",
    category: "Company Specific",
    company: "Apple",
  },
  {
    title: "Netflix Behavioral",
    description: "Behavioral questions based on Netflix culture values. Focus on freedom, responsibility, and high performance.",
    category: "Company Specific",
    company: "Netflix",
  },
  {
    title: "TCS Behavioral",
    description: "Behavioral questions commonly asked at TCS interviews. Focus on client service, continuous learning, and teamwork.",
    category: "Company Specific",
    company: "TCS",
  },
  {
    title: "Infosys Behavioral",
    description: "Behavioral questions commonly asked at Infosys interviews. Emphasize innovation, integrity, and client value.",
    category: "Company Specific",
    company: "Infosys",
  },
  {
    title: "Wipro Behavioral",
    description: "Behavioral questions commonly asked at Wipro interviews. Focus on spirit of Wipro, integrity, and customer centricity.",
    category: "Company Specific",
    company: "Wipro",
  },
  {
    title: "Accenture Behavioral",
    description: "Behavioral questions commonly asked at Accenture interviews. Emphasize client value creation, one global network, and respect for individuals.",
    category: "Company Specific",
    company: "Accenture",
  },
];

async function main() {
  console.log("🌱 Seeding behavioral interviews...");

  // Clear existing behavioral interviews
  await prisma.behavioralInterview.deleteMany({});

  // Create behavioral interviews
  for (const interview of behavioralInterviews) {
    await prisma.behavioralInterview.create({
      data: interview,
    });
  }

  console.log(`✅ Created ${behavioralInterviews.length} behavioral interviews`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding behavioral interviews:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });