import { UserRole, JobRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      jobRole: JobRole
      email: string
      name: string
      isOAuth: boolean
    }
  }
} 