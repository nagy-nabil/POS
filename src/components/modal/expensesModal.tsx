import { useTranslation } from "next-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import CustomModal from ".";
import { api } from "@/utils/api";
import { type z } from "zod";
import { expenseStoreSchema, expenseTypeSchema } from "@/types/entities";
import clsx from "clsx";
import { MdOutlineCategory } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";

// ---------------------------------------------------------------------
export type ExpenseTypeT = z.infer<typeof expenseTypeSchema>;
const expenseTypeKeys = expenseTypeSchema.keyof().options;
export type ExpenseTypeProps = {
  operationType: "post" | "put";
  defaultValues: Partial<ExpenseTypeT>;
};

export function ExpenseTypeModal(props: ExpenseTypeProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [operationError, setOperationError] = useState("");

  //FORM
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    // reset: formReset,
  } = useForm<ExpenseTypeT>({
    resolver: zodResolver(expenseTypeSchema),
    defaultValues: props.defaultValues,
    mode: "onSubmit",
  });

  return (
    <CustomModal
      header={
        props.operationType === "post"
          ? t("expensesModal.typeModal.headerName.post")
          : t("expensesModal.typeModal.headerName.put")
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
          <MdOutlineCategory
            key="spendingTypeicon"
            className="h-fit w-fit p-3 text-3xl text-green-600"
          />
        ) : (
          <MdOutlineCategory
            key="spendingTypeiconPut"
            className="h-fit w-fit p-3 text-3xl text-yellow-400"
          />
        )
      }
      modalChildren={
        <article>
          {expenseTypeKeys.map((typeKey, i) => {
            if (typeKey === "id") return null;
            return (
              <label key={i} className="block">
                {t(`expensesModal.typeModal.props.${typeKey}`)}
                <input
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...register(typeKey, {})}
                />
                {/* errors will return when field validation fails  */}
                {formErrors[typeKey] && (
                  <span className="m-2 text-red-700">
                    {/* @ts-ignore */}
                    {formErrors[typeKey].message}
                  </span>
                )}
              </label>
            );
          })}

          <p className="m-2 text-red-700">{operationError}</p>
          <button
            // TODO ENABLE
            // disabled={
            //   categoryInsert.isLoading ||
            //   categoryUpdate.isLoading ||
            //   imageMut.isLoading
            // }
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

// ----------------------------------------------------------------------2
export type ExpenseStoreT = z.infer<typeof expenseStoreSchema>;
const expenseStoreKeys = expenseStoreSchema.keyof().options;
export type ExpensesModalProps = {
  operationType: "post" | "put";
  defaultValues: Partial<ExpenseStoreT>;
};

export function ExpensesStoreModal(props: ExpensesModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [operationError, setOperationError] = useState("");

  //FORM
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    // reset: formReset,
  } = useForm<ExpenseStoreT>({
    resolver: zodResolver(expenseStoreSchema),
    defaultValues: { onTheFly: false, ...props.defaultValues },
    mode: "onSubmit",
  });

  return (
    <CustomModal
      header={
        props.operationType === "post"
          ? t("expensesModal.storeModal.headerName.post")
          : t("expensesModal.storeModal.headerName.put")
      }
      dialogRef={dialogRef}
      buttonAttrs={{
        className: "mt-2 h-fit w-fit p-3 text-3xl text-green-600 border-2",
      }}
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
        props.operationType === "post" ? "add Store" : "update store"
      }
      modalChildren={
        <article>
          {expenseStoreKeys.map((storeKey, i) => {
            // TODO REMOVE REMINDAT ADD FROM HERE
            if (
              storeKey === "onTheFly" ||
              storeKey === "id" ||
              storeKey === "remindAt"
            )
              return null;

            return (
              <label key={i} className="block">
                {t(`expensesModal.storeModal.props.${storeKey}`)}
                <input
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...(storeKey === "amount"
                    ? register(storeKey, {
                        valueAsNumber: true,
                      })
                    : register(storeKey))}
                />
                {/* errors will return when field validation fails  */}
                {formErrors[storeKey] && (
                  <span className="m-2 text-red-700">
                    {/* @ts-ignore */}
                    {formErrors[storeKey].message}
                  </span>
                )}
              </label>
            );
          })}

          <p className="m-2 text-red-700">{operationError}</p>
          <button
            // TODO ENABLE
            // disabled={
            //   categoryInsert.isLoading ||
            //   categoryUpdate.isLoading ||
            //   imageMut.isLoading
            // }
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
              t("expensesModal.storeModal.action.post")
            ) : (
              t("expensesModal.storeModal.action.put")
            )}
          </button>
        </article>
      }
    />
  );
}
