import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { offerSchema } from "@/types/entities";
import { z } from "zod";

export const offeresRouter = createTRPCRouter({
  index: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.offer.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        products: {
          include: {
            Product: true,
          },
        },
      },
    });
  }),

  store: protectedProcedure
    .input(offerSchema)
    .mutation(async ({ ctx, input }) => {
      const o = await ctx.prisma.offer.create({
        data: {
          name: input.name,
          createdById: ctx.session.user.id,
          products: {
            create: input.products.map((p) => ({
              productId: p.productId,
              price: p.price,
              quantity: p.quantity,
            })),
          },
        },
        include: {
          products: {
            include: {
              Product: true,
            },
          },
        },
      });
      return o;
    }),

  delete: protectedProcedure
    .input(z.array(z.string().nonempty()))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.offer.updateMany({
        where: {
          id: {
            in: input,
          },
        },
        data: {
          deletedAt: new Date(),
          deletedById: ctx.session.user.id,
        },
      });
    }),
});
