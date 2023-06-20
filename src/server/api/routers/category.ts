import z from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { categorySchema } from "@/types/entities";

export const categoriesRouter = createTRPCRouter({
  insertOne: protectedProcedure
    .input(categorySchema)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.create({
        data: {
          image: input.image,
          name: input.name,
          createdById: ctx.payload.id,
        },
      });
      return category;
    }),

  // input is the id, need some better representation
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.prisma.category.findFirst({
      where: {
        id: input,
      },
    });
  }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.category.findMany();
  }),
});
