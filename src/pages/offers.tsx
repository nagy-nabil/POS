import React, { useMemo } from "react";
import type { GetStaticPropsContext } from "next";
import ConfirmModal from "@/components/modal/confirm";
import OfferModal from "@/components/modal/offerModal";
import { OfferDisplay } from "@/components/offerDisplay";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { DataTable } from "@/components/table/dataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/utils/api";
import { dateFormater } from "@/utils/date";
import type { Offer } from "@prisma/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ColumnDef } from "@tanstack/react-table";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { AiOutlineDelete } from "react-icons/ai";
import { CgSpinner } from "react-icons/cg";

import { type NextPageWithProps } from "./_app";

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

// const columnHelper = createColumnHelper<Offer>();

function Table(props: { data: Offer[] }) {
  const { t } = useTranslation();

  const offerDelete = api.offers.delete.useMutation({
    onSuccess(_, variables) {
      utils.offers.index.setData(undefined, (prev) =>
        prev
          ? [
              ...prev.filter(
                (i) => variables.findIndex((i2) => i.id === i2) === -1,
              ),
            ]
          : [],
      );
    },
  });

  const columns: ColumnDef<Offer>[] = useMemo(
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
          const offer = row.original;
          return (
            <ConfirmModal
              bodyMessage="Are you sure you want to delete this offer, you cannot undo?"
              header="Delete Offer"
              onOk={() => {
                offerDelete.mutate([offer.id]);
              }}
              onCancel={() => {
                console.log("cancel");
              }}
              buttonChildren={
                offerDelete.isLoading ? (
                  <CgSpinner className="animate-spin text-2xl" />
                ) : (
                  <AiOutlineDelete className="m-auto h-fit w-fit    p-2 text-3xl" />
                )
              }
              buttonAttrs={{
                disabled: offerDelete.isLoading,
                className: "text-red-600 disabled:text-gray-500",
              }}
            />
          );
        },
      },
    ],
    [t, offerDelete.isLoading, offerDelete.mutate],
  );

  const utils = api.useUtils();

  if (typeof window === "undefined") return null;

  return (
    <div className="w-full flex h-fit flex-col">
      {/* item utils*/}
      <div className="flex justify-start gap-3">
        <OfferModal defaultValues={{}} operationType="post" />
      </div>

      <div className="relative w-full overflow-auto">
        <DataTable columns={columns} data={props.data} />
      </div>
    </div>
  );
}

const OfferPage: NextPageWithProps = () => {
  const offerQuery = api.offers.index.useQuery(undefined, {
    staleTime: Infinity,
  });

  return (
    <div className="w-full h-full">
      {offerQuery.data && <Table data={offerQuery.data} />}
      <OfferDisplay />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
};

OfferPage.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default OfferPage;
