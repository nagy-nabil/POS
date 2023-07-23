import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomModal from ".";
import { api } from "@/utils/api";
import { type z } from "zod";
import { lossesSchema } from "@/types/entities";
import clsx from "clsx";
import { MdOutlineCategory } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";
import { Product } from "@prisma/client";

// ---------------------------------------------------------------------
export type LossesT = z.infer<typeof lossesSchema>;
const lossesKeys = lossesSchema.keyof().options;
export type LossesProps = {
  operationType: "post" | "put";
  defaultValues: Partial<LossesT>;
};
type LossItemProps = {
  products: (LossesT["products"][number] & { name: Product["name"] })[];
};

function LossItemsTable(props: LossItemProps) {
  return (
    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
      <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Product
          </th>
          <th scope="col" className="px-6 py-3">
            Quantity
          </th>
          <th scope="col" className="px-6 py-3">
            Utils
          </th>
        </tr>
      </thead>
      <tbody>
        {props.products.map((product, i) => {
          return (
            <tr
              key={i}
              className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
            >
              <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                {product.name}
              </td>
              <td className="px-6 py-4">{product.quantity}</td>
              <td className="px-6 py-4">
                <button className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                  delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function LossesModal(props: LossesProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [operationError, setOperationError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(0);

  function resetSelected() {
    setSelectedProductId("");
    setSelectedQuantity(0);
  }

  //FORM
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    getValues: getFormValue,
    reset: formReset,
  } = useForm<LossesT>({
    resolver: zodResolver(lossesSchema),
    defaultValues: { products: [], ...props.defaultValues },
    mode: "onSubmit",
  });

  function resetModalState() {
    formReset();
    setOperationError("");
    dialogRef.current?.close();
  }

  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
  });

  // only show the products that are not already added to the form
  const selectProducts = useMemo(() => {
    if (!productsQuery.data) return [];
    return productsQuery.data.filter(
      (product) =>
        !getFormValue("products").some((p) => p.productId === product.id)
    );
  }, [productsQuery.data, getFormValue]);

  return (
    <CustomModal
      header={
        props.operationType === "post"
          ? t("lossesModal.headerName.post")
          : t("lossesModal.headerName.put")
      }
      dialogRef={dialogRef}
      buttonAttrs={{ className: "mt-2" }}
      dialogAttrs={{}}
      formAttrs={{
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit: handleSubmit(
          (data) => {
            console.log(data);
          },
          (err) => {
            console.log(
              "🪵 [productModal.tsx:44] ~ token ~ \x1b[0;32merr\x1b[0m = ",
              err
            );
          }
        ),
      }}
      buttonChildren={
        props.operationType === "post" ? (
          <p key="lossesic" className="h-fit w-fit p-3 text-3xl text-green-600">
            insert loss
          </p>
        ) : (
          <p
            key="spendingTypeiconPut"
            className="h-fit w-fit p-3 text-3xl text-yellow-400"
          >
            update loss
          </p>
        )
      }
      modalChildren={
        <article>
          {lossesKeys.map((lossK, i) => {
            if (lossK === "id" || lossK === "products") return null;
            return (
              <label key={i} className="block">
                {t(`lossesModal.props.${lossK}`)}
                <input
                  type={lossK === "additionalAmount" ? "number" : "text"}
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...register(lossK, {
                    valueAsNumber: lossK === "additionalAmount",
                  })}
                />
                {/* errors will return when field validation fails  */}
                {formErrors[lossK] && (
                  <span className="m-2 text-red-700">
                    {/* @ts-ignore */}
                    {formErrors[lossK].message}
                  </span>
                )}
              </label>
            );
          })}

          {/* select products */}
          <label key={"pros"} className="mb-2 block font-medium text-gray-900">
            {t("lossesModal.props.products")}
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500
    "
            >
              {selectProducts.map((product) => {
                return (
                  <option
                    label={product.name}
                    value={product.id}
                    key={product.id}
                    className="text-black focus:bg-red-500"
                  />
                );
              })}
            </select>
            <input
              type="number"
              value={selectedQuantity}
              onChange={(e) => {
                setSelectedQuantity(e.target.valueAsNumber);
              }}
              min={0}
              placeholder="quantity"
            />
            {/* errors will return when field validation fails  */}
            {formErrors["products"] && (
              <span className="m-2 text-red-700">
                {formErrors["products"].message}
              </span>
            )}
          </label>

          <button
            disabled={selectedProductId === "" || selectedQuantity === 0}
            type="button"
            onClick={() => {
              resetSelected();
            }}
          >
            add product
          </button>

          {/* Loss Items Table */}
          <LossItemsTable
            products={[
              {
                name: "sdd",
                productId: "121",
                quantity: 3.1,
              },
              {
                name: "sdd",
                productId: "fsd",
                quantity: 3.1,
              },
              {
                name: "sdd",
                productId: "fkfldnp",
                quantity: 3.1,
              },
            ]}
          />
          <p className="m-2 text-red-700">{operationError}</p>
          <button
            disabled={productsQuery.isLoading}
            type="submit"
            className={clsx({
              "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white": true,
              "bg-green-700": props.operationType === "post",
              "bg-yellow-600": props.operationType === "put",
            })}
          >
            {/* TODO ADD LODAING STATE CONDITION */}
            {false ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : props.operationType === "post" ? (
              t("expensesModal.typeModal.action.post")
            ) : (
              t("expensesModal.typeModal.action.put")
            )}
          </button>
        </article>
      }
    />
  );
}
