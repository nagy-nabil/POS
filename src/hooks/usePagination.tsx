import { useMemo, useState } from "react";
import { type FnReturn } from "@/types/utils";
import {
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";

export type UsePaginationProps<T> = {
  data: T[];
  /**
   * number of items to show in one page
   *
   * CANNOT BE LESS THAN ZERO, will through
   */
  length: number;
};

/**
 * count from ZERO
 */
export function usePagination<T>(props: UsePaginationProps<T>) {
  const [curPage, setCurPage] = useState(0);
  const pagesNum = Math.ceil(props.data.length / props.length);

  const values = useMemo<T[]>(() => {
    if (props.data.length === 0) return [];
    if (curPage < 0 || curPage >= pagesNum) {
      setCurPage(0);
    }
    if (props.length < 0)
      throw new Error(
        "usePagination: number of items in page cannot be less than zero"
      );
    const start = curPage * props.length;
    return props.data.slice(start, start + props.length);
  }, [props, curPage, pagesNum]);

  function canGetNext() {
    return pagesNum > 0 && curPage < pagesNum - 1;
  }
  function canGetPrev() {
    return pagesNum > 0 && curPage > 0;
  }
  function getNextPage() {
    if (canGetNext()) {
      setCurPage((prev) => prev + 1);
    }
  }
  function getPrevPage() {
    if (canGetPrev()) {
      setCurPage((prev) => prev - 1);
    }
  }
  function resetPage() {
    setCurPage(0);
  }

  return {
    values,
    pagesNum,
    curPage,
    getNextPage,
    getPrevPage,
    resetPage,
    setCurPage,
    canGetNext,
    canGetPrev,
  };
}

export type PaginationUtisProps<T> = FnReturn<typeof usePagination<T>>;

export function PaginationUtis<T>(props: PaginationUtisProps<T>) {
  return (
    <div className="m-auto flex w-full items-center justify-center">
      <button
        disabled={!props.canGetPrev()}
        onClick={() => props.resetPage()}
        className="disabled:text-gray-400"
      >
        <AiOutlineDoubleLeft className="h-fit w-fit p-2 text-xl  " />
      </button>
      <button
        disabled={!props.canGetPrev()}
        onClick={() => props.getPrevPage()}
        className="disabled:text-gray-400"
      >
        <AiOutlineLeft className="h-fit w-fit p-2 text-xl" />
      </button>
      <p className="font-bold">
        {props.curPage + 1} of {props.pagesNum}
      </p>
      <button
        disabled={!props.canGetNext()}
        onClick={() => props.getNextPage()}
        className="disabled:text-gray-400"
      >
        <AiOutlineRight className="h-fit w-fit p-2 text-xl" />
      </button>
      <button
        disabled={!props.canGetNext()}
        onClick={() => props.setCurPage(props.pagesNum - 1)}
        className="disabled:text-gray-400"
      >
        <AiOutlineDoubleRight className="h-fit w-fit p-2 text-xl" />
      </button>
    </div>
  );
}
