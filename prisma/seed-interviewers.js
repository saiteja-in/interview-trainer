const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const interviewers = [
  {
    name: "Alex Chen",
    image: "/interviewers/alex-chen.jpg",
    description: "Senior Software Engineer with 8+ years of experience in full-stack development. Specializes in system design and technical problem-solving.",
    specialties: ["System Design", "Data Structures", "Web Development", "Algorithms"]
  },
  {
    name: "Sarah Johnson",
    image: "/interviewers/sarah-johnson.jpg", 
    description: "Tech Lead and Engineering Manager with expertise in DevOps and cloud architecture. Known for practical, real-world interview scenarios.",
    specialties: ["DevOps", "System Design", "Software Engineering", "Databases"]
  },
  {
    name: "Michael Rodriguez",
    image: "/interviewers/michael-rodriguez.jpg",
    description: "Principal Engineer specializing in distributed systems and security. Brings deep technical knowledge to complex problem discussions.",
    specialties: ["Security", "System Design", "Algorithms", "Operating Systems"]
  },
  {
    name: "Emily Wang",
    image: "/interviewers/emily-wang.jpg",
    description: "Database Architect and Performance Expert. Focuses on data modeling, query optimization, and scalable database solutions.",
    specialties: ["Databases", "Data Structures", "System Design", "Algorithms"]
  }
];

async function seedInterviewers() {
  console.log('Seeding interviewers...');
  
  // First, check if any interviewers exist
  const existingCount = await prisma.interviewer.count();
  
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing interviewers. Skipping seed.`);
    return;
  }
  
  // Create all interviewers
  await prisma.interviewer.createMany({
    data: interviewers,
    skipDuplicates: true
  });
  
  console.log(`Interviewers seeded successfully! Created ${interviewers.length} interviewers.`);
}

seedInterviewers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });