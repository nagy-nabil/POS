import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { api } from "@/utils/api";
import { type NextPageWithLayout } from "./_app";
import { useState, type ReactElement } from "react";
import Layout from "@/components/layout";
import OrderDisplay from "@/components/orderDisplay";
import { useAuth } from "@/hooks/useAuth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import { generateInputDateValue } from "@/utils/date";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  console.log("🪵 [index.tsx:29] ~ token ~ \x1b[0;32mlocale\x1b[0m = ", locale);
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"])),
      // Will be passed to the page component as props
    },
  };
}

const Anal: NextPageWithLayout = () => {
  const { setToken } = useAuth({ noExistRedirectTo: "/signin" });
  // always would be the time at midnight(start of a day)
  const [fromDate, setFromDate] = useState<Date>(() => {
    const localTimestamp = new Date();
    localTimestamp.setHours(0, 0, 0, 0);
    return localTimestamp;
  });
  // always need to be the end of day (time at 11:59:59:999)
  const [toDate, setToDate] = useState<Date>(() => {
    const localTimestamp = new Date();
    localTimestamp.setHours(23, 59, 59, 999);
    return localTimestamp;
  });
  console.log("from", generateInputDateValue(fromDate));
  console.log("to", generateInputDateValue(toDate));
  let totalSold = 0;

  const orderQuery = api.orders.getMany.useQuery(
    {
      from: fromDate,
      to: toDate,
    },
    {
      retry(_failureCount, error) {
        if (error.data?.code === "UNAUTHORIZED") {
          setToken("").catch((e) => {
            throw e;
          });
          return false;
        }
        return true;
      },
    }
  );
  const anal = api.orders.anal.useQuery();
  console.log(anal.data);

  if (orderQuery.isLoading) return <p>loading ...</p>;
  else if (orderQuery.isError) {
    return <p>{JSON.stringify(orderQuery.error)}</p>;
  }

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
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
              // yyyy-mm-dd
              value={generateInputDateValue(fromDate)}
              onChange={(e) =>
                setFromDate(() => {
                  const d = new Date(e.target.value);
                  d.setHours(0, 0, 0, 0);
                  return d;
                })
              }
              className="rounded-xl border-none bg-gray-600 p-3 text-xl text-white"
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-2xl">
            to
            <input
              value={generateInputDateValue(toDate)}
              onChange={(e) =>
                setToDate(() => {
                  const d = new Date(e.target.value);
                  d.setHours(23, 59, 59, 999);
                  return d;
                })
              }
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
