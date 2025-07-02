import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { z } from "zod";
import { agentsInsertSchema } from "@/schemas/agents";
import { db } from "@/lib/db";

export const agentsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Prisma: findUnique returns null if not found
      const existingAgent = await db.agent.findUnique({
        where: { id: input.id },
      });
      // Add a dummy meetingCount property to match your original return shape
      return existingAgent
        ? { meetingCount: 5, ...existingAgent }
        : null;
    }),

  getMany: protectedProcedure.query(async () => {
    // Prisma: findMany returns an array of agents
    const data = await db.agent.findMany();
    return data;
  }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const createdAgent = await db.agent.create({
        data: {
          ...input,
          userId: ctx.auth.user.id,
        },
      });
      return createdAgent;
    }),
});
