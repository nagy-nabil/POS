import { useQueryClient } from "@tanstack/react-query";
import { RiAddLine } from "react-icons/ri";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import CustomModal from ".";
import { api } from "@/utils/api";
import { type z } from "zod";
import { categorySchema, productSchema } from "@/types/entities";
import { Category, type Product } from "@prisma/client";
import { CgSpinner } from "react-icons/cg";

type CategoryT = z.infer<typeof categorySchema>;

const categoryKeys = categorySchema.keyof().options;

export type CategoryModalProps = {
  operationType: "post" | "put";
  defaultValues: Partial<CategoryT>;
};

const CategoryModal: React.FC<CategoryModalProps> = (props) => {
  const categoryInsert = api.categories.insertOne.useMutation();
  const categoryUpdate = api.categories.updateOne.useMutation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryT>({
    resolver: zodResolver(categorySchema),
    defaultValues: props.defaultValues,
  });

  const onSubmit: SubmitHandler<CategoryT> = (data) => {
    categoryInsert.mutate(data, {
      onSuccess: (data) => {
        queryClient.setQueryData(
          [["categories", "getMany"], { type: "query" }],
          (prev) => [...(prev as Category[]), data]
        );
      },
    });
  };

  return (
    <CustomModal
      buttonAttrs={{ className: "mt-2" }}
      dialogAttrs={{}}
      buttonChildren={<RiAddLine className="h-fit w-fit p-3 text-3xl" />}
      modalChildren={
        <form
          onSubmit={handleSubmit(onSubmit, (err) => {
            console.log(
              "🪵 [productModal.tsx:44] ~ token ~ \x1b[0;32merr\x1b[0m = ",
              err
            );
          })}
        >
          <h1 className="my-2 text-3xl">Add New Category</h1>
          {categoryKeys.map((categoryKey, i) => {
            return (
              <label key={i} className="block">
                {categoryKey}
                <input
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...register(categoryKey, { required: true })}
                />
                {/* errors will return when field validation fails  */}
                {errors[categoryKey] && (
                  <span className="m-2 text-red-700">
                    {/* @ts-ignore */}
                    {errors[categoryKey].message}
                  </span>
                )}
              </label>
            );
          })}

          <button
            disabled={categoryInsert.isLoading}
            type="submit"
            className="m-3 h-fit w-fit cursor-pointer rounded-lg bg-green-700 p-3 text-white"
            value={"Add"}
          >
            {categoryInsert.isLoading ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : (
              "Add"
            )}
          </button>
        </form>
      }
    />
  );
};
export default CategoryModal;
