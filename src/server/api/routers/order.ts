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
        const products = await tx.product.findMany({
          where: {
            id: {
              in: input.products.map((val) => val.id),
            },
          },
        });

        // make sure that returned products length is the as the requested or there's missing error
        if (products.length !== input.products.length) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        // construct the create clause for the order and make sure stock gte requested qunatity or throw error
        const createCluse: {
          productId: string;
          quantity: number;
          priceAtSale: number;
        }[] = input.products.map((inProduct) => {
          const product = products.find((test) => test.id === inProduct.id);
          if (!product) {
            throw new TRPCError({ code: "BAD_REQUEST" });
          }
          if (inProduct.quantity > product.stock) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "product qunatity cannot be greater than product stock",
            });
          }

          // calc order total price as you go
          totalPrice += inProduct.quantity * product.sellPrice;
          return {
            productId: inProduct.id,
            quantity: inProduct.quantity,
            priceAtSale: product.sellPrice,
          };
        });

        const order = await ctx.prisma.order.create({
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
                priceAtSale: true,
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

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      include: {
        // TODO exclude password from user
        createdBy: true,
        products: {
          select: {
            quantity: true,
            Product: true,
            priceAtSale: true,
          },
        },
      },
    });

    const ordersWithTotal = orders.map((order) => {
      // Calculate the total price for each order
      const totalPrice = order.products.reduce(
        (total, product) => total + product.priceAtSale * product.quantity,
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
