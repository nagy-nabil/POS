import React from "react";
import type { GetStaticPropsContext } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { api } from "@/utils/api";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// import * as charts from "react-charts";
import type { AxisOptions, Chart as ChartType } from "react-charts";

import { type NextPageWithProps } from "../_app";

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

const Anal: NextPageWithProps = () => {
  const { t } = useTranslation("analysis");
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

  const anal = api.orders.anal.useQuery(undefined, {
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return true;
    },
  });

  if (anal.isError) {
    return <p>{JSON.stringify(anal.error)}</p>;
  }

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="flex h-full w-full flex-col overflow-hidden px-4">
        {/* order display */}
        <div className="mt-5 flex h-screen flex-col gap-4 overflow-y-auto">
          {/* <ChartLine /> */}
          {anal.data !== undefined && anal.data.length > 0 ? (
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
          ) : (
            "NOT ENOUGH DATA TO SHOW GRAPHS"
          )}
        </div>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Anal.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default Anal;
