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
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type NextPageWithLayout } from "./_app";
import Layout from "@/components/layout";
import { useMemo, type ReactElement } from "react";
import { type Product } from "@prisma/client";
import { useAuth } from "@/hooks/useAuth";
import ProductModal from "@/components/modal/productModal";
import { type GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { dateFormater } from "@/utils/date";
import { fuzzyFilter } from "@/components/table/helpers";
import IndeterminateCheckbox from "@/components/form/indeterminateCheckbox";
import TableUtils from "@/components/table/utils";
import TableBody from "@/components/table/body";
import Head from "next/head";

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
        header: () => <span>ID</span>,
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("name", {
        header: () => <span>Name</span>,
        cell: (info) => info.getValue(),
        filterFn: "fuzzy",
      }),
      columnHelper.accessor("buyPrice", {
        header: () => <span>Buy Price</span>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("sellPrice", {
        header: () => <span>Sell Price</span>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("stock", {
        header: () => <span>Stock</span>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: () => <span>Created At</span>,
        cell: (info) => dateFormater.format(info.getValue()),
        enableColumnFilter: false,
      }),
    ],
    []
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
          <ProductModal defaultValues={{}} operationType="post" />
          {Object.keys(rowSelection).length === 1 ? (
            <ProductModal
              key={"updateProduct"}
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

const ProductTable: NextPageWithLayout = () => {
  const { token, setToken } = useAuth({ noExistRedirectTo: "/signin" });
  const productsQuery = api.products.getMany.useQuery(undefined, {
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
          <h1 className="text-4xl">Products</h1>
        </header>
        {productsQuery.data && <Table data={productsQuery.data} />}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

ProductTable.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

export default ProductTable;
