import { createTRPCRouter } from "@/server/api/trpc";
import { productsRouter } from "@/server/api/routers/product";
import { ordersRouter } from "@/server/api/routers/order";
import { categoriesRouter } from "@/server/api/routers/category";
import { usersRouter } from "@/server/api/routers/user";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  orders: ordersRouter,
  categories: categoriesRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;