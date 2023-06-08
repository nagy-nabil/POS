import { createTRPCRouter } from "@/server/api/trpc";
import { productsRouter } from "@/server/api/routers/product";
import { ordersRouter } from "@/server/api/routers/order";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  orders: ordersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
