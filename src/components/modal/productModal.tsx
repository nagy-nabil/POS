import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productSchema } from "@/types/entities";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Html5QrcodeScannerState, type Html5QrcodeScanner } from "html5-qrcode";
import { useTranslation } from "next-i18next";
import { useForm, type SubmitHandler } from "react-hook-form";
import { BiEdit } from "react-icons/bi";
import { BsQrCodeScan } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { RiAddLine } from "react-icons/ri";
import { type z } from "zod";

import CustomModal from ".";
import UploadImage, { useUploadAzure } from "../form/uploadImage";
import ImagePreviwe from "../imagePreview";
import QrCode from "../qrcode";

export type ProductT = z.infer<typeof productSchema>;
const productKeys = productSchema.keyof().options;
export type ProductModalProps = {
  operationType: "post" | "put";
  defaultValues: Partial<ProductT>;
  /**
   * function to run after success and the modal get closed
   */
  afterSuccess?: () => void;
};

const ProductModal: React.FC<ProductModalProps> = (props) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | undefined>(undefined);
  // from the react docs => Do not write or read ref.current during rendering.
  // so i use those state to sync the render with the scanner
  const [isScannerPaused, setIsScannerPaused] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [errors, setErrors] = useState("");
  const [fileSelected, setFileSelected] = useState<File | undefined>(undefined);
  const [fileSelectedSas, setFileSelectedSas] = useState<string | undefined>(
    undefined,
  );
  const utils = api.useContext();

  // form hook
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
    reset: formReset,
  } = useForm<ProductT>({
    resolver: zodResolver(productSchema),
    defaultValues: props.defaultValues,
    mode: "onSubmit",
  });

  function resetModalState() {
    setFileSelected(undefined);
    setFileSelectedSas(undefined);
    setErrors("");
    formReset();
    dialogRef.current?.close();
  }

  // react-query
  const imageMut = useUploadAzure();
  const categoryQuery = api.categories.getMany.useQuery(undefined, {
    staleTime: Infinity,
  });
  const productInsert = api.products.insertOne.useMutation({
    onSuccess: (data) => {
      utils.products.getMany.setData(undefined, (prev) => [
        ...(prev ?? []),
        data,
      ]);
      resetModalState();
      if (props.afterSuccess !== undefined) {
        props.afterSuccess();
      }
    },
    onError(err) {
      setErrors(err.message);
    },
  });

  const productUpdate = api.products.updateOne.useMutation({
    onSuccess: (data, variables) => {
      // remove the one with the id of the input and insert the returned from the mutation
      utils.products.getMany.setData(undefined, (prev) =>
        prev
          ? [...prev.filter((test) => test.id !== variables.productId), data]
          : [data],
      );
      resetModalState();
      if (props.afterSuccess !== undefined) {
        props.afterSuccess();
      }
    },
    onError(err) {
      setErrors(err.message);
    },
  });

  const onSubmit: SubmitHandler<ProductT> = (data) => {
    if (
      props.operationType === "put" &&
      (data.id === undefined || data.id === "")
    ) {
      throw new Error("cannot update product without id default value");
    }

    // just puting the mut call into functions to make the poilerplate easier
    const proIns = () => {
      productInsert.mutate(data);
    };
    const proPut = () => {
      productUpdate.mutate({
        productId: props.defaultValues.id || "",
        // @ts-expect-error infernce code needs update
        product: data,
      });
    };

    // set function to be run
    let toBeRun: () => void;
    if (props.operationType === "post") {
      toBeRun = proIns;
    } else {
      toBeRun = proPut;
    }

    // upload new image if selected file not undefined, then call the post or put
    // if no selected file do the post or put directly
    if (fileSelectedSas !== undefined && fileSelected !== undefined) {
      imageMut.mutate(
        { image: fileSelected, sasUrl: fileSelectedSas },
        {
          onSuccess() {
            toBeRun();
          },
          onError(err) {
            setErrors(err.message);
          },
        },
      );
    } else {
      toBeRun();
    }
  };

  return (
    <CustomModal
      header={
        props.operationType === "post"
          ? t("productModal.headerName.post")
          : t("productModal.headerName.put")
      }
      dialogRef={dialogRef}
      buttonAttrs={{ variant: "ghost", size: "icon" }}
      dialogAttrs={{}}
      formAttrs={{
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit: handleSubmit(onSubmit, (err) => {
          console.log(
            "🪵 [productModal.tsx:44] ~ token ~ \x1b[0;32merr\x1b[0m = ",
            err,
          );
        }),
      }}
      buttonChildren={
        props.operationType === "post" ? (
          <RiAddLine className="text-green-600" size={24} />
        ) : (
          <BiEdit className="text-yellow-400" size={24} />
        )
      }
      modalChildren={
        <article className="overflow-y-auto overscroll-y-contain">
          {/* id is special case than the loop */}
          <label key="id" className="block">
            {t("productModal.props.id")}
            <div className="mb-3 flex gap-1">
              <Input {...register("id")} />

              {/* only show qr managment with id input */}
              <Button
                disabled={
                  productInsert.isLoading ||
                  productUpdate.isLoading ||
                  imageMut.isLoading
                }
                type="button"
                variant={"secondary"}
                className="rounded-full border-1 border-border"
                size={"icon"}
                onClick={() => setIsQrOpen((prev) => !prev)}
              >
                <BsQrCodeScan size={20} />
              </Button>
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
                  type="button"
                  className="h-fit w-fit rounded-2xl bg-gray-600 p-2 text-white"
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
                  type="button"
                  className="h-fit w-fit rounded-2xl bg-gray-600 p-2 text-white"
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

          {/* image upload is special case */}
          <label key={"productimage"} className="block">
            {t("productModal.props.image")}
            <div className="mb-3 flex gap-1">
              <Input {...register("image")} />
              <UploadImage
                key={"uploadProductImage"}
                setFileSelected={setFileSelected}
                onLink={(url) => {
                  setFileSelectedSas(url.sasUrl);
                  setValue("image", url.blobUrl);
                }}
                isDisabled={
                  productInsert.isLoading ||
                  categoryQuery.isLoading ||
                  imageMut.isLoading
                }
              />
            </div>
            {/* errors will return when field validation fails  */}
            {formErrors["image"] && (
              <span className="m-2 text-red-700">
                {formErrors["image"].message}
              </span>
            )}
            {/* handle image preview for insert/update */}
            <ImagePreviwe file={fileSelected} src={props.defaultValues.image} />
          </label>

          {productKeys.map((productKey, i) => {
            if (
              productKey === "categoryId" ||
              productKey === "id" ||
              productKey === "image"
            )
              return null;
            return (
              <Label key={i} className="block">
                {t(`productModal.props.${productKey}`)}
                <Input
                  type={
                    productKey === "sellPrice" ||
                    productKey === "stock" ||
                    productKey === "buyPrice"
                      ? "number"
                      : "text"
                  }
                  step={
                    productKey === "sellPrice" ||
                    productKey === "stock" ||
                    productKey === "buyPrice"
                      ? "0.01"
                      : undefined
                  }
                  {...register(productKey, {
                    valueAsNumber:
                      productKey === "sellPrice" ||
                      productKey === "stock" ||
                      productKey === "buyPrice",
                  })}
                />

                {/* errors will return when field validation fails  */}
                {formErrors[productKey] && (
                  <span className="m-2 text-red-700">
                    {formErrors[productKey]?.message}
                  </span>
                )}
              </Label>
            );
          })}

          <label
            key={"category"}
            className="mb-2 block font-medium text-gray-900"
          >
            {t("productModal.props.category")}
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
          <Button
            disabled={
              productInsert.isLoading ||
              categoryQuery.isLoading ||
              imageMut.isLoading
            }
            type="submit"
            className={clsx({
              "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white": true,
              "bg-green-700": props.operationType === "post",
              "bg-yellow-600": props.operationType === "put",
            })}
          >
            {productInsert.isLoading ||
            productUpdate.isLoading ||
            imageMut.isLoading ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : props.operationType === "post" ? (
              t("productModal.action.post")
            ) : (
              t("productModal.action.put")
            )}
          </Button>
        </article>
      }
    />
  );
};
export default ProductModal;
