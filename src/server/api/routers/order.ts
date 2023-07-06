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
  /**
   * @param id string
   */
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    // delete order means revert its effect which is decreasing some products stock
    // and as we know order take snapshot of the product while adding it
    // so what if the order buy/sell price get changed do i still accept the delete?
    // TODO for now i will accept but need to ask our users what do they expect from this functionality

    const prisma = new PrismaClient();
    return await prisma.$transaction(async (tx) => {
      // delete order and return its products
      const o = await tx.order.delete({
        where: {
          id: input,
        },
        include: {
          products: true,
        },
      });

      // re-add the stock to the products
      await Promise.all(
        o.products.map((p) => {
          return tx.product.update({
            where: {
              id: p.productId,
            },
            data: {
              stock: {
                increment: p.quantity,
              },
            },
          });
        })
      );
      return o;
    });
  }),
  anal: protectedProcedure.query(async ({ ctx }) => {
    /**
     * prisma don't yet support using db native function inside the group by so need to use rawQuery, for more information
     * @link https://github.com/prisma/prisma/discussions/11692
     */
    const res = await ctx.prisma.$queryRaw`
          select Date(O."createdAt"), sum(PO."sellPriceAtSale" - PO."buyPriceAtSale")
          from "Order" AS O
          inner join "ProductsOnOrder" AS PO
          on O.id = PO."orderId"
          group by Date(O."createdAt");
      `;
    return res;
  }),
});
