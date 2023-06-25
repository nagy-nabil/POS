import { useQueryClient } from "@tanstack/react-query";
import { RiAddLine } from "react-icons/ri";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import CustomModal from ".";
import { api } from "@/utils/api";
import { type z } from "zod";
import { categorySchema } from "@/types/entities";
import { type Category } from "@prisma/client";
import { CgSpinner } from "react-icons/cg";
import { BiEdit, BiUpload } from "react-icons/bi";
import clsx from "clsx";

type CategoryT = z.infer<typeof categorySchema>;

const categoryKeys = categorySchema.keyof().options;

export type CategoryModalProps = {
  operationType: "post" | "put";
  defaultValues: Partial<CategoryT>;
};

const CategoryModal: React.FC<CategoryModalProps> = (props) => {
  // used to control dialog directly
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState("");
  const categoryInsert = api.categories.insertOne.useMutation();
  const categoryUpdate = api.categories.updateOne.useMutation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<CategoryT>({
    resolver: zodResolver(categorySchema),
    defaultValues: props.defaultValues,
  });

  const onSubmit: SubmitHandler<CategoryT> = (data) => {
    if (props.operationType === "post") {
      categoryInsert.mutate(data, {
        onSuccess: (data) => {
          dialogRef.current;
          queryClient.setQueryData(
            [["categories", "getMany"], { type: "query" }],
            (prev) => [...(prev as Category[]), data]
          );
          dialogRef.current?.close();
        },
        onError(err) {
          setErrors(err.message);
        },
      });
    } else if (data.id === undefined || data.id === "") {
      setErrors("id cannot be undefined or an empty string");
    } else if (props.operationType === "put") {
      // @ts-ignore
      categoryUpdate.mutate(data, {
        onSuccess: (data, variables) => {
          // remove the one with the id of the input and insert the returned from the mutation
          queryClient.setQueryData(
            [["categories", "getMany"], { type: "query" }],
            (prev) => [
              ...(prev as Category[]).filter(
                (test) => test.id !== variables.id
              ),
              data,
            ]
          );
          dialogRef.current?.close();
        },
        onError(err) {
          setErrors(err.message);
        },
      });
    }
  };

  return (
    <CustomModal
      dialogRef={dialogRef}
      buttonAttrs={{ className: "mt-2" }}
      dialogAttrs={{}}
      buttonChildren={
        props.operationType === "post" ? (
          <RiAddLine className="h-fit w-fit p-3 text-3xl text-green-600" />
        ) : (
          <BiEdit className="h-fit w-fit p-3 text-3xl text-yellow-400" />
        )
      }
      modalChildren={
        <form
          onSubmit={handleSubmit(onSubmit, (err) => {
            console.log(
              "🪵 [productModal.tsx:44] ~ token ~ \x1b[0;32merr\x1b[0m = ",
              err
            );
          })}
        >
          <h1 className="my-2 text-3xl">
            {props.operationType === "post"
              ? "Add New Category"
              : "Update Category"}
          </h1>

          {/* image upload is special case */}
          <label key={"productimage"} className="block">
            Image
            <div className="mb-3 flex gap-1">
              <input
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                {...register("image")}
              />
              <button>
                <BiUpload className="h-fit w-fit rounded-full border-2 border-gray-500 p-1 text-2xl text-gray-700" />
              </button>
            </div>
            {/* errors will return when field validation fails  */}
            {formErrors["image"] && (
              <span className="m-2 text-red-700">
                {formErrors["image"].message}
              </span>
            )}
          </label>

          {categoryKeys.map((categoryKey, i) => {
            if (
              categoryKey === "image" ||
              (props.operationType === "post" && categoryKey === "id")
            )
              return null;
            return (
              <label key={i} className="block">
                {categoryKey}
                <input
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...register(categoryKey, { required: true })}
                />
                {/* errors will return when field validation fails  */}
                {formErrors[categoryKey] && (
                  <span className="m-2 text-red-700">
                    {/* @ts-ignore */}
                    {formErrors[categoryKey].message}
                  </span>
                )}
              </label>
            );
          })}

          <p className="m-2 text-red-700">{errors}</p>
          <button
            disabled={categoryInsert.isLoading}
            type="submit"
            className={clsx({
              "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white": true,
              "bg-green-700": props.operationType === "post",
              "bg-yellow-600": props.operationType === "put",
            })}
          >
            {categoryInsert.isLoading || categoryUpdate.isLoading ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : props.operationType === "post" ? (
              "Add"
            ) : (
              "Update"
            )}
          </button>
        </form>
      }
    />
  );
};
export default CategoryModal;
