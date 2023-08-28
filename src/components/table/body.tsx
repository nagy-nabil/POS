import { flexRender } from "@tanstack/react-table";
import { type Table } from "@tanstack/table-core";
import clsx from "clsx";
import React from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { Filter } from "./helpers";

export type TableBodyProps<T> = {
  table: Table<T>;
};
export default function TableBody<T>({ table }: TableBodyProps<T>) {
  return (
    <table
      className="w-full border-collapse border border-slate-400 bg-white shadow-sm h-fit"
      {...{
        style: {
          width: table.getCenterTotalSize(),
        },
      }}
    >
      <thead className="bg-slate-50">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr className="h-8 w-fit whitespace-nowrap" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={clsx(
                  "relative border border-slate-300 p-2 text-left  font-semibold text-slate-900",
                  {
                    "cursor-pointer select-none": header.column.getCanSort(),
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
                      "bg-blue-700 opacity-100": header.column.getIsResizing(),
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
              const header = headers?.find((h) => h.id === cell.column.id);
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  <div
                    className={clsx(
                      "after:content-'' absolute bottom-0 right-0 top-0 z-10 w-1 cursor-col-resize touch-none select-none ",
                      {
                        " bg-blue-700 opacity-100": cell.column.getIsResizing(),
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
  );
}
