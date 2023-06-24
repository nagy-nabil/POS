import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { api } from "@/utils/api";
import { type NextPageWithLayout } from "./_app";
import { useState, type ReactElement } from "react";
import Layout from "@/components/layout";
import OrderDisplay from "@/components/orderDisplay";

const Anal: NextPageWithLayout = () => {
  const date = new Date();
  const [fromDate, setFromDate] = useState<Date>(
    new Date(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const [toDate, setToDate] = useState<Date>(date);
  let totalSold = 0;
  const orderQuery = api.orders.getMany.useQuery({
    from: fromDate,
    to: toDate,
  });

  if (orderQuery.isLoading) return <p>loading ...</p>;
  else if (orderQuery.isError) {
    return <p>{JSON.stringify(orderQuery.error)}</p>;
  }

  return (
    <>
      <div className="flex h-screen w-full flex-col overflow-hidden px-4">
        <header className="m-auto mb-8">
          <h1 className="text-5xl">Analysis</h1>
        </header>

        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between gap-2 text-2xl">
            from
            <input
              name="from"
              type="date"
              value={fromDate.toISOString().split("T")[0]}
              onChange={(e) => setFromDate(new Date(e.target.value))}
              className="rounded-xl border-none bg-gray-600 p-3 text-xl text-white"
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-2xl">
            to
            <input
              value={toDate.toISOString().split("T")[0]}
              onChange={(e) => setToDate(new Date(e.target.value))}
              name="to"
              type="date"
              className="rounded-xl border-none bg-gray-600 p-3 text-xl text-white"
            />
          </label>
        </div>

        {/* order display */}
        <div className="mt-5 flex h-screen flex-col gap-4 overflow-y-auto">
          {orderQuery.data.map((order) => {
            console.log(order);
            totalSold += order.total;
            return <OrderDisplay key={order.id} {...order} />;
          })}
        </div>
        <p className="border-t-2 border-gray-400 p-3 text-2xl text-green-700">
          Total Sold: {totalSold}$
        </p>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Anal.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

export default Anal;
