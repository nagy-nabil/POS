import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { productSchema } from "@/types/entities";
import z from "zod";

export const productsRouter = createTRPCRouter({
  insertOne: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.create({
        data: {
          ...input,
          id: input.id === "" ? undefined : input.id,
          createdById: ctx.session.user.id,
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

  getMany: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.product.findMany({
      orderBy: {
        stock: "desc",
      },
    });
  }),
  updateOne: protectedProcedure
    .input(
      z.object({
        /**
         * id to be updated
         */
        productId: z.string().nonempty(),
        product: productSchema.extend({ id: z.string() }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.product.update({
        where: {
          id: input.productId,
        },
        data: input.product,
      });
    }),

  //TODO add deleteMany when it has been decided what should happen to order when product get deleted
});
