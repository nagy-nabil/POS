import z from "zod";
import { PrismaClient } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { orderSchema } from "@/types/entities";
import { TRPCError } from "@trpc/server";

export const ordersRouter = createTRPCRouter({
  insertOne: protectedProcedure
    .input(orderSchema)
    .mutation(async ({ ctx, input }) => {
      // for the interactive transaction, need new client
      const prisma = new PrismaClient();
      const res = await prisma.$transaction(async (tx) => {
        let totalPrice = 0;
        // decrease products stock by quntity
        // TODO make it in single query
        // https://stackoverflow.com/questions/18797608/update-multiple-rows-in-same-query-using-postgresql
        // https://stackoverflow.com/questions/25674737/update-multiple-rows-with-different-values-in-one-query-in-mysql
        const products = await Promise.all(
          input.products.map((item) =>
            tx.product.update({
              where: { id: item.id },
              data: { stock: { decrement: item.quantity } },
            })
          )
        );

        // make sure that returned products length is the as the requested or there's missing error
        if (products.length !== input.products.length) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        // construct the create clause for the order and make sure stock gte requested qunatity or throw error
        const createCluse: {
          productId: string;
          quantity: number;
          buyPriceAtSale: number;
          sellPriceAtSale: number;
        }[] = input.products.map((inProduct) => {
          const product = products.find((test) => test.id === inProduct.id);
          if (!product) {
            throw new TRPCError({ code: "BAD_REQUEST" });
          }

          // calc order total price as you go
          totalPrice += inProduct.quantity * product.sellPrice;
          return {
            productId: inProduct.id,
            quantity: inProduct.quantity,
            sellPriceAtSale: product.sellPrice,
            buyPriceAtSale: product.buyPrice,
          };
        });

        const order = await tx.order.create({
          data: {
            createdById: ctx.payload.id,
            products: {
              create: createCluse,
            },
          },
          include: {
            createdBy: true,
            products: {
              select: {
                quantity: true,
                Product: true,
                buyPriceAtSale: true,
                sellPriceAtSale: true,
              },
            },
          },
        });

        // TODO exclude password from user
        return {
          ...order,
          total: totalPrice,
        };
      });

      return res;
    }),

  // input is the id, need some better representation
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.prisma.order.findFirst({
      where: {
        id: input,
      },
    });
  }),

  getMany: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.prisma.order.findMany({
        where: {
          createdAt: {
            lte: input.to,
            gte: input.from,
          },
        },
        include: {
          // TODO exclude password from user
          createdBy: {
            select: {
              id: true,
              userName: true,
            },
          },
          products: {
            select: {
              quantity: true,
              Product: true,
              buyPriceAtSale: true,
              sellPriceAtSale: true,
            },
          },
        },
      });

      const ordersWithTotal = orders.map((order) => {
        // Calculate the total price for each order
        const totalPrice = order.products.reduce(
          (total, product) =>
            total + product.sellPriceAtSale * product.quantity,
          0
        );

        return {
          ...order,
          total: totalPrice,
        };
      });
      return ordersWithTotal;
    }),
});
