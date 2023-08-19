import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { lossesSchema } from "@/types/entities";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const lossesRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.loss.findMany({
      include: {
        products: true,
      },
    });
  }),

  insertOne: protectedProcedure
    .input(lossesSchema)
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
          input.products.map((p) =>
            tx.product.update({
              where: { id: p.productId },
              data: { stock: { decrement: p.quantity } },
            })
          )
        );

        // construct the create clause for the order and make sure stock gte requested qunatity or throw error
        const createCluse: {
          productId: string;
          quantity: number;
          buyPriceAtLoss: number;
          sellPriceAtLoss: number;
        }[] = input.products.map((inProduct) => {
          const product = products.find(
            (test) => test.id === inProduct.productId
          );
          if (!product) {
            throw new TRPCError({ code: "BAD_REQUEST" });
          }

          // calc order total price as you go
          totalPrice += inProduct.quantity * product.buyPrice;
          return {
            productId: inProduct.productId,
            quantity: inProduct.quantity,
            sellPriceAtLoss: product.sellPrice,
            buyPriceAtLoss: product.buyPrice,
          };
        });

        const loss = await tx.loss.create({
          data: {
            name: input.name,
            description: input.description,
            additionalAmount: input.additionalAmount,
            createdById: ctx.session.user.id,
            products: {
              create: createCluse,
            },
          },
          include: {
            products: {
              select: {
                quantity: true,
                Product: true,
                buyPriceAtLoss: true,
                sellPriceAtLoss: true,
              },
            },
          },
        });

        return {
          ...loss,
          total: totalPrice,
        };
      });

      return res;
    }),
});
