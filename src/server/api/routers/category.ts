import z from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { categorySchema } from "@/types/entities";

export const categoriesRouter = createTRPCRouter({
  insertOne: publicProcedure
    .input(categorySchema)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.create({
        data: {
          image: input.image,
          name: input.name,
          createdById: input.createdById,
        },
      });
      return category;
    }),

  // input is the id, need some better representation
  getOne: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.category.findFirst({
      where: {
        id: input,
      },
    });
  }),

  getMany: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  }),
});
