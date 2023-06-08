import z from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { orderSchema } from "@/types/entities";

export const ordersRouter = createTRPCRouter({
  insertOne: publicProcedure
    .input(orderSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.create({
        data: {
          total: input.total,
          createdById: input.createdById,
          products: {
            create: input.products.map((product) => {
              return {
                quantity: product.quantity,
                productId: product.id,
              };
            }),
          },
        },
      });
      return order;
    }),

  // input is the id, need some better representation
  getOne: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.order.findFirst({
      where: {
        id: input,
      },
    });
  }),

  getMany: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.order.findMany({
      include: {
        products: {
          select: {
            quantity: true,
            Product: true,
          },
        },
      },
    });
  }),
});
