import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
// import { TRPCError } from "@trpc/server";

// here suppose to add logic to add new org members and so on
export const dashboardRouter = createTRPCRouter({
  revenue: protectedProcedure.query(async ({ ctx }) => {
    // i'm not in the mood to fuck with prisma
    const rev = await ctx.prisma.$queryRaw<[{revenue: number}]>`select sum("sellPrice" * stock) as revenue from "Product";`;
      return rev[0];
  })
});
