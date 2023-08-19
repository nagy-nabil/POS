import { env } from "@/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  // publicProcedure,
} from "@/server/api/trpc";
// import { newToken } from "@/server/auth";
import { loginSchema, userSchema } from "@/types/entities";
// import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";

// here suppose to add logic to add new org members and so on
export const usersRouter = createTRPCRouter({
  // signIn: publicProcedure
  //   .input(loginSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const user = await ctx.prisma.user.findFirst({
  //       where: {
  //         userName: input.userName,
  //       },
  //       select: {
  //         id: true,
  //         userName: true,
  //         password: true,
  //         role: true,
  //       },
  //     });
  //     if (!user) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "wrong userName or password",
  //       });
  //     }

  //     const match = await bcrypt.compare(input.password, user.password);
  //     if (!match) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "wrong userName or password",
  //       });
  //     }
  //     return newToken(user);
  //   }),

  updateUserName: protectedProcedure
    .input(
      userSchema.pick({
        userName: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          userName: input.userName,
        },
        select: {
          userName: true,
        },
      });
    }),

  updatePassword: protectedProcedure
    .input(
      loginSchema.pick({
        password: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hash = await bcrypt.hash(input.password, env.CRYPTROUNDS);
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          password: hash,
        },
        select: {
          userName: true,
        },
      });
    }),
});
