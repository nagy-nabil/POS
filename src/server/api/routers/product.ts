import z from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { productSchema } from "@/types/entities";

export const productsRouter = createTRPCRouter({
  insertOne: publicProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.create({
        data: {
          image: input.image,
          name: input.name,
          price: input.price,
          stock: input.stock,
          createdById: input.createdById,
        },
      });
      return product;
    }),

  getOne: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.product.findFirst({
      where: {
        id: input,
      },
    });
  }),

  getMany: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany();
  }),
});
