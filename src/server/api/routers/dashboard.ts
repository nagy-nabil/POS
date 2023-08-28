import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
// import { TRPCError } from "@trpc/server";

// here suppose to add logic to add new org members and so on
export const dashboardRouter = createTRPCRouter({
  revenue: protectedProcedure.query(async ({ ctx }) => {
    const rev = await ctx.prisma.product.aggregate({
      _sum: {
        sellPrice: true
      }
    });
    return rev;
  })
});
