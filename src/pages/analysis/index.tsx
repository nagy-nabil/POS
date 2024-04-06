import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTheme } from 'next-themes'
import React, { useState } from "react";
import type { GetStaticPropsContext } from "next";
import dynamic from "next/dynamic";
import { api } from "@/utils/api";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { AxisOptions, Chart as ChartType } from "react-charts";
import { type NextPageWithProps } from "../_app";
import { generateInputDateValue } from "@/utils/date";
import { GiProfit } from "react-icons/gi";
import { Input } from '@/components/ui/input';


import { DollarSign } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


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
  const { theme } = useTheme();
  return (
    <div className=" flex h-96 w-full shrink-0 flex-col gap-3 overflow-x-auto rounded-2xl border-2 border-gray-600 p-3 text-black dark:text-white shadow-xl">
      <h2 className="text-2xl font-bold">{props.label}</h2>
      <div className="h-96 w-[600px]">
        <Chart
          options={{
            data: props.data,
            primaryAxis: props.primaryAxis,
            secondaryAxes: props.secondaryAxes,
            dark: theme === "dark" ? true : undefined
          }}
        />
      </div>
    </div>
  );
}

const Anal: NextPageWithProps = () => {
  const { t } = useTranslation("analysis");
  const [proId, setProId] = useState("");
  // always would be the time at midnight(start of a day)
  const [fromDate, setFromDate] = useState<Date>(() => {
    const localTimestamp = new Date();
    // default is start of the month
    localTimestamp.setDate(1);
    localTimestamp.setHours(0, 0, 0, 0);
    return localTimestamp;
  });
  // always need to be the end of day (time at 11:59:59:999)
  const [toDate, setToDate] = useState<Date>(() => {
    const localTimestamp = new Date();
    localTimestamp.setHours(23, 59, 59, 999);
    return localTimestamp;
  });
  console.log(fromDate, toDate);
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
  const anal = api.orders.anal.useQuery({ from: fromDate, to: toDate }, {
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return true;
    },
  });

  const productHistory = api.dashboard.productHistory.useQuery(proId, {
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return true;
    },
  });
  // TODO, remove this shit
  console.log("product history", productHistory.data)
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
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardStat.data?.revenue?.toFixed(2) ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <GiProfit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${anal.data?.reduce((prev, cur) => prev + cur.profitDaily, 0).toFixed(2) ?? 0}</div>
            </CardContent>
          </Card>
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
          <div className="flex flex-col">
            <h1>Show One Product History</h1>
            {/*TODO: convert to select with search to easily find the product*/}
            <Input value={proId} onChange={(event) => {
              setProId(event.target.value);
            }} placeholder="product Id" />
            <div>
              <p> product name: {productHistory.data?.name}</p>
              <p> product stock: {productHistory.data?.stock}</p>
              <p> product current buy price: {productHistory.data?.buyPrice}</p>
              <p> product current sell price: {productHistory.data?.sellPrice}</p>
              <h2>History</h2>
              <Table>
                <TableHeader >
                  <TableRow>
                    <TableHead className="w-[100px]">order id
                    </TableHead>
                    <TableHead >
                      time
                    </TableHead>
                    <TableHead>
                      quantity
                    </TableHead>
                    <TableHead> buy price
                    </TableHead>
                    <TableHead>
                      sell price
                    </TableHead>
                    <TableHead>
                      total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productHistory.data?.orders.map((order) => {
                    return (
                      <TableRow
                        key={order.order.id}
                      >
                        <TableHead
                          scope="row"
                        >
                          {order.order.id}
                        </TableHead>
                        <TableCell >{order.order.createdAt.toLocaleString()}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          {order.buyPriceAtSale} $
                        </TableCell>
                        <TableCell>{order.sellPriceAtSale} $</TableCell>
                        <TableCell>{order.quantity * order.sellPriceAtSale} $</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

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
