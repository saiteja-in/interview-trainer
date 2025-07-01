import { auth } from '@/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
export const createTRPCContext = cache(async () => {
  return { userId: 'user_123' };
});
const t = initTRPC.create({});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
    const session = await auth();
    if (!session)
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    return next({ ctx: { ...ctx, auth: session } });
  });
  