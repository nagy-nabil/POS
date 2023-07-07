import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import CategoryModal from "@/components/modal/categoryModal";
import { useMemo, type ReactElement } from "react";
import Layout from "@/components/layout";
import { type NextPageWithLayout } from "./_app";
import { useAuth } from "@/hooks/useAuth";
import { type GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { api } from "@/utils/api";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  createColumnHelper,
  type FilterFn,
  type ColumnFiltersState,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { type RankingInfo } from "@tanstack/match-sorter-utils";
import React from "react";
import { type Category } from "@prisma/client";
import { dateFormater } from "@/utils/date";
import { fuzzyFilter } from "@/components/table/helpers";
import IndeterminateCheckbox from "@/components/form/indeterminateCheckbox";
import TableBody from "@/components/table/body";
import TableUtils from "@/components/table/utils";
import Head from "next/head";
import { useTranslation } from "react-i18next";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"])),
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

const columnHelper = createColumnHelper<Category>();

function Table(props: { data: Category[] }) {
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
      minSize: 150,
    },
  });

  if (typeof window === "undefined") return null;

  return (
    <div className="mt-3 flex flex-col">
      <div className="w-screen">
        {/* item utils*/}
        <div className="flex justify-start gap-3">
          <CategoryModal
            key="createCategory"
            defaultValues={{}}
            operationType="post"
          />
          {Object.keys(rowSelection).length === 1 ? (
            <CategoryModal
              key={"updateCategory"}
              operationType="put"
              // @ts-ignore
              defaultValues={props.data[+Object.keys(rowSelection)[0]]}
            />
          ) : null}
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

const Category: NextPageWithLayout = () => {
  const { token, setToken } = useAuth({ noExistRedirectTo: "/signin" });
  const categoryQuery = api.categories.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
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
          <h1 className="text-4xl">Category</h1>
        </header>
        {categoryQuery.data && <Table data={categoryQuery.data} />}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Category.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

export default Category;
