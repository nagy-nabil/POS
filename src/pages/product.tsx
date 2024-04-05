import React, { useMemo } from "react";
import { type GetStaticPropsContext } from "next";
import ProductModal from "@/components/modal/productModal";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { DataTable } from "@/components/table/dataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/utils/api";
import { dateFormater } from "@/utils/date";
import { type Product } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

import { type NextPageWithProps } from "./_app";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"])),
      // Will be passed to the page component as props
    },
  };
}

// const columnHelper = createColumnHelper<Product>();

function Table(props: { data: Product[] }) {
  const { t } = useTranslation();
  const columns: ColumnDef<Product>[] = useMemo(
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
        accessorKey: "buyPrice",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("table.product.buyPrice")}
          />
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "sellPrice",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("table.product.sellPrice")}
          />
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "stock",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("table.product.stock")}
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
      {
        id: "actions",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <ProductModal
              key={product.id + "updateProduct"}
              operationType="put"
              defaultValues={product}
            />
          );
        },
      },
    ],
    [t],
  );

  if (typeof window === "undefined") return null;

  return (
    <div className="relative w-full h-full overflow-auto">
      <DataTable columns={columns} data={props.data} />
    </div>
  );
}

const ProductTable: NextPageWithProps = () => {
  const productsQuery = api.products.getMany.useQuery(undefined);

  return (
    <div className="w-full h-full overflow-hidden flex flex-col gap-4">
      <div className="w-full flex justify-end">
        <ProductModal defaultValues={{}} operationType="post" />
      </div>
      <div className="w-full ">
        {productsQuery.data && <Table data={productsQuery.data} />}
      </div>
    </div>
  );
};

ProductTable.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default ProductTable;
