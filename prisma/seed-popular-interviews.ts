import { db } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const popularInterviews = [
  {
    title: "Stacks vs Queues",
    description:
      "Learn the FIFO and LIFO flow concepts. Understand when to use stacks versus queues in different scenarios, their implementation details, and common use cases in software development.",
    difficulty: "Beginner",
    duration: 20,
    category: "Data Structures",
  },
  {
    title: "Hash Tables",
    description:
      "Master the magic of key-to-index storage. Deep dive into hash functions, collision resolution techniques, load factors, and real-world applications of hash tables.",
    difficulty: "Intermediate",
    duration: 25,
    category: "Data Structures",
  },
  {
    title: "REST API 101",
    description:
      "Web APIs using HTTP methods. Learn about RESTful principles, HTTP status codes, API design best practices, and how to build scalable web services.",
    difficulty: "Beginner",
    duration: 30,
    category: "Web Development",
  },
  {
    title: "Processes vs Threads",
    description:
      "Discuss these Core OS concepts. Understand the differences between processes and threads, memory management, synchronization, and concurrency patterns.",
    difficulty: "Intermediate",
    duration: 25,
    category: "Operating Systems",
  },
  {
    title: "Low-Level Design",
    description:
      "Analyze components and optimization ideas. Learn object-oriented design principles, design patterns, and how to architect maintainable software systems.",
    difficulty: "Advanced",
    duration: 45,
    category: "System Design",
  },
  {
    title: "DevOps Fundamentals",
    description:
      "Talk about CI/CD, Docker, and cloud tools. Explore continuous integration, deployment pipelines, containerization, and modern DevOps practices.",
    difficulty: "Intermediate",
    duration: 35,
    category: "DevOps",
  },
  {
    title: "Binary Trees",
    description:
      "Navigate tree structures and traversals. Master binary tree operations, different traversal methods, and tree-based algorithms.",
    difficulty: "Intermediate",
    duration: 30,
    category: "Data Structures",
  },
  {
    title: "Database Indexing",
    description:
      "Optimize query performance with indexes. Learn about B-trees, hash indexes, query optimization, and database performance tuning.",
    difficulty: "Advanced",
    duration: 40,
    category: "Databases",
  },
  {
    title: "Microservices Architecture",
    description:
      "Design distributed systems at scale. Understand service decomposition, inter-service communication, and microservices best practices.",
    difficulty: "Advanced",
    duration: 50,
    category: "System Design",
  },
  {
    title: "Authentication & Authorization",
    description:
      "Secure your applications properly. Learn about JWT, OAuth, session management, and security best practices in web applications.",
    difficulty: "Intermediate",
    duration: 35,
    category: "Security",
  },
  {
    title: "Caching Strategies",
    description:
      "Improve performance with smart caching. Explore different caching levels, cache invalidation strategies, and distributed caching systems.",
    difficulty: "Intermediate",
    duration: 30,
    category: "System Design",
  },
  {
    title: "Graph Algorithms",
    description:
      "Solve complex problems with graphs. Master graph traversal algorithms, shortest path algorithms, and graph-based problem solving.",
    difficulty: "Advanced",
    duration: 45,
    category: "Algorithms",
  },
  {
    title: "Load Balancing",
    description:
      "Distribute traffic efficiently across servers. Learn about different load balancing algorithms, health checks, and high availability systems.",
    difficulty: "Advanced",
    duration: 40,
    category: "System Design",
  },
  {
    title: "Message Queues",
    description:
      "Handle asynchronous communication patterns. Understand message brokers, pub/sub patterns, and event-driven architectures.",
    difficulty: "Intermediate",
    duration: 35,
    category: "System Design",
  },
  {
    title: "SQL vs NoSQL",
    description:
      "Choose the right database for your needs. Compare relational and non-relational databases, ACID properties, and CAP theorem.",
    difficulty: "Intermediate",
    duration: 30,
    category: "Databases",
  },
  {
    title: "Software Testing",
    description:
      "Ensure code quality with comprehensive testing. Learn about unit testing, integration testing, TDD, and testing best practices.",
    difficulty: "Beginner",
    duration: 25,
    category: "Software Engineering",
  },
];

async function seedPopularInterviews() {
  console.log("Seeding popular interviews...");

  // First, check if any popular interviews exist
  const existingCount = await db.popularInterview.count();

  if (existingCount > 0) {
    console.log(
      `Found ${existingCount} existing popular interviews. Skipping seed.`
    );
    return;
  }

  // Create all interviews at once
  await db.popularInterview.createMany({
    data: popularInterviews,
    skipDuplicates: true,
  });

  console.log(
    `Popular interviews seeded successfully! Created ${popularInterviews.length} interviews.`
  );
}

if (require.main === module) {
  seedPopularInterviews()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedPopularInterviews };
