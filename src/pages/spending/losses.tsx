import React, { useMemo } from "react";
import type { GetStaticPropsContext } from "next";
import LossesModal from "@/components/modal/lossesModal";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { DataTable } from "@/components/table/dataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/utils/api";
import { dateFormater } from "@/utils/date";
import { type Loss } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

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

// const columnHelper = createColumnHelper<Loss>();

function Table(props: { data: Loss[] }) {
  const { t } = useTranslation();
  const columns: ColumnDef<Loss>[] = useMemo(
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
          <DataTableColumnHeader
            column={column}
            title={t("table.common.name")}
          />
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
      },
      {
        accessorKey: "additionalAmount",
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
  const lossQuery = api.losses.getMany.useQuery(undefined, {
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
      <div className="w-full h-full">
        <LossesModal defaultValues={{}} operationType="post" />
        {lossQuery.data && <Table data={lossQuery.data} />}
      </div>
    </>
  );
};

Spending.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default Spending;
