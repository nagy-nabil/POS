import { useQueryClient } from "@tanstack/react-query";
import { RiAddCircleLine } from "react-icons/ri";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import CustomModal from ".";
import { api } from "@/utils/api";
import { type z } from "zod";
import { productSchema } from "@/types/entities";
import { type Product } from "@prisma/client";

export type ProductT = z.infer<typeof productSchema>;
const productKeys = productSchema.keyof().options;
export type ProductModalProps = {
  operationType: "post" | "put";
};

const ProductModal: React.FC<ProductModalProps> = (props) => {
  const productsMut = api.products.insertOne.useMutation();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductT>({ resolver: zodResolver(productSchema) });

  const onSubmit: SubmitHandler<ProductT> = (data) => {
    productsMut.mutate(data, {
      onSuccess: (data) => {
        queryClient.setQueryData(
          [["products", "getMany"], { type: "query" }],
          (prev) => [...(prev as Product[]), data]
        );
      },
    });
  };

  return (
    <CustomModal Icon={RiAddCircleLine}>
      {/* /* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
      <form onSubmit={void handleSubmit(onSubmit)}>
        {productKeys.map((productKey, i) => {
          if (productKey === "categoryId") return null;
          return (
            <label key={i} className="block">
              {productKey}
              <input
                className="block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
                {...(productKey === "sellPrice" ||
                productKey === "stock" ||
                productKey === "buyPrice"
                  ? register(productKey, {
                      required: true,
                      valueAsNumber: true,
                    })
                  : register(productKey, { required: true }))}
              />
              {/* errors will return when field validation fails  */}
              {errors[productKey] && (
                <span className="m-2 text-red-700">
                  {/* @ts-ignore */}
                  {errors[productKey].message}
                </span>
              )}
            </label>
          );
        })}

        <input
          disabled={productsMut.isLoading}
          type="submit"
          className="m-3 h-fit w-fit cursor-pointer rounded-lg bg-green-700 p-3 text-white"
        />
      </form>
    </CustomModal>
  );
};
export default ProductModal;
