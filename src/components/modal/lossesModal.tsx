import React, { useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomModal from ".";
import { api } from "@/utils/api";
import { type z } from "zod";
import {
  expenseStoreSchema,
  expenseTypeSchema,
  lossesSchema,
} from "@/types/entities";
import clsx from "clsx";
import { MdOutlineCategory } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";

// ---------------------------------------------------------------------
export type LossesT = z.infer<typeof lossesSchema>;
const lossesKeys = lossesSchema.keyof().options;
export type LossesProps = {
  operationType: "post" | "put";
  defaultValues: Partial<LossesT>;
};

export default function LossesModal(props: LossesProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [operationError, setOperationError] = useState("");

  //FORM
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    // reset: formReset,
  } = useForm<LossesT>({
    resolver: zodResolver(lossesSchema),
    defaultValues: props.defaultValues,
    mode: "onSubmit",
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
            key="lossesic"
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
          {lossesKeys.map((lossK, i) => {
            if (lossK === "id" || lossK === "products") return null;
            return (
              <label key={i} className="block">
                {t(`lossesModal.props.${lossK}`)}
                <input
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
