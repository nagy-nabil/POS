import React from "react";
import { type Table } from "@tanstack/table-core";
import {
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";
import { Button } from "../ui/button";

export type TableUtilsProps<T> = {
  table: Table<T>;
};

export default function TableUtils<T>({ table }: TableUtilsProps<T>) {
  return (
    <div className="m-auto flex gap-3 justify-center items-center">
      <Button
        variant={"secondary"}
        size={"icon"}
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.setPageIndex(0)}
      >
        <AiOutlineDoubleLeft  />
      </Button>
      <Button
        variant={"secondary"}
        size={"icon"}
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <AiOutlineLeft />
      </Button>
      <p className="font-bold">
        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </p>
      <Button
        variant={"secondary"}
        size={"icon"}
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <AiOutlineRight />
      </Button>
      <Button
        variant={"secondary"}
        size={"icon"}
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        <AiOutlineDoubleRight />
      </Button>
    </div>
  );
}
