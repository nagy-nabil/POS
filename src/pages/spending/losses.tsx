import React, { useMemo, type ReactElement } from "react";
import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import IndeterminateCheckbox from "@/components/form/indeterminateCheckbox";
import Layout from "@/components/layout";
import LossesModal from "@/components/modal/lossesModal";
import TableBody from "@/components/table/body";
import { fuzzyFilter } from "@/components/table/helpers";
import TableUtils from "@/components/table/utils";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/utils/api";
import { dateFormater } from "@/utils/date";
import { type Loss } from "@prisma/client";
import { type RankingInfo } from "@tanstack/match-sorter-utils";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createColumnHelper,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
} from "@tanstack/react-table";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

import { type NextPageWithLayout } from "../_app";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"], null, [
        "en",
        "ar",
      ])),
      // Will be passed to the page component as props
    },
  };
}

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const columnHelper = createColumnHelper<Loss>();

function Table(props: { data: Loss[] }) {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <div className="relative m-auto">
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      }),
      columnHelper.accessor("id", {
        header: () => <span>{t("table.common.id")}</span>,
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("name", {
        header: () => <span>{t("table.common.name")}</span>,
        cell: (info) => info.getValue(),
        filterFn: "fuzzy",
      }),
      columnHelper.accessor("description", {
        header: () => <span>{t("table.loss.description")}</span>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("additionalAmount", {
        header: () => <span>{t("table.loss.additionalAmount")}</span>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: () => <span>{t("table.common.createdAt")}</span>,
        cell: (info) => dateFormater.format(info.getValue()),
        enableColumnFilter: false,
      }),
    ],
    [t]
  );

  const table = useReactTable({
    data: props.data,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    columns,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getPaginationRowModel: getPaginationRowModel(),

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    defaultColumn: {
      minSize: 200,
    },
  });

  if (typeof window === "undefined") return null;

  return (
    <div className="mt-3 flex flex-col">
      <div className="w-screen">
        {/* item utils*/}
        <div className="flex justify-start gap-3">
          {/* <ProductModal defaultValues={{}} operationType="post" />
          {Object.keys(rowSelection).length === 1 ? (
            <ProductModal
              key={"updateProduct"}
              operationType="put"
              // @ts-ignore
              defaultValues={props.data[+Object.keys(rowSelection)[0]]}
            />
          ) : null} */}
        </div>

        <div className="w-full overflow-x-auto">
          <TableBody table={table} />
        </div>

        {/* table utils */}
        <TableUtils table={table} />
      </div>
    </div>
  );
}

const Spending: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const { token, setToken } = useAuth({ noExistRedirectTo: "/signin" });
  const lossQuery = api.losses.getMany.useQuery(undefined, {
    staleTime: Infinity,
    enabled: !!token,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        setToken("").catch((e) => {
          throw e;
        });
        return false;
      }
      return true;
    },
  });

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="w-screen">
        <header className="mt-2 flex items-center justify-around">
          <h1 className="text-4xl">{t("pages.spending.header")}</h1>
        </header>
        <LossesModal defaultValues={{}} operationType="post" />
        {lossQuery.data && <Table data={lossQuery.data} />}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Spending.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

export default Spending;
