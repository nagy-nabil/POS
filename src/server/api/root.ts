import { categoriesRouter } from "@/server/api/routers/category";
import { expensesRouter } from "@/server/api/routers/expenses";
import { helpersRouter } from "@/server/api/routers/helpers";
import { lossesRouter } from "@/server/api/routers/losses";
import { offeresRouter } from "@/server/api/routers/offers";
import { ordersRouter } from "@/server/api/routers/order";
import { productsRouter } from "@/server/api/routers/product";
import { usersRouter } from "@/server/api/routers/user";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  orders: ordersRouter,
  categories: categoriesRouter,
  users: usersRouter,
  helpers: helpersRouter,
  expenses: expensesRouter,
  losses: lossesRouter,
  offers: offeresRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
