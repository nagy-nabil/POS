import { useTheme } from 'next-themes'
import React, { useState } from "react";
import type { GetStaticPropsContext } from "next";
import dynamic from "next/dynamic";
import { api } from "@/utils/api";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// import * as charts from "react-charts";
import type { AxisOptions, Chart as ChartType } from "react-charts";
import { FiDollarSign } from 'react-icons/fi'

import { type NextPageWithProps } from "../_app";
import { generateInputDateValue } from "@/utils/date";
// import { Button } from "@/components/ui/button";
// import { CgSpinner } from "react-icons/cg";
import { GiProfit } from "react-icons/gi";

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
  const {theme} = useTheme();
  return (
    <div className=" flex h-96 w-full shrink-0 flex-col gap-3 overflow-x-auto rounded-2xl border-2 border-gray-600 p-3 text-black dark:text-white shadow-xl">
      <h2 className="text-2xl font-bold">{props.label}</h2>
      <div className="h-96 w-[600px]">
        <Chart
          options={{
            data: props.data,
            primaryAxis: props.primaryAxis,
            secondaryAxes: props.secondaryAxes,
            dark: theme === "dark"? true : undefined
          }}
        />
      </div>
    </div>
  );
}

const Anal: NextPageWithProps = () => {
  const { t } = useTranslation("analysis");
  // always would be the time at midnight(start of a day)
  const [fromDate, setFromDate] = useState<Date>(() => {
    const localTimestamp = new Date();
    localTimestamp.setDate(localTimestamp.getDate() - 10);
    localTimestamp.setHours(0, 0, 0, 0);
    return localTimestamp;
  });
  // always need to be the end of day (time at 11:59:59:999)
  const [toDate, setToDate] = useState<Date>(() => {
    const localTimestamp = new Date();
    localTimestamp.setHours(23, 59, 59, 999);
    return localTimestamp;
  });

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
  const anal = api.orders.anal.useQuery({from: fromDate, to: toDate}, {
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return true;
    },
  });

  const dashboardStat = api.dashboard.revenue.useQuery();

  if (anal.isError) {
    return <p>{JSON.stringify(anal.error)}</p>;
  }
  if (dashboardStat.isError) {
    return <p>{JSON.stringify(dashboardStat.error)}</p>;
  }

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden px-4">
        <div className="w-full flex flex-wrap justify-between ">
        <div className="border flex flex-col text-2xl p-3 w-2/4 h-fit">
          <span className="flex gap-3 justify-start items-center "><FiDollarSign className="p-1 rounded-sm border w-fit h-fit" size={20}  />
            Revenue</span>
          <span className="font-bold">{dashboardStat.data?.revenue?.toFixed(2) ?? 0}</span>
        </div>
        <div className="border flex flex-col text-2xl p-3 w-2/4 h-fit">
          <span className="flex gap-3 justify-start items-center "><GiProfit className="p-1 rounded-sm border w-fit h-fit"  size={20}/>
            Profit</span>
          <span className="font-bold">{anal.data?.reduce((prev, cur) => prev + cur.profitDaily, 0).toFixed(2) ?? 0}</span>
        </div>
        </div>
        <div className="mt-5 flex h-screen flex-col gap-4 overflow-y-auto">
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
              className="bg-primary text-primary-foreground hover:bg-primary/90
 rounded-xl border-none p-3 text-xl "
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
              className="bg-primary text-primary-foreground hover:bg-primary/90
 rounded-xl border-none p-3 text-xl "
            />
          </label>
          {/* <Button */}
          {/*   type="button" */}
          {/*   variant={"default"} */}
          {/*   disabled={anal.isLoading } */}
          {/*     onClick={() => anal.refetch()} */}
          {/*   className="w-1/2 m-auto" */}
          {/* > */}
          {/*   {anal.isLoading ? ( */}
          {/*     <CgSpinner className="animate-spin text-2xl" /> */}
          {/*   ) : ( */}
          {/*     t("orderHistory.action") */}
          {/*   )} */}
          {/* </Button> */}
        </div>
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
