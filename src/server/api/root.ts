import { createTRPCRouter } from "@/server/api/trpc";
import { productsRouter } from "@/server/api/routers/product";

export const appRouter = createTRPCRouter({
  products: productsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
