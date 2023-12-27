import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  completeExpenseSchema,
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
    .input(completeExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.prisma.expenses.create({
        data: {
          createdById: ctx.session.user.id,
          additionalAmount: 0,
          description: input.description,
          SpendingsOnExpenses: {
            create: {
              spending: {
                create: {
                  onTheFly: true,
                  amount: input.amount,
                  name: input.name,
                  description: input.description,
                  createdById: ctx.session.user.id,
                },
              },
            },
          },
        },
        select: {
          createdAt: true,
          id: true,
          SpendingsOnExpenses: {
            include: {
              spending: {
                select: {
                  id: true,
                  amount: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });
      return {
        id: expense.id,
        createdAt: expense.createdAt,
        name: expense.SpendingsOnExpenses[0].spending.name, // TODO
        amount: expense.SpendingsOnExpenses[0].spending.amount,
        description: expense.SpendingsOnExpenses[0].spending.description,
      };
    }),

  // TODO that's not enough to update many to many relation
  expenseUpdateOne: protectedProcedure
    .input(expensesSchema.extend({ id: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.expenses.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    }),

  expenseGetMany: protectedProcedure.query(async ({ ctx }) => {
    const r = await ctx.prisma.expenses.findMany({
      select: {
        createdAt: true,
        id: true,
        SpendingsOnExpenses: {
          include: {
            spending: {
              select: {
                id: true,
                amount: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });
    return r.map((e) => {
      return {
        id: e.id,
        createdAt: e.createdAt,
        name: e.SpendingsOnExpenses[0].spending.name,
        amount: e.SpendingsOnExpenses[0].spending.amount,
        description: e.SpendingsOnExpenses[0].spending.description,
      };
    });
  }),
});

export type ExpensesRouter = inferRouterOutputs<typeof expensesRouter>;
export type ExpenseGetMany = ExpensesRouter["expenseGetMany"];
