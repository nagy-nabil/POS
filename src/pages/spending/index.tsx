import React, { useMemo, useState } from "react";
import type { GetStaticPropsContext } from "next";
import { FromToDate } from "@/components/form/fromToDate";
import {
  ExpenseModal,
  // ExpensesStoreModal,
  // ExpenseTypeModal,
} from "@/components/modal/expensesModal";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { DataTable } from "@/components/table/dataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExpenseGetMany } from "@/server/api/routers/expenses";
import { api } from "@/utils/api";
import { dateFormater } from "@/utils/date";
import { type ColumnDef } from "@tanstack/react-table";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { CgSpinner } from "react-icons/cg";
import { FiDollarSign } from "react-icons/fi";

import { type NextPageWithProps } from "../_app";

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

// const typesColumnHelper = createColumnHelper<ExpenseTypes>();
// const storeColumnHelper = createColumnHelper<ExpenseStore>();
// const expenseColumnHelper =
// createColumnHelper<ExpenseGetMany["spendings"][number]>();

// function TypesTable(props: { data: ExpenseTypes[] }) {
//   const { t } = useTranslation();
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [rowSelection, setRowSelection] = React.useState({});

//   const columns = useMemo(
//     () => [
//       typesColumnHelper.display({
//         id: "select",
//         header: ({ table }) => (
//           <div className="relative m-auto">
//             <IndeterminateCheckbox
//               {...{
//                 checked: table.getIsAllRowsSelected(),
//                 indeterminate: table.getIsSomeRowsSelected(),
//                 onChange: table.getToggleAllRowsSelectedHandler(),
//               }}
//             />
//           </div>
//         ),
//         cell: ({ row }) => (
//           <div className="px-1">
//             <IndeterminateCheckbox
//               {...{
//                 checked: row.getIsSelected(),
//                 disabled: !row.getCanSelect(),
//                 indeterminate: row.getIsSomeSelected(),
//                 onChange: row.getToggleSelectedHandler(),
//               }}
//             />
//           </div>
//         ),
//       }),
//       typesColumnHelper.accessor("id", {
//         header: () => <span>{t("table.common.id")}</span>,
//         cell: (info) => info.getValue(),
//         enableSorting: false,
//       }),
//       typesColumnHelper.accessor("name", {
//         header: () => <span>{t("table.common.name")}</span>,
//         cell: (info) => info.getValue(),
//         filterFn: "fuzzy",
//       }),
//       typesColumnHelper.accessor("description", {
//         header: () => <span>{t("table.loss.description")}</span>,
//         cell: (info) => info.getValue(),
//       }),
//       typesColumnHelper.accessor("createdAt", {
//         header: () => <span>{t("table.common.createdAt")}</span>,
//         cell: (info) => dateFormater.format(info.getValue()),
//         enableColumnFilter: false,
//       }),
//     ],
//     [t]
//   );

//   const table = useReactTable({
//     data: props.data,
//     columnResizeMode: "onChange",
//     getCoreRowModel: getCoreRowModel(),
//     state: {
//       sorting,
//       columnFilters,
//       rowSelection,
//     },
//     filterFns: {
//       fuzzy: fuzzyFilter,
//     },
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     columns,
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues(),
//     getPaginationRowModel: getPaginationRowModel(),

//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     defaultColumn: {
//       minSize: 200,
//     },
//   });

//   if (typeof window === "undefined") return null;

//   return (
//     <div className="mt-3 flex flex-col">
//       <div className="w-screen">
//         {/* item utils*/}
//         <div className="flex justify-start gap-3">
//           {/* <ProductModal defaultValues={{}} operationType="post" />
//           {Object.keys(rowSelection).length === 1 ? (
//             <ProductModal
//               key={"updateProduct"}
//               operationType="put"
//               // @ts-ignore
//               defaultValues={props.data[+Object.keys(rowSelection)[0]]}
//             />
//           ) : null} */}
//         </div>

//         <div className="w-full overflow-x-auto">
//           <TableBody table={table} />
//         </div>

//         {/* table utils */}
//         <TableUtils table={table} />
//       </div>
//     </div>
//   );
// }

// function StoreTable(props: { data: ExpenseStore[] }) {
//   const { t } = useTranslation();
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [rowSelection, setRowSelection] = React.useState({});

//   const columns = useMemo(
//     () => [
//       storeColumnHelper.display({
//         id: "select",
//         header: ({ table }) => (
//           <div className="relative m-auto">
//             <IndeterminateCheckbox
//               {...{
//                 checked: table.getIsAllRowsSelected(),
//                 indeterminate: table.getIsSomeRowsSelected(),
//                 onChange: table.getToggleAllRowsSelectedHandler(),
//               }}
//             />
//           </div>
//         ),
//         cell: ({ row }) => (
//           <div className="px-1">
//             <IndeterminateCheckbox
//               {...{
//                 checked: row.getIsSelected(),
//                 disabled: !row.getCanSelect(),
//                 indeterminate: row.getIsSomeSelected(),
//                 onChange: row.getToggleSelectedHandler(),
//               }}
//             />
//           </div>
//         ),
//       }),
//       storeColumnHelper.accessor("id", {
//         header: () => <span>{t("table.common.id")}</span>,
//         cell: (info) => info.getValue(),
//         enableSorting: false,
//       }),
//       storeColumnHelper.accessor("name", {
//         header: () => <span>{t("table.common.name")}</span>,
//         cell: (info) => info.getValue(),
//         filterFn: "fuzzy",
//       }),
//       storeColumnHelper.accessor("description", {
//         header: () => <span>{t("table.loss.description")}</span>,
//         cell: (info) => info.getValue(),
//       }),
//       storeColumnHelper.accessor("amount", {
//         header: () => <span>{t("table.expenses.store.amount")}</span>,
//         cell: (info) => info.getValue(),
//       }),
//       storeColumnHelper.accessor("createdAt", {
//         header: () => <span>{t("table.common.createdAt")}</span>,
//         cell: (info) => dateFormater.format(info.getValue()),
//         enableColumnFilter: false,
//       }),
//     ],
//     [t]
//   );

