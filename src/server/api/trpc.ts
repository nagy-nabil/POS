import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { prisma } from "@/server/db";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { verifyToken } from "../auth";

export const createTRPCContext = (opts: CreateNextContextOptions) => {
  const token = opts.req.headers.authorization;
  return {
    prisma,
    // note token could be null and no checking is done to verify it
    // auth middleware responsibilty is to make sure it's not null and is authorized user
    token,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.token || !ctx.token.startsWith("Bearer ")) {
    console.log(
      "🪵 [trpc.ts:45] ~ token ~ \x1b[0;32mctx.token\x1b[0m = ",
      ctx.token
    );
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  let payload;
  try {
    payload = verifyToken(ctx.token.split("Bearer ")[1]?.trim() as string);
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  console.log(payload);
  //if we reach here means the token didn't throw
  // now make sure user exist
  const user = await ctx.prisma.user.findFirst({
    where: {
      id: payload.id,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  console.log("🪵 [trpc.ts:65] ~ token ~ \x1b[0;32muser\x1b[0m = ", user);

  return next({
    ctx: {
      payload,
      token: ctx.token,
    },
  });
});
// const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
//   if (!ctx.session || !ctx.session.user) {
//     throw new TRPCError({ code: "UNAUTHORIZED" });
//   }
//   return next({
//     ctx: {
//       // infers the `session` as non-nullable
//       session: { ...ctx.session, user: ctx.session.user },
//     },
//   });
// });

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
