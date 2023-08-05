import React, { useRef, useState } from "react";
import {
  expensesSchema,
  expenseStoreSchema,
  expenseTypeSchema,
} from "@/types/entities";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { type z } from "zod";

import CustomModal from ".";

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
  const utils = api.useContext();

  //FORM
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset: formReset,
  } = useForm<ExpenseTypeT>({
    resolver: zodResolver(expenseTypeSchema),
    defaultValues: props.defaultValues,
    mode: "onSubmit",
  });

  function resetModalState() {
    formReset();
    setOperationError("");
    dialogRef.current?.close();
  }

  const typesInsert = api.expenses.expeseTypeInsertOne.useMutation({
    onSuccess(data) {
      utils.expenses.expenseTypeGetMany.setData(undefined, (prev) => [
        ...(prev ?? []),
        data,
      ]);
      resetModalState();
    },
    onError(error) {
      setOperationError(error.message);
    },
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
            typesInsert.mutate(data);
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
          <p
            key="spendingTypeicon"
            className="mx-3 h-fit w-fit border-2 p-3 text-3xl text-green-600"
          >
            Insert Expenses type
          </p>
        ) : (
          <p
            key="spendingTypeiconPut"
            className="h-fit w-fit p-3 text-3xl text-yellow-400"
          >
            update expese type
          </p>
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
                  {...register(typeKey)}
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
            disabled={typesInsert.isLoading}
            type="submit"
            className={clsx({
              "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white": true,
              "bg-green-700": props.operationType === "post",
              "bg-yellow-600": props.operationType === "put",
            })}
          >
            {typesInsert.isLoading ? (
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
  const utils = api.useContext();

  //FORM
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset: formReset,
  } = useForm<ExpenseStoreT>({
    resolver: zodResolver(expenseStoreSchema),
    defaultValues: { onTheFly: false, ...props.defaultValues },
    mode: "onSubmit",
  });

  function resetModalState() {
    formReset();
    setOperationError("");
    dialogRef.current?.close();
  }

  const expenseTypesQuery = api.expenses.expenseTypeGetMany.useQuery(
    undefined,
    {
      staleTime: Infinity,
    }
  );
  const storeInsert = api.expenses.expeseStoreInsertOne.useMutation({
    onSuccess(data) {
      utils.expenses.expenseStoreGetMany.setData(undefined, (prev) => [
        ...(prev ?? []),
        data,
      ]);
      resetModalState();
    },
    onError(error) {
      setOperationError(error.message);
    },
  });

  if (expenseTypesQuery.isError) {
    return <>{JSON.stringify(expenseTypesQuery.error)}</>;
  }

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
        onSubmit: handleSubmit((data) => {
          storeInsert.mutate(data);
        }),
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
              storeKey === "remindAt" ||
              storeKey === "typeId"
            )
              return null;

            return (
              <label key={i} className="block">
                {t(`expensesModal.storeModal.props.${storeKey}`)}
                <input
                  type={storeKey === "amount" ? "number" : "text"}
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...register(storeKey, {
                    valueAsNumber: storeKey === "amount",
                  })}
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

          <label
            key={"spetype"}
            className="mb-2 block font-medium text-gray-900"
          >
            {t("expensesModal.storeModal.props.typeId")}
            <select
              {...register("typeId", {})}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500
              "
            >
              {expenseTypesQuery.data !== undefined
                ? expenseTypesQuery.data.map((type) => {
                    return (
                      <option
                        label={type.name}
                        value={type.id}
                        key={type.id}
                        className="text-black focus:bg-red-500"
                      />
                    );
                  })
                : null}
            </select>
            {/* errors will return when field validation fails  */}
            {formErrors["typeId"] && (
              <span className="m-2 text-red-700">
                {formErrors["typeId"].message}
              </span>
            )}
          </label>
          <p className="m-2 text-red-700">{operationError}</p>
          <button
            disabled={storeInsert.isLoading}
            type="submit"
            className={clsx({
              "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white": true,
              "bg-green-700": props.operationType === "post",
              "bg-yellow-600": props.operationType === "put",
            })}
          >
            {storeInsert.isLoading ? (
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

//  2- ---------------------------------------------------------------------
export type ExpenseT = z.infer<typeof expensesSchema>;
const expenseKeys = expensesSchema.keyof().options;

export type ExpenseProps = {
  operationType: "post" | "put";
  defaultValues: Partial<ExpenseT>;
};

export function ExpenseModal(props: ExpenseProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [operationError, setOperationError] = useState("");
  const utils = api.useContext();

  //FORM
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset: formReset,
  } = useForm<ExpenseT>({
    resolver: zodResolver(expensesSchema),
    defaultValues: { additionalAmount: 0, ...props.defaultValues },
    mode: "onSubmit",
  });

  function resetModalState() {
    formReset();
    setOperationError("");
    dialogRef.current?.close();
  }

  const expenseStoreQuery = api.expenses.expenseStoreGetMany.useQuery(
    undefined,
    {
      staleTime: Infinity,
    }
  );
  const expenseInsert = api.expenses.expenseInsertOne.useMutation({
    onSuccess(data) {
      utils.expenses.expenseGetMany.setData(undefined, (prev) => [
        ...(prev ?? []),
        data,
      ]);
      resetModalState();
    },
    onError(error) {
      setOperationError(error.message);
    },
  });

  return (
    <CustomModal
      header={
        props.operationType === "post"
          ? t("expensesModal.expense.headerName.post")
          : t("expensesModal.expense.headerName.put")
      }
      dialogRef={dialogRef}
      buttonAttrs={{ className: "mt-2" }}
      dialogAttrs={{}}
      formAttrs={{
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit: handleSubmit(
          (data) => {
            expenseInsert.mutate(data);
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
          <p
            key="spendingicon"
            className="mx-3 h-fit w-fit border-2 p-3 text-3xl text-green-600"
          >
            Insert Expenses
          </p>
        ) : (
          <p
            key="spendingiconPut"
            className="h-fit w-fit p-3 text-3xl text-yellow-400"
          >
            update expese
          </p>
        )
      }
      modalChildren={
        <article>
          {expenseKeys.map((expenseKey, i) => {
            if (expenseKey === "id" || expenseKey === "expenseStoreIds")
              return null;

            return (
              <label key={i} className="block">
                {t(`expensesModal.expense.props.${expenseKey}`)}
                <input
                  type={expenseKey === "additionalAmount" ? "number" : "text"}
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...register(expenseKey, {
                    valueAsNumber: expenseKey === "additionalAmount",
                  })}
                />
                {/* errors will return when field validation fails  */}
                {formErrors[expenseKey] && (
                  <span className="m-2 text-red-700">
                    {/* @ts-ignore */}
                    {formErrors[expenseKey].message}
                  </span>
                )}
              </label>
            );
          })}

          <label key={"expe"} className="mb-2 block font-medium text-gray-900">
            {t("expensesModal.expense.props.store")}
            <select
              multiple={true}
              {...register("expenseStoreIds", {})}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500
              "
            >
              {expenseStoreQuery.data !== undefined
                ? expenseStoreQuery.data.map((store) => {
                    return (
                      <option
                        value={store.id}
                        key={store.id}
                        className="flex flex-col gap-1 text-black focus:bg-red-500"
                      >
                        <p>
                          {store.name}
                          {"   "}
                          {store.amount}
                        </p>
                        <p>{store.description}</p>
                      </option>
                    );
                  })
                : null}
            </select>
            {/* errors will return when field validation fails  */}
            {formErrors["expenseStoreIds"] && (
              <span className="m-2 text-red-700">
                {formErrors["expenseStoreIds"].message}
              </span>
            )}
          </label>

          <p className="m-2 text-red-700">{operationError}</p>
          <button
            disabled={expenseInsert.isLoading || expenseStoreQuery.isLoading}
            type="submit"
            className={clsx({
              "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white": true,
              "bg-green-700": props.operationType === "post",
              "bg-yellow-600": props.operationType === "put",
            })}
          >
            {expenseInsert.isLoading ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : props.operationType === "post" ? (
              t("expensesModal.expense.action.post")
            ) : (
              t("expensesModal.expense.action.put")
            )}
          </button>
        </article>
      }
    />
  );
}