import bcrypt from "bcrypt";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { loginSchema } from "@/types/entities";
import { TRPCError } from "@trpc/server";
import { newToken } from "@/server/auth";

// here suppose to add logic to add new org members and so on
export const usersRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          userName: input.userName,
        },
        select: {
          id: true,
          userName: true,
          password: true,
          role: true,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "wrong userName or password",
        });
      }

      const match = await bcrypt.compare(input.password, user.password);
      if (!match) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "wrong userName or password",
        });
      }
      return newToken(user);
    }),
});
