import React, { useMemo } from "react";
import { type GetStaticPropsContext } from "next";
import Head from "next/head";
import IndeterminateCheckbox from "@/components/form/indeterminateCheckbox";
import ProductModal from "@/components/modal/productModal";
import TableBody from "@/components/table/body";
import { fuzzyFilter } from "@/components/table/helpers";
import TableUtils from "@/components/table/utils";
import { api } from "@/utils/api";
import { dateFormater } from "@/utils/date";
import { type Product } from "@prisma/client";
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

import { type NextPageWithProps } from "./_app";

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

const columnHelper = createColumnHelper<Product>();

function Table(props: { data: Product[] }) {
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
      columnHelper.accessor("buyPrice", {
        header: () => <span>{t("table.product.buyPrice")}</span>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("sellPrice", {
        header: () => <span>{t("table.product.sellPrice")}</span>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("stock", {
        header: () => <span>{t("table.product.stock")}</span>,
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
      minSize: 150,
    },
  });

  if (typeof window === "undefined") return null;

  return (
    <div className="flex flex-col w-full ">
        {/* item utils*/}
        <div className="flex justify-start gap-3">
          <ProductModal defaultValues={{}} operationType="post" />
          {Object.keys(rowSelection).length === 1 ? (
            <ProductModal
              key={"updateProduct"}
              operationType="put"
              // @ts-ignore
              defaultValues={props.data[+Object.keys(rowSelection)[0]]}
              afterSuccess={() => {
                table.setRowSelection({});
              }}
            />
          ) : null}
        </div>

        <div className="w-full overflow-x-auto">
          <TableBody table={table} />
        </div>

        {/* table utils */}
        <TableUtils table={table} />
    </div>
  );
}

const ProductTable: NextPageWithProps = () => {
  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
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
      <div className="w-full">
        {productsQuery.data && <Table data={productsQuery.data} />}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

ProductTable.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default ProductTable;
