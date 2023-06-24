import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import clsx from "clsx";
import { type NextPageWithLayout } from "./_app";
import Layout from "@/components/layout";
import { useMemo, type ReactElement, HTMLProps } from "react";
import { type Product } from "@prisma/client";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
const ProductTable: NextPageWithLayout = () => {
  return (
    <>
      <div className="mx-auto">
        <App />
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
const dateFormater = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default ProductTable;
import React from "react";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  flexRender,
  createColumnHelper,
  type FilterFn,
  type ColumnFiltersState,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  type Column,
  type Table,
} from "@tanstack/react-table";
import { type RankingInfo, rankItem } from "@tanstack/match-sorter-utils";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<unknown> = (row, columnId, value, addMeta) => {
  // Rank the item
  // eslint-disable-next-line
  const itemRank = rankItem(row.getValue(columnId), value as string);

  // Store the itemRank info
  addMeta({
    // eslint-disable-next-line
    itemRank,
  });

  // Return if the item should be filtered in/out
  // eslint-disable-next-line
  return itemRank.passed;
};

import { api } from "@/utils/api";

const defaultData: Product[] = [
  {
    id: "1",
    name: "Product 1",
    buyPrice: 40,
    sellPrice: 100,
    stock: 30,
    createdAt: new Date(),
    categoryId: "1",
    createdById: "1",
    image: "https://picsum.photos/200/300",
  },
  {
    id: "2",
    name: "Product 2",
    buyPrice: 100,
    sellPrice: 200,
    stock: 100,
    createdAt: new Date(),
    categoryId: "2",
    createdById: "1",
    image: "https://picsum.photos/200/300",
  },
  {
    id: "3",
    name: "Product 3",
    buyPrice: 3000,
    sellPrice: 3200,
    stock: 20,
    createdAt: new Date(),
    categoryId: "3",
    createdById: "2",
    image: "https://picsum.photos/200/300",
  },
];

const columnHelper = createColumnHelper<Product>();
// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
function Filter<TColumn, TTable>({
  column,
  table,
}: {
  column: Column<TColumn, unknown>;
  table: Table<TTable>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = React.useMemo(
    () =>
      // eslint-disable-next-line
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [column.getFacetedUniqueValues()]
  );
  const width = column.getSize() - 10 > 100 ? column.getSize() - 10 : 100;
  return typeof firstValue === "number" ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          style={{
            width: `${width / 2}px`,
          }}
          placeholder={`Min ${
            column.getFacetedMinMaxValues()?.[0]
              ? // eslint-disable-next-line
                `(${column.getFacetedMinMaxValues()?.[0]})`
              : ""
          }`}
          className="rounded border shadow"
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max ${
            column.getFacetedMinMaxValues()?.[1]
              ? // eslint-disable-next-line
                `(${column.getFacetedMinMaxValues()?.[1]})`
              : ""
          }`}
          style={{
            width: `${width / 2}px`,
          }}
          className="rounded border shadow"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.slice(0, 5000).map((value: unknown) => (
          <option value={value as string} key={value as string} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        className="rounded border shadow"
        style={{
          width: `${width}px`,
        }}
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  );
}
function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      if (ref.current) {
        ref.current.indeterminate = !rest.checked && indeterminate;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
}
function App() {
  const products = api.products.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
    initialData: [],
  });
  const [data, setData] = React.useState(() => [...defaultData]);
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
    data,
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
    <div className="flex flex-col items-center justify-center gap-10 px-2 py-14">
      <h2 className="text-2xl">Products</h2>
      <div className="w-screen">
        <div className="w-full overflow-x-auto">
          <table
            className="w-fit border-collapse border border-slate-400 bg-white shadow-sm "
            {...{
              style: {
                width: table.getCenterTotalSize(),
              },
            }}
          >
            <thead className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  className="h-8 w-fit whitespace-nowrap"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      className={clsx(
                        "relative border border-slate-300 p-2 text-left  font-semibold text-slate-900",
                        {
                          "cursor-pointer select-none":
                            header.column.getCanSort(),
                        }
                      )}
                      key={header.id}
                      {...{
                        colSpan: header.colSpan,
                        style: {
                          width: header.getSize(),
                        },
                      }}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {(header.column.getCanSort() &&
                            {
                              asc: (
                                <FaSortUp
                                  onClick={header.column.getToggleSortingHandler()}
                                />
                              ),
                              desc: (
                                <FaSortDown
                                  onClick={header.column.getToggleSortingHandler()}
                                />
                              ),
                            }[header.column.getIsSorted() as string]) ?? (
                            <FaSort
                              onClick={header.column.getToggleSortingHandler()}
                            />
                          )}
                        </div>
                        <div className="h-6">
                          {header.column.getCanFilter() ? (
                            <div>
                              <Filter column={header.column} table={table} />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div
                        className={clsx(
                          "absolute bottom-0 right-0 top-0 w-1 cursor-col-resize touch-none select-none",
                          {
                            "bg-blue-700 opacity-100":
                              header.column.getIsResizing(),
                          },
                          {
                            "opacity-0": !header.column.getIsResizing(),
                          }
                        )}
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                        }}
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const headers = cell
                      .getContext()
                      .table.getHeaderGroups()[0]?.headers;
                    const header = headers?.find(
                      (h) => h.id === cell.column.id
                    );
                    return (
                      <td
                        className="relative overflow-auto border border-slate-300 text-center text-slate-500"
                        key={cell.id}
                        {...{
                          style: {
                            width: cell.column.getSize(),
                          },
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                        <div
                          className={clsx(
                            "after:content-'' absolute bottom-0 right-0 top-0 z-10 w-1 cursor-col-resize touch-none select-none ",
                            {
                              " bg-blue-700 opacity-100":
                                cell.column.getIsResizing(),
                            },
                            {
                              "opacity-0": !cell.column.getIsResizing(),
                            }
                          )}
                          {...{
                            onMouseDown: header?.getResizeHandler(),
                            onTouchStart: header?.getResizeHandler(),
                          }}
                        ></div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
