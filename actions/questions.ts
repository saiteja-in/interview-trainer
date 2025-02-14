'use server'

import { db } from "@/lib/db"
import { JobRole } from "@prisma/client"


export const getQuestionsByRole = async (role: string) => {
  try {
    return await db.question.findMany({
      where: { role: role as JobRole },
      select: { question: true }
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}