import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const popularInterviews = [
  {
    title: "Stacks vs Queues",
    description: "Master the fundamental differences between stacks and queues, their implementations, and real-world applications in software development.",
    difficulty: "Beginner",
    duration: 20,
    category: "Data Structures"
  },
  {
    title: "Hash Tables Deep Dive",
    description: "Explore hash table implementations, collision handling strategies, and performance optimization techniques.",
    difficulty: "Intermediate",
    duration: 30,
    category: "Data Structures"
  },
  {
    title: "REST API 101",
    description: "Learn the principles of RESTful API design, HTTP methods, status codes, and best practices for building scalable APIs.",
    difficulty: "Beginner",
    duration: 25,
    category: "Web Development"
  },
  {
    title: "Processes vs Threads",
    description: "Understand the differences between processes and threads, their use cases, and synchronization mechanisms.",
    difficulty: "Intermediate",
    duration: 30,
    category: "Operating Systems"
  },
  {
    title: "Low Level Design",
    description: "Practice designing scalable systems with proper object-oriented principles, design patterns, and architecture decisions.",
    difficulty: "Advanced",
    duration: 45,
    category: "System Design"
  },
  {
    title: "DevOps Fundamentals",
    description: "Cover CI/CD pipelines, containerization, infrastructure as code, and monitoring in modern DevOps practices.",
    difficulty: "Intermediate",
    duration: 35,
    category: "DevOps"
  },
  {
    title: "Binary Search Trees",
    description: "Deep dive into BST operations, balancing techniques, and tree traversal algorithms with practical implementations.",
    difficulty: "Intermediate",
    duration: 30,
    category: "Data Structures"
  },
  {
    title: "Database Indexing",
    description: "Learn about database indexing strategies, B-trees, query optimization, and performance tuning techniques.",
    difficulty: "Advanced",
    duration: 40,
    category: "Databases"
  },
  {
    title: "Microservices Architecture",
    description: "Explore microservices design patterns, service communication, data consistency, and deployment strategies.",
    difficulty: "Advanced",
    duration: 50,
    category: "System Design"
  },
  {
    title: "JavaScript Closures",
    description: "Master JavaScript closures, scope chain, lexical environment, and practical applications in modern development.",
    difficulty: "Intermediate",
    duration: 25,
    category: "Web Development"
  },
  {
    title: "SQL Query Optimization",
    description: "Learn advanced SQL techniques, query planning, index usage, and performance optimization strategies.",
    difficulty: "Advanced",
    duration: 35,
    category: "Databases"
  },
  {
    title: "Docker Containerization",
    description: "Understand Docker fundamentals, container orchestration, multi-stage builds, and deployment best practices.",
    difficulty: "Intermediate",
    duration: 30,
    category: "DevOps"
  },
  {
    title: "Graph Algorithms",
    description: "Explore graph representations, traversal algorithms (BFS/DFS), shortest path algorithms, and practical applications.",
    difficulty: "Advanced",
    duration: 40,
    category: "Algorithms"
  },
  {
    title: "Web Security Basics",
    description: "Cover common web vulnerabilities, authentication mechanisms, HTTPS, and security best practices for web applications.",
    difficulty: "Intermediate",
    duration: 30,
    category: "Security"
  },
  {
    title: "React Component Patterns",
    description: "Learn advanced React patterns, hooks, state management, and performance optimization techniques.",
    difficulty: "Intermediate",
    duration: 35,
    category: "Web Development"
  },
  {
    title: "System Design Scalability",
    description: "Design highly scalable systems covering load balancing, caching strategies, database sharding, and CDN usage.",
    difficulty: "Advanced",
    duration: 60,
    category: "System Design"
  }
];

// const interviewers = [
//   {
//     name: "Alex Chen",
//     image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
//     description: "Senior Software Engineer with 8+ years of experience in full-stack development and system design.",
//     specialties: ["System Design", "Web Development", "Algorithms", "Data Structures"]
//   },
//   {
//     name: "Sarah Johnson",
//     image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
//     description: "DevOps Engineer and Cloud Architect specializing in scalable infrastructure and automation.",
//     specialties: ["DevOps", "Cloud Architecture", "Containerization", "CI/CD"]
//   },
//   {
//     name: "Michael Rodriguez",
//     image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
//     description: "Database Expert and Backend Engineer with expertise in performance optimization and data modeling.",
//     specialties: ["Databases", "Backend Development", "Performance Optimization", "SQL"]
//   },
//   {
//     name: "Emily Davis",
//     image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
//     description: "Security Engineer focused on web application security, penetration testing, and secure coding practices.",
//     specialties: ["Security", "Web Security", "Penetration Testing", "Secure Coding"]
//   },
//   {
//     name: "David Kim",
//     image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
//     description: "Frontend Architect with deep knowledge of modern JavaScript frameworks and performance optimization.",
//     specialties: ["Frontend Development", "JavaScript", "React", "Performance Optimization"]
//   }
// ];

async function main() {
  console.log('Seeding popular interviews...');
  
  // Create interviewers first
  // for (const interviewer of interviewers) {
  //   // Check if interviewer already exists
  //   const existingInterviewer = await db.interviewer.findFirst({
  //     where: { name: interviewer.name }
  //   });
    
  //   if (!existingInterviewer) {
  //     await db.interviewer.create({
  //       data: interviewer,
  //     });
  //   } else {
  //     await db.interviewer.update({
  //       where: { id: existingInterviewer.id },
  //       data: interviewer,
  //     });
  //   }
  // }
  
  // Create popular interviews
  for (const interview of popularInterviews) {
    // Check if interview already exists
    const existingInterview = await db.popularInterview.findFirst({
      where: { title: interview.title }
    });
    
    if (!existingInterview) {
      await db.popularInterview.create({
        data: interview,
      });
    } else {
      await db.popularInterview.update({
        where: { id: existingInterview.id },
        data: interview,
      });
    }
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });