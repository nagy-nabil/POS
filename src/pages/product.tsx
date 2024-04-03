import React, { useMemo } from "react";
import { type GetStaticPropsContext } from "next";
import { Checkbox } from "@/components/ui/checkbox"
import ProductModal from "@/components/modal/productModal";
import { api } from "@/utils/api";
import { dateFormater } from "@/utils/date";
import { type Product } from "@prisma/client";
import {
  type ColumnDef,
  createColumnHelper,
} from "@tanstack/react-table";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

import { type NextPageWithProps } from "./_app";
import { DataTable } from "@/components/table/dataTable";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"])),
      // Will be passed to the page component as props
    },
  };
}


const columnHelper = createColumnHelper<Product>();

function Table(props: { data: Product[] }) {
  const { t } = useTranslation();
  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      }),
      columnHelper.accessor("id", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.common.id")} />
        ),
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("table.common.name")} />,
        cell: (info) => info.getValue(),
        filterFn: "fuzzy",
      }),
      columnHelper.accessor("buyPrice", {
        header: ({column}) => <DataTableColumnHeader column={column}  title={t("table.product.buyPrice")} />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("sellPrice", {
        header: ({column}) => <DataTableColumnHeader column={column}  title={t("table.product.sellPrice")}/>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("stock", {
        header: ({column}) => <DataTableColumnHeader column={column}  title={t("table.product.stock")}/>,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: ({column}) => <DataTableColumnHeader column={column}  title={t("table.common.createdAt")}/>,
        cell: (info) => dateFormater.format(info.getValue()),
        enableColumnFilter: false,
      }),
      columnHelper.display(
        {
          id: "actions",
          cell: ({ row }) => {
            const product = row.original
            return (
              <ProductModal
                key={product.id + "updateProduct"}
                operationType="put"
                defaultValues={product}
              />
            )
          }
        }
      )
    ],
    [t]
  );


  if (typeof window === "undefined") return null;

  return (
    <div className="flex flex-col w-full ">
      {/* item utils*/}
      <div className="flex justify-start gap-3">
        <ProductModal defaultValues={{}} operationType="post" />
      </div>

      <div className="relative w-full overflow-auto">
        <DataTable columns={columns} data={props.data} />
      </div>
    </div>
  );
}

const ProductTable: NextPageWithProps = () => {
  const productsQuery = api.products.getMany.useQuery(undefined);

  return (
    <div className="w-full">
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
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
