import z from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { productSchema } from "@/types/entities";

export const productsRouter = createTRPCRouter({
  insertOne: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.create({
        data: {
          ...input,
          createdById: ctx.payload.id,
          categoryId: input.categoryId,
        },
      });
      return product;
    }),

  getOne: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.product.findFirst({
      where: {
        id: input,
      },
    });
  }),

  getMany: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany();
  }),
  updateOne: protectedProcedure
    .input(productSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.product.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    }),

  //TODO add deleteMany when it has been decided what should happen to order when product get deleted
});
