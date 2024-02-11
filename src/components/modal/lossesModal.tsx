import React, { useMemo, useRef, useState } from "react";
import { lossesSchema } from "@/types/entities";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Product } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { useFieldArray, useForm } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { type z } from "zod";

import CustomModal from ".";

// ---------------------------------------------------------------------
export type LossesT = z.infer<typeof lossesSchema>;
const lossesKeys = lossesSchema.keyof().options;
export type LossesProps = {
  operationType: "post" | "put";
  defaultValues: Partial<LossesT>;
};
type LossItemProps = {
  products: (LossesT["products"][number] & { name: Product["name"] })[];
  removeFn: (i: number) => void;
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
              key={product.productId}
              className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
            >
              <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                {product.name}
              </td>
              <td className="px-6 py-4">{product.quantity}</td>
              <td className="px-6 py-4">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                  onClick={() => {
                    props.removeFn(i);
                  }}
                >
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
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [quantityErr, setQuantityErr] = useState("");

  //FORM
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors },
    reset: formReset,
  } = useForm<LossesT>({
    resolver: zodResolver(lossesSchema),
    defaultValues: { additionalAmount: 0, ...props.defaultValues },
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
  });
  // only show the products that are not already added to the form
  const selectProducts = useMemo(() => {
    if (!productsQuery.data) return [];
    return productsQuery.data.filter(
      (product) => !fields.some((p) => p.productId === product.id)
    );
  }, [productsQuery.data, fields]);

  function resetModalState() {
    formReset();
    setOperationError("");
    remove();
    dialogRef.current?.close();
  }

  const lossInsert = api.losses.insertOne.useMutation({
    onSuccess() {
      resetModalState();
    },
  });

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
            lossInsert.mutate(data);
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
                    {formErrors[lossK]?.message}
                  </span>
                )}
              </label>
            );
          })}
          {/* select products */}
          <div>
            <label key={"ro"} className="mb-2 block font-medium text-gray-900">
              {t("lossesModal.props.products")}
              <select
                value={selectedId}
                onChange={(e) => {
                  setQuantity(0);
                  setSelectedId(e.target.value);
                }}
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
                value={quantity}
                onChange={(e) => {
                  const v = e.target.valueAsNumber;
                  if (v < 0) {
                    setQuantityErr("quantity cannot be less than zero");
                    return;
                  }
                  const p = productsQuery.data?.find(
                    (p) => p.id === selectedId
                  );
                  if (p && v > p.stock) {
                    setQuantityErr(
                      `quantity cannot be greater than product stock, max Stock = ${p.stock}`
                    );
                    return;
                  }
                  setQuantity(e.target.valueAsNumber);
                  setQuantityErr("");
                }}
                type="number"
                step={0.5}
                placeholder="quantity"
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="m-2 text-red-700">{quantityErr}</p>
            </label>

            <button
              disabled={selectedId === "" || quantity === 0}
              type="button"
              className={clsx({
                "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white disabled:bg-gray-600":
                  true,
                "bg-green-700": true,
              })}
              onClick={() => {
                append({
                  productId: selectedId,
                  quantity: quantity,
                });
                setSelectedId("");
                setQuantity(0);
                setQuantityErr("");
              }}
            >
              add product
            </button>
          </div>
          {/* errors will return when field validation fails  */}
          {formErrors["products"] && (
            <span className="my-2 text-red-700">
              {formErrors["products"].message}
            </span>
          )}
          <LossItemsTable
            removeFn={remove}
            products={fields.map((f) => {
              const product = productsQuery.data?.find(
                (p) => p.id === f.productId
              );
              return {
                ...f,
                name: product?.name || "",
              };
            })}
          />
          <p className="m-2 text-red-700">{operationError}</p>
          <button
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