//   const table = useReactTable({
//     data: props.data,
//     columnResizeMode: "onChange",
//     getCoreRowModel: getCoreRowModel(),
//     state: {
//       sorting,
//       columnFilters,
//       rowSelection,
//     },
//     filterFns: {
//       fuzzy: fuzzyFilter,
//     },
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     columns,
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues(),
//     getPaginationRowModel: getPaginationRowModel(),

//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     defaultColumn: {
//       minSize: 200,
//     },
//   });

//   if (typeof window === "undefined") return null;

//   return (
//     <div className="mt-3 flex flex-col">
//       <div className="w-screen">
//         {/* item utils*/}
//         <div className="flex justify-start gap-3">
//           {/* <ProductModal defaultValues={{}} operationType="post" />
//           {Object.keys(rowSelection).length === 1 ? (
//             <ProductModal
//               key={"updateProduct"}
//               operationType="put"
//               // @ts-ignore
//               defaultValues={props.data[+Object.keys(rowSelection)[0]]}
//             />
//           ) : null} */}
//         </div>

//         <div className="w-full overflow-x-auto">
//           <TableBody table={table} />
//         </div>

//         {/* table utils */}
//         <TableUtils table={table} />
//       </div>
//     </div>
//   );
// }
function ExpenseTable(props: { data: ExpenseGetMany["spendings"] }) {
  const { t } = useTranslation();

  const columns: ColumnDef<ExpenseGetMany["spendings"][number]>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.common.id")} />
        ),
        cell: (info) => info.getValue(),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.loss.name")} />
        ),
        cell: (info) => info.getValue(),
        filterFn: "fuzzy",
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("table.loss.description")}
          />
        ),
        cell: (info) => info.getValue(),
        filterFn: "fuzzy",
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("table.loss.additionalAmount")}
          />
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("table.common.createdAt")}
          />
        ),
        cell: (info) => dateFormater.format(info.getValue() as Date),
        enableColumnFilter: false,
      },
    ],
    [t],
  );

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

        <div className="relative w-full overflow-auto">
          <DataTable columns={columns} data={props.data} />
        </div>
      </div>
    </div>
  );
}

const Spending: NextPageWithProps = () => {
  const { t } = useTranslation();
  // const expenseTypesQuery = api.expenses.expenseTypeGetMany.useQuery(
  //   undefined,
  //   {
  //     staleTime: Infinity,
  //     retry(_failureCount, error) {
  //       if (error.data?.code === "UNAUTHORIZED") {
  //         return false;
  //       }
  //       return true;
  //     },
  //   }
  // );
  // const expenseStoreQuery = api.expenses.expenseStoreGetMany.useQuery(
  //   undefined,
  //   {
  //     staleTime: Infinity,
  //     retry(_failureCount, error) {
  //       if (error.data?.code === "UNAUTHORIZED") {
  //         return false;
  //       }
  //       return true;
  //     },
  //   }
  // );
  //

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
  const expenseQuery = api.expenses.expenseGetMany.useQuery(
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
    },
  );

  return (
    <div className="w-screen">
      <div className="flex flex-col gap-3">
        <FromToDate
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
        <Button
          type="button"
          variant={"default"}
          onClick={() => expenseQuery.refetch()}
          disabled={
            expenseQuery.isLoading && expenseQuery.fetchStatus !== "idle"
          }
          className="w-1/2 m-auto"
        >
          {expenseQuery.isLoading && expenseQuery.fetchStatus !== "idle" ? (
            <CgSpinner className="animate-spin text-2xl" />
          ) : (
            t("fromTOComponent.action")
          )}
        </Button>
      </div>
      <ExpenseModal operationType="post" key={"expsfdjs"} />
      <div className="border flex flex-col text-2xl p-3 w-2/4 h-fit">
        <span className="flex gap-3 justify-start items-center ">
          <FiDollarSign
            className="p-1 rounded-sm border w-fit h-fit"
            size={20}
          />
          {t("pages./spending.header")}
        </span>
        <span className="font-bold">
          {expenseQuery.data?.totalAmount.toFixed(2) ?? 0}
        </span>
      </div>
      {expenseQuery.fetchStatus === "idle" && !expenseQuery.data ? (
        t("pages./spending.placeholder")
      ) : expenseQuery.isError ? (
        <p>{expenseQuery.error.message}</p>
      ) : expenseQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <ExpenseTable data={expenseQuery.data.spendings} />
      )}
    </div>
  );
};

Spending.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default Spending;
