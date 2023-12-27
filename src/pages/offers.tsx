import React, { useMemo } from "react";
import type { GetStaticPropsContext } from "next";
import IndeterminateCheckbox from "@/components/form/indeterminateCheckbox";
import ConfirmModal from "@/components/modal/confirm";
import OfferModal from "@/components/modal/offerModal";
import { OfferDisplay } from "@/components/offerDisplay";
import TableBody from "@/components/table/body";
import { fuzzyFilter } from "@/components/table/helpers";
import TableUtils from "@/components/table/utils";
import { api } from "@/utils/api";
import { dateFormater } from "@/utils/date";
import type { Offer } from "@prisma/client";
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
import { AiOutlineDelete } from "react-icons/ai";
import { CgSpinner } from "react-icons/cg";

import { type NextPageWithProps } from "./_app";

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

const columnHelper = createColumnHelper<Offer>();

function Table(props: { data: Offer[] }) {
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
      minSize: 200,
    },
  });

  const utils = api.useContext();
  const offerDelete = api.offers.delete.useMutation({
    onSuccess(_, variables) {
      setRowSelection({});
      utils.offers.index.setData(undefined, (prev) =>
        prev
          ? [
              ...prev.filter(
                (i) => variables.findIndex((i2) => i.id === i2) === -1
              ),
            ]
          : []
      );
    },
  });

  if (typeof window === "undefined") return null;

  return (
    <div className="w-full flex h-fit flex-col">
      {/* item utils*/}
      <div className="flex justify-start gap-3">
        <OfferModal defaultValues={{}} operationType="post" />
        {Object.keys(rowSelection).length === 1 ? (
          <OfferModal
            key={"offermodal"}
            // @ts-ignore
            defaultValues={props.data[+Object.keys(rowSelection)[0]]}
          />
        ) : null}
        <ConfirmModal
          bodyMessage="Are you sure you want to delete this offer, you cannot undo?"
          header="Delete Offer"
          onOk={() => {
            offerDelete.mutate(
              Object.keys(rowSelection).map((itm) => props.data[+itm]?.id)
            );
          }}
          onCancel={() => {
            console.log("cancel");
          }}
          buttonChildren={
            offerDelete.isLoading ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : (
              <AiOutlineDelete className="m-auto h-fit w-fit    p-2 text-3xl" />
            )
          }
          buttonAttrs={{
            disabled:
              offerDelete.isLoading || Object.keys(rowSelection).length === 0,
            className: "text-red-600 disabled:text-gray-500",
          }}
        />
      </div>

      <div className="w-full overflow-x-auto">
        <TableBody table={table} />
      </div>

      {/* table utils */}
      <TableUtils table={table} />
    </div>
  );
}

const OfferPage: NextPageWithProps = () => {
  const offerQuery = api.offers.index.useQuery(undefined, {
    staleTime: Infinity,
  });

  return (
    <div className="w-full h-full">
      {offerQuery.data && <Table data={offerQuery.data} />}
      <OfferDisplay />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
};

OfferPage.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default OfferPage;
