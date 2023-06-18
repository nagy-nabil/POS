import z from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { productSchema } from "@/types/entities";

export const productsRouter = createTRPCRouter({
  insertOne: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.create({
        data: {
          image: input.image,
          name: input.name,
          buyPrice: input.buyPrice,
          sellPrice: input.sellPrice,
          stock: input.stock,
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
});
