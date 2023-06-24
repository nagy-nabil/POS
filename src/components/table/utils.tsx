import React from "react";
import { type Table } from "@tanstack/table-core";
import {
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";

export type TableUtilsProps<T> = {
  table: Table<T>;
};

export default function TableUtils<T>({ table }: TableUtilsProps<T>) {
  return (
    <div className="m-auto flex items-center justify-center">
      <button
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.setPageIndex(0)}
        className="disabled:text-gray-400"
      >
        <AiOutlineDoubleLeft className="h-fit w-fit p-2 text-xl  " />
      </button>
      <button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="disabled:text-gray-400"
      >
        <AiOutlineLeft className="h-fit w-fit p-2 text-xl" />
      </button>
      <p className="font-bold">
        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </p>
      <button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="disabled:text-gray-400"
      >
        <AiOutlineRight className="h-fit w-fit p-2 text-xl" />
      </button>
      <button
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
        className="disabled:text-gray-400"
      >
        <AiOutlineDoubleRight className="h-fit w-fit p-2 text-xl" />
      </button>
    </div>
  );
}
