import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import z from "zod";

// import { TRPCError } from "@trpc/server";

// here suppose to add logic to add new org members and so on
export const dashboardRouter = createTRPCRouter({
  revenue: protectedProcedure.query(async ({ ctx }) => {
    // i'm not in the mood to fuck with prisma
    const rev = await ctx.prisma.$queryRaw<
      [{ revenue: number }]
    >`select sum("buyPrice" * stock) as revenue from "Product";`;
    return rev[0];
  }),
  /**
   * return one product selling history
   * @param productId
   */
  productHistory: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.product.findFirst({
        where: {
          id: input,
        },
        include: {
          orders: {
            orderBy: [
              {
                order: {
                  createdAt: "desc",
                },
              },
            ],
            include: {
              order: {
                select: {
                  id: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });
    }),
});
