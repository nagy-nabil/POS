import { useQueryClient } from "@tanstack/react-query";
import { RiAddLine } from "react-icons/ri";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import CustomModal from ".";
import { api } from "@/utils/api";
import { type z } from "zod";
import { productSchema } from "@/types/entities";
import { type Product } from "@prisma/client";
import { CgSpinner } from "react-icons/cg";
import { BsQrCodeScan } from "react-icons/bs";
import QrCode from "../qrcode";
import { Html5QrcodeScannerState, type Html5QrcodeScanner } from "html5-qrcode";

export type ProductT = z.infer<typeof productSchema>;
const productKeys = productSchema.keyof().options;
export type ProductModalProps = {
  operationType: "post" | "put";
  defaultValues: Partial<ProductT>;
};

const ProductModal: React.FC<ProductModalProps> = (props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | undefined>(undefined);
  // from the react docs => Do not write or read ref.current during rendering.
  // so i use those state to sync the render with the scanner
  const [isScannerPaused, setIsScannerPaused] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [errors, setErrors] = useState("");

  // react-query
  const categoryQuery = api.categories.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
  });
  const productInsert = api.products.insertOne.useMutation();
  const productUpdate = api.products.updateOne.useMutation();
  const queryClient = useQueryClient();

  // form hook
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
  } = useForm<ProductT>({
    resolver: zodResolver(productSchema),
    defaultValues: props.defaultValues,
  });

  const onSubmit: SubmitHandler<ProductT> = (data) => {
    productInsert.mutate(data, {
      onSuccess: (data) => {
        queryClient.setQueryData(
          [["products", "getMany"], { type: "query" }],
          (prev) => [...(prev as Product[]), data]
        );
        dialogRef.current?.close();
      },
      onError(err) {
        setErrors(err.message);
      },
    });
  };

  return (
    <CustomModal
      dialogRef={dialogRef}
      buttonAttrs={{ className: "" }}
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
          <h1 className="my-2 text-3xl">Add New Product</h1>
          {/* create form inputs */}

          {/* id is special case than the loop */}
          <label key="id" className="block">
            Id
            <div className="mb-3 flex gap-1">
              <input
                className=" block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                {...register("id")}
              />

              {/* only show qr managment with id input */}
              <button onClick={() => setIsQrOpen((prev) => !prev)}>
                <BsQrCodeScan className="h-fit w-fit rounded-full border-2 border-gray-500 p-1 text-2xl text-gray-700" />
              </button>
            </div>
            {isQrOpen === true ? (
              <QrCode
                qrId="createProductQR"
                fps={15}
                qrcodeSuccessCallback={(text, _, scanner) => {
                  scannerRef.current = scanner;
                  scanner.pause(true);
                  setIsScannerPaused(true);
                  // setScannerRead(text);
                  setValue("id", text);
                }}
              />
            ) : null}
            {/* scanner utils */}
            {isQrOpen === true && isScannerPaused === true ? (
              <div className="flex justify-around">
                <button
                  className="h-fit w-fit rounded-2xl bg-gray-600 p-2"
                  onClick={() => {
                    if (scannerRef.current === undefined) return;
                    if (
                      scannerRef.current.getState() ===
                      Html5QrcodeScannerState.PAUSED
                    ) {
                      scannerRef.current.resume();
                    }
                    setValue("id", "");
                    setIsScannerPaused(false);
                  }}
                >
                  Scan another
                </button>
                <button
                  className="h-fit w-fit rounded-2xl bg-gray-600 p-2"
                  onClick={async () => {
                    if (scannerRef.current === undefined) return;
                    await scannerRef.current.clear();
                    setIsQrOpen(false);
                    setIsScannerPaused(false);
                  }}
                >
                  Done
                </button>
              </div>
            ) : null}
            {/* errors will return when field validation fails  */}
            {formErrors["id"] && (
              <span className="m-2 text-red-700">
                {formErrors["id"].message}
              </span>
            )}
          </label>

          {productKeys.map((productKey, i) => {
            if (productKey === "categoryId" || productKey === "id") return null;
            return (
              <label key={i} className="block">
                {productKey}
                <input
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
                {formErrors[productKey] && (
                  <span className="m-2 text-red-700">
                    {/* @ts-ignore */}
                    {formErrors[productKey].message}
                  </span>
                )}
              </label>
            );
          })}

          <label
            key={"category"}
            className="mb-2 block font-medium text-gray-900"
          >
            Category
            <select
              {...register("categoryId", { required: true })}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500
              "
            >
              {categoryQuery.data !== undefined
                ? categoryQuery.data.map((category) => {
                    return (
                      <option
                        label={category.name}
                        value={category.id}
                        key={category.id}
                        className="text-black focus:bg-red-500"
                      />
                    );
                  })
                : null}
            </select>
            {/* errors will return when field validation fails  */}
            {formErrors["categoryId"] && (
              <span className="m-2 text-red-700">
                {formErrors["categoryId"].message}
              </span>
            )}
          </label>

          <p className="m-2 text-red-700">{errors}</p>
          <button
            disabled={productInsert.isLoading || categoryQuery.isLoading}
            type="submit"
            className="m-3 h-fit w-fit cursor-pointer rounded-lg bg-green-700 p-3 text-white"
            value={"Add"}
          >
            {productInsert.isLoading ? (
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
export default ProductModal;
