import React from "react";
import type { FilterFn, Column, Table } from "@tanstack/react-table";
import DebouncedInput from "../form/debouncedInput";
import { rankItem } from "@tanstack/match-sorter-utils";

export function Filter<TColumn, TTable>({
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

export const fuzzyFilter: FilterFn<unknown> = (
  row,
  columnId,
  value,
  addMeta
) => {
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
