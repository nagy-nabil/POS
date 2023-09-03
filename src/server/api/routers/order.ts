import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { orderSchema } from "@/types/entities";
import { PrismaClient, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const ordersRouter = createTRPCRouter({
  /**
   * note this endpoint depeneds that front send what products suppose to be in an offer might be not good but whatever
   */
  insertOne: protectedProcedure
    .input(orderSchema)
    .mutation(async ({ ctx, input }) => {
      // for the interactive transaction, need new client
      const prisma = new PrismaClient();
      const res = await prisma.$transaction(async (tx) => {
        // decrease products stock by quntity
        // TODO make it in single query
        // https://stackoverflow.com/questions/18797608/update-multiple-rows-in-same-query-using-postgresql
        // https://stackoverflow.com/questions/25674737/update-multiple-rows-with-different-values-in-one-query-in-mysql
        const products = await Promise.all(
          input.products.map((item) =>
            tx.product.update({
              where: { id: item.id },
              data: {
                stock: { decrement: item.quantity + item.quantityFromOffers },
              },
            })
          )
        );

        // construct the create clause for the order relation with products
        // NOTE: is enough stock avaiable checked on the database level, on the previous step
        const createProductCluse: Prisma.OrderCreateInput["products"] = {
          create: input.products
            .filter((pro) => pro.quantity > 0)
            .map((inProduct) => {
              const product = products.find((test) => test.id === inProduct.id);
              if (!product) {
                throw new TRPCError({ code: "BAD_REQUEST" });
              }
              return {
                productId: inProduct.id,
                quantity: inProduct.quantity,
                sellPriceAtSale: product.sellPrice,
                buyPriceAtSale: product.buyPrice,
              };
            }),
        };

        return await tx.order.create({
          data: {
            createdById: ctx.session.user.id,
            products: createProductCluse,
            offers: {
              create: input.offers.map((i) => ({
                offerId: i.id,
                quantity: i.quantity,
              })),
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
      });

      return res;
    }),

  /**
   * get the order history between interval
   */
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
          offers: {
            include: {
              Offer: {
                include: {
                  products: {
                    include: { Product: true },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const ordersWithTotal = orders.map((order) => {
        // Calculate the total price for each order
        const totalPrice =
          order.products.reduce(
            (total, product) =>
              total + product.sellPriceAtSale * product.quantity,
            0
          ) +
          order.offers.reduce(
            (total, offer) =>
              total +
              offer.quantity *
                offer.Offer.products.reduce((prev, pro) => prev + pro.price, 0),
            0
          );
        return {
          ...order,
          total: totalPrice,
        };
      });

      // calc total for all orders
      const total = ordersWithTotal.reduce(
        (prev, order) => prev + order.total,
        0
      );
      return { orders: ordersWithTotal, total };
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
  anal: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      /**
       * prisma don't yet support using db native function inside the group by so need to use rawQuery, for more information
       * @link https://github.com/prisma/prisma/discussions/11692
       */
      const res = await ctx.prisma.$queryRaw`
          select Date(O."createdAt" at time zone 'utc' at time zone 'Africa/Cairo') as date, sum(PO.quantity * (PO."sellPriceAtSale" - PO."buyPriceAtSale")) as "profitDaily", sum(PO.quantity * PO."sellPriceAtSale") as "soldDaily"
          from "Order" AS O
          inner join "ProductsOnOrder" AS PO
          on O.id = PO."orderId"
          where Date(O."createdAt" at time zone 'utc' at time zone 'Africa/Cairo') >= Date(${input.from} at time zone 'utc' at time zone 'Africa/Cairo') and Date(O."createdAt" at time zone 'utc' at time zone 'Africa/Cairo')  <= Date(${input.to} at time zone 'utc' at time zone 'Africa/Cairo') 
          group by date
          order by date DESC
          ;
      `;

      return res as {
        date: Date;
        profitDaily: number;
        soldDaily: number;
      }[];
    }),
});
