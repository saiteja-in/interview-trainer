import { auth } from '@/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {
  const session = await auth();
  return { 
    auth: session,
    userId: session?.user?.id || 'user_123' 
  };
});

const t = initTRPC.context<typeof createTRPCContext>().create({});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }
  
  return next({ 
    ctx: { 
      ...ctx, 
      auth: {
        ...session,
        user: {
          ...session.user,
          id: session.user.id as string,
        }
      }
    } 
  });
});