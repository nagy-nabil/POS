import React, { useState } from "react";
import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import OrderDisplay from "@/components/orderDisplay";
import { Accordion } from "@/components/ui/accordion";
import { PaginationUtis, usePagination } from "@/hooks/usePagination";
import { api } from "@/utils/api";
import { generateInputDateValue } from "@/utils/date";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { CgSpinner } from "react-icons/cg";

import { type NextPageWithProps } from "../_app";

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

const History: NextPageWithProps = () => {
  const { t } = useTranslation("analysis");

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

  const orderQuery = api.orders.getMany.useQuery(
    {
      from: fromDate,
      to: toDate,
    },
    {
      enabled: false,
      retry(_failureCount, error) {
        if (error.data?.code === "UNAUTHORIZED") {
          return false;
        }
        return true;
      },
    }
  );

  const ordersPage = usePagination({
    data: orderQuery.data?.orders ?? [],
    length: 20,
  });

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
          <h1 className="text-5xl">{t("orderHistory.header")}</h1>
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
          <Accordion type="multiple">
            {ordersPage.values.map((order) => {
              return (
                <OrderDisplay
                  key={order.id}
                  {...order}
                  refetch={orderQuery.refetch}
                />
              );
            })}
          </Accordion>
          {orderQuery.data?.orders.length === 0
            ? "no orders try adding one from sales page"
            : null}
        </div>
        <p className="border-t-2 border-gray-400 p-3 text-2xl text-green-700">
          Total Sold: {orderQuery.data?.total || 0}$
        </p>
        <PaginationUtis {...ordersPage} />
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

History.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default History;
