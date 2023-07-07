import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTranslation } from "next-i18next";
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
import React from "react";
// import * as charts from "react-charts";
import type { Chart as ChartType, AxisOptions } from "react-charts";
import dynamic from "next/dynamic";
import { CgSpinner } from "react-icons/cg";
const Chart = dynamic(() => import("react-charts").then((mod) => mod.Chart), {
  ssr: false,
}) as typeof ChartType;

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, [
        "common",
        "analysis",
      ])),
      // Will be passed to the page component as props
    },
  };
}

type DateSum = {
  date: Date;
  profitDaily: number;
  soldDaily: number;
};

type Series = {
  label: string;
  data: DateSum[];
};

// const data: Series[] = [
//   {
//     label: "React Charts",
//     data: [
//       {
//         date: new Date(),
//         sum: 202123,
//       },
//       {
//         date: new Date("2023-07-11"),
//         sum: 2021232,
//       },
//       {
//         date: new Date("2023-07-12"),
//         sum: 402123,
//       },
//       {
//         date: new Date("2023-07-13"),
//         sum: 902123,
//       },
//       // ...
//     ],
//   },
// ];

function ChartLine(props: {
  data: Series[];
  label: string;
  primaryAxis: AxisOptions<DateSum>;
  secondaryAxes: AxisOptions<DateSum>[];
}) {
  return (
    <div className=" flex h-96 w-full shrink-0 flex-col gap-3 overflow-x-auto rounded-2xl border-2 border-gray-600 p-3 text-black shadow-xl">
      <h2 className="text-2xl font-bold">{props.label}</h2>
      <div className="h-96 w-[600px]">
        <Chart
          options={{
            data: props.data,
            primaryAxis: props.primaryAxis,
            secondaryAxes: props.secondaryAxes,
          }}
        />
      </div>
    </div>
  );
}

const Anal: NextPageWithLayout = () => {
  const { t } = useTranslation("analysis");
  const { setToken } = useAuth({ noExistRedirectTo: "/signin" });
  const profitPrimaryAxis = React.useMemo(
    (): AxisOptions<DateSum> => ({
      getValue: (datum) => datum.date,
    }),
    []
  );

  const profitSecondaryAxes = React.useMemo(
    (): AxisOptions<DateSum>[] => [
      {
        getValue: (datum) => datum.profitDaily,
      },
    ],
    []
  );
  const soldSecondaryAxes = React.useMemo(
    (): AxisOptions<DateSum>[] => [
      {
        getValue: (datum) => datum.soldDaily,
      },
    ],
    []
  );

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
  let totalSold = 0;

  const orderQuery = api.orders.getMany.useQuery(
    {
      from: fromDate,
      to: toDate,
    },
    {
      enabled: false,
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
  const anal = api.orders.anal.useQuery(undefined, {});

  if (orderQuery.isError) {
    return <p>{JSON.stringify(orderQuery.error)}</p>;
  }

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="flex h-screen w-full flex-col overflow-hidden px-4">
        <header className="m-auto mb-8">
          <h1 className="text-5xl">{t("header")}</h1>
        </header>

        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between gap-2 text-2xl">
            {t("orderHistory.from")}
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
            {t("orderHistory.to")}
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
          <button
            type="button"
            className="m-auto h-fit w-fit rounded-2xl bg-gray-600 p-3 text-white"
            onClick={() => orderQuery.refetch()}
            disabled={orderQuery.isLoading && orderQuery.fetchStatus !== "idle"}
          >
            {orderQuery.isLoading && orderQuery.fetchStatus !== "idle" ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : (
              t("orderHistory.action")
            )}
          </button>
        </div>

        {/* order display */}
        <div className="mt-5 flex h-screen flex-col gap-4 overflow-y-auto">
          {/* <ChartLine /> */}
          {anal.data !== undefined && (
            <>
              <ChartLine
                key={"sold-daily"}
                label={t("graphs.sold")}
                data={[
                  {
                    label: "sold-daily",
                    data: anal.data,
                  },
                ]}
                primaryAxis={profitPrimaryAxis}
                secondaryAxes={soldSecondaryAxes}
              />
              <ChartLine
                key={"profit-daily"}
                label={t("graphs.profit")}
                data={[
                  {
                    label: "dailyProfit",
                    data: anal.data,
                  },
                ]}
                primaryAxis={profitPrimaryAxis}
                secondaryAxes={profitSecondaryAxes}
              />
            </>
          )}
          {orderQuery.data?.map((order) => {
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
