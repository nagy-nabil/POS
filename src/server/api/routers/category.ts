import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { categorySchema } from "@/types/entities";
import z from "zod";

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

  updateOne: protectedProcedure
    .input(categorySchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.category.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    }),

  // TODO decide what should happens to the products first when the category get deleted
  // deleteMany: protectedProcedure
  //   .input(z.array(z.string()))
  //   .mutation(async ({ ctx, input }) => {
  //     return await ctx.prisma.category.deleteMany({
  //       where: {
  //         id: {
  //           in: input,
  //         },
  //       },
  //     });
  //   }),

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
