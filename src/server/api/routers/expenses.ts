import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  expensesSchema,
  expenseStoreSchema,
  expenseTypeSchema,
} from "@/types/entities";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const expensesRouter = createTRPCRouter({
  // expenses types
  expenseTypeGetMany: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.expenseTypes.findMany();
  }),

  expeseTypeInsertOne: protectedProcedure
    .input(expenseTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const type = await ctx.prisma.expenseTypes.create({
        data: {
          name: input.name,
          description: input.description,
          createdById: ctx.session.user.id,
        },
      });
      return type;
    }),

  expenseTypeUpdateOne: protectedProcedure
    .input(expenseTypeSchema.extend({ id: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.expenseTypes.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    }),

  // expenses store
  expeseStoreInsertOne: protectedProcedure
    .input(expenseStoreSchema)
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.prisma.expenseStore.create({
        data: {
          name: input.name,
          description: input.description,
          onTheFly: input.onTheFly,
          amount: input.amount,
          remindAt: input.remindAt,
          createdById: ctx.session.user.id,
          typeId: input.typeId,
        },
      });
      return expense;
    }),

  /**
   * only return the ones that can be reused
   */
  expenseStoreGetMany: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.expenseStore.findMany({
      where: {
        onTheFly: false,
      },
    });
  }),

  expenseStoreUpdateOne: protectedProcedure
    .input(expenseStoreSchema.extend({ id: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.expenseStore.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    }),

  // expenses
  expenseInsertOne: protectedProcedure
    .input(expensesSchema)
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.prisma.expenses.create({
        data: {
          createdById: ctx.session.user.id,
          additionalAmount: input.additionalAmount,
          description: input.description,
          SpendingsOnExpenses: {
            createMany: {
              data: input.expenseStoreIds.map((i) => ({ spendingId: i })),
            },
          },
        },
        include: {
          SpendingsOnExpenses: {
            include: {
              spending: true,
            },
          },
        },
      });
      return expense;
    }),

  // TODO that's not enough to update many to many relation
  expenseUpdateOne: protectedProcedure
    .input(expensesSchema.extend({ id: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.expenses.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    }),

  expenseGetMany: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.expenses.findMany({
      include: {
        SpendingsOnExpenses: {
          include: {
            spending: true,
          },
        },
      },
    });
  }),
});

export type ExpensesRouter = inferRouterOutputs<typeof expensesRouter>;
export type ExpenseGetMany = ExpensesRouter["expenseGetMany"];
