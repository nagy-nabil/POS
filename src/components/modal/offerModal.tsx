import React, { useMemo, useRef, useState } from "react";
import { offerSchema } from "@/types/entities";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Product } from "@prisma/client";
import clsx from "clsx";
import { Html5QrcodeScannerState, type Html5QrcodeScanner } from "html5-qrcode";
import { useTranslation } from "next-i18next";
import { useFieldArray, useForm } from "react-hook-form";
import { BsQrCodeScan } from "react-icons/bs";
import { CgEye, CgSpinner } from "react-icons/cg";
import { RiAddLine } from "react-icons/ri";
import { type z } from "zod";

import CustomModal from ".";
import QrCode from "../qrcode";

// ---------------------------------------------------------------------
export type OfferT = z.infer<typeof offerSchema>;
const offerKeys = offerSchema.keyof().options;
export type OfferProps = {
  operationType?: "post";
  defaultValues: Partial<OfferT>;
};

type OfferItemProps = {
  products: (OfferT["products"][number] & {
    name: Product["name"];
    sellPrice: Product["sellPrice"];
  })[];
  removeFn: (i: number) => void;
  canUtil: boolean;
};

function OfferItemsTable(props: OfferItemProps) {
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
            sell price
          </th>
          <th scope="col" className="px-6 py-3">
            offer price
          </th>
          {props.canUtil ? (
            <th scope="col" className="px-6 py-3">
              Utils
            </th>
          ) : null}
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
              <td className="px-6 py-4">{product.sellPrice}</td>
              <td className="px-6 py-4">{product.price}</td>
              {props.canUtil ? (
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
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function OfferModal(props: OfferProps) {
  const { t } = useTranslation();
  const scannerRef = useRef<Html5QrcodeScanner | undefined>(undefined);
  // from the react docs => Do not write or read ref.current during rendering.
  // so i use those state to sync the render with the scanner
  const [isScannerPaused, setIsScannerPaused] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [operationError, setOperationError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [quantityErr, setQuantityErr] = useState("");
  const [priceErr, setPriceErr] = useState("");
  const utils = api.useContext();

  //FORM
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors: formErrors },
    reset: formReset,
  } = useForm<OfferT>({
    resolver: zodResolver(offerSchema),
    defaultValues: { ...props.defaultValues },
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
  const availableProducts = useMemo(() => {
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

  const offerInsert = api.offers.store.useMutation({
    onSuccess(data) {
      utils.offers.index.setData(undefined, (prev) => [...(prev ?? []), data]);
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
          ? t("offerModal.headerName.post")
          : t("offerModal.headerName.put")
      }
      dialogRef={dialogRef}
      buttonAttrs={{ className: "mt-2" }}
      dialogAttrs={{}}
      formAttrs={{
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit: handleSubmit(
          (data) => {
            console.log(data);
            offerInsert.mutate(data);
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
        props.operationType ? (
          <RiAddLine className="h-fit w-fit p-3 text-3xl text-green-600" />
        ) : (
          <CgEye className="h-fit w-fit p-3 text-3xl text-gray-600" />
        )
      }
      modalChildren={
        <article>
          {/* id is special case than the loop */}
          <label key="id" className="block">
            {t("productModal.props.id")}
            <div className="mb-3 flex gap-1">
              <input
                disabled={!!!props.operationType}
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                {...register("id")}
              />

              {/* only show qr managment with id input */}
              <button
                disabled={!!!props.operationType}
                type="button"
                onClick={() => setIsQrOpen((prev) => !prev)}
              >
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
          {offerKeys.map((key, i) => {
            // add id with qr code
            if (key === "id" || key === "products") return null;
            return (
              <label key={i} className="block">
                {t(`offerModal.props.${key}`)}
                <input
                  disabled={!!!props.operationType}
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...register(key)}
                />
                {/* errors will return when field validation fails  */}
                {formErrors[key] && (
                  <span className="m-2 text-red-700">
                    {formErrors[key]?.message}
                  </span>
                )}
              </label>
            );
          })}
          {/* select products */}
          {props.operationType && (
            <div className="flex flex-col gap-3">
              <label
                key={"ro"}
                className="mb-2 block font-medium text-gray-900"
              >
                {t("offerModal.props.products")}
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setQuantity(0);
                    setPrice(0);
                    setSelectedId(e.target.value);
                  }}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500
    "
                >
                  {availableProducts.map((product) => {
                    return (
                      <option
                        label={product.name}
                        value={product.id}
                        key={product.id}
                      />
                    );
                  })}
                </select>
              </label>
              <label>
                Quantity
                <input
                  value={quantity}
                  type="number"
                  step={0.5}
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
                  placeholder="quantity"
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="m-2 text-red-700">{quantityErr}</p>
              </label>

              <label>
                price
                <input
                  value={price}
                  type="number"
                  step={0.5}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber;
                    if (v < 0) {
                      setPriceErr("price cannot be less than zero");
                      return;
                    }
                    setPrice(e.target.valueAsNumber);
                    setPriceErr("");
                  }}
                  placeholder="price"
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="m-2 text-red-700">{priceErr}</p>
              </label>

              <button
                disabled={selectedId === "" || quantity === 0 || price === 0}
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
                    price: price,
                  });
                  setSelectedId("");
                  setQuantity(0);
                  setPrice(0);
                  setQuantityErr("");
                  setPriceErr("");
                }}
              >
                add product
              </button>
              {/* errors will return when field validation fails  */}
              {formErrors["products"] && (
                <span className="my-2 text-red-700">
                  {formErrors["products"].message}
                </span>
              )}
            </div>
          )}
          <div className="w-full overflow-x-auto mt-3">
            <OfferItemsTable
              canUtil={!!props.operationType}
              removeFn={remove}
              products={fields.map((f) => {
                const product = productsQuery.data?.find(
                  (p) => p.id === f.productId
                );
                return {
                  ...f,
                  name: product?.name || "",
                  sellPrice: product?.sellPrice || 0,
                };
              })}
            />
          </div>
          <p className="m-2 text-red-700">{operationError}</p>
          {props.operationType && (
            <button
              disabled={productsQuery.isLoading || offerInsert.isLoading}
              type="submit"
              className={clsx({
                "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white":
                  true,
                "bg-green-700": props.operationType === "post",
              })}
            >
              {productsQuery.isLoading || offerInsert.isLoading ? (
                <CgSpinner className="animate-spin text-2xl" />
              ) : props.operationType === "post" ? (
                t("expensesModal.typeModal.action.post")
              ) : (
                t("expensesModal.typeModal.action.put")
              )}
            </button>
          )}
        </article>
      }
    />
  );
}
