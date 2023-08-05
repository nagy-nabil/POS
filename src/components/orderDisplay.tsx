import React, { useRef, useState } from "react";
import { api } from "@/utils/api";
import type { PaymentType, Product } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { AiOutlineDelete } from "react-icons/ai";
import { CgSpinner } from "react-icons/cg";
import { HiOutlinePrinter } from "react-icons/hi";
import { useReactToPrint } from "react-to-print";

import Accordion from "./accordion";
import ConfirmModal from "./modal/confirm";

export type OrderDisplayProps = {
  total: number;
  id: string;
  paymentType: PaymentType;
  createdAt: Date;
  createdById: string;
  createdBy: {
    id: string;
    userName: string;
  };
  products: {
    Product: Product;
    quantity: number;
    buyPriceAtSale: number;
    sellPriceAtSale: number;
  }[];
  // TODO i'm not in the mood to add type, add it baby
  refetch: any;
};

const OrderPrint = React.forwardRef<HTMLDivElement, OrderDisplayProps>(
  function OrderPrint(props, ref) {
    const { t } = useTranslation();
    return (
      <div ref={ref} className="p-5">
        <h1 className="text-center text-3xl">Zagy</h1>
        {/* TODO is this table dublicated? */}
        <div className="mb-3 flex flex-col gap-2">
          <p className="w-full overflow-hidden text-left text-xl font-bold ">
            # {props.id}
          </p>
          <span className="text-left">
            {t("orderDisplay.meta.createdAt")}: {props.createdAt.toUTCString()}
          </span>
          <span className="text-lg font-bold ">
            {t("orderDisplay.meta.total")}: {props.total} $
          </span>
        </div>

        <table className="w-full text-left text-sm text-black">
          <thead className="  text-xs  uppercase text-black">
            <tr>
              <th scope="col" className="px-4 py-2">
                {t("orderDisplay.table.name")}
              </th>
              <th scope="col" className="px-4 py-2">
                {t("orderDisplay.table.price")}
              </th>
              <th scope="col" className="px-4 py-2">
                {t("orderDisplay.table.quantity")}
              </th>
              <th scope="col" className="px-4 py-2">
                {t("orderDisplay.table.total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {props.products.map((product) => (
              <tr key={product.Product.id}>
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-2 font-medium text-black "
                >
                  {product.Product.name}
                </th>
                <td className="px-4 py-2">{product.sellPriceAtSale}</td>
                <td className="px-4 py-2">{product.quantity}</td>
                <td className="px-4 py-2">
                  {product.quantity * product.sellPriceAtSale}
                </td>
              </tr>
            ))}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td className="px-4 py-2 text-lg font-bold ">{props.total} $</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

const OrderDisplay: React.FC<OrderDisplayProps> = (props) => {
  const { t } = useTranslation();
  const toPrintRef = useRef<HTMLDivElement>(null);
  const [operationError, setOperationError] = useState("");
  const utils = api.useContext();

  const handlePrint = useReactToPrint({
    content: () => toPrintRef.current,
    documentTitle: props.id,
  });

  const orderDelete = api.orders.delete.useMutation({
    onError(error) {
      setOperationError(error.message);
    },
    async onSuccess(data) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await props.refetch();
      // add the stock back to the products store
      utils.products.getMany.setData(undefined, (prev) => {
        if (prev === undefined) return [];
        data.products.forEach((op) => {
          const p = prev.find((test) => test.id === op.productId);
          if (p !== undefined) {
            p.stock += op.quantity;
          }
        });
        return [...prev];
      });
    },
  });

  let totalProfit = 0;

  return (
    <div className="flex flex-col">
      <Accordion
        content={
          <div className="flex flex-col">
            <div
              className={clsx({
                " flex justify-center gap-2 ": true,
              })}
            >
              <button
                type="button"
                onClick={handlePrint}
                className={clsx({
                  "my-3 focus:outline-none": true,
                })}
              >
                <HiOutlinePrinter className="m-auto h-fit w-fit rounded-lg border-2 border-black p-2 text-3xl text-gray-500" />
              </button>

              <ConfirmModal
                bodyMessage="Are you sure you want to delete this order, you cannot undo?"
                header="Delete Order"
                onOk={() => {
                  console.log("will delete");
                  orderDelete.mutate(props.id);
                }}
                onCancel={() => {
                  console.log("cancel");
                }}
                buttonChildren={
                  orderDelete.isLoading ? (
                    <CgSpinner className="animate-spin text-2xl" />
                  ) : (
                    <AiOutlineDelete className="m-auto h-fit w-fit rounded-lg border-2 border-black p-2 text-3xl text-red-600" />
                  )
                }
              />
            </div>
            <p className="my-2 text-red-500">{operationError}</p>
            <table
              className={clsx({
                " w-full text-left text-sm text-gray-400 transition-all delay-75 ":
                  true,
              })}
            >
              <thead className=" bg-gray-700 text-xs  uppercase text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-2">
                    {t("orderDisplay.table.name")}
                  </th>
                  <th scope="col" className="px-4 py-2">
                    {t("orderDisplay.table.price")}
                  </th>
                  <th scope="col" className="px-4 py-2">
                    {t("orderDisplay.table.quantity")}
                  </th>
                  <th scope="col" className="px-4 py-2">
                    {t("orderDisplay.table.total")}
                  </th>
                  <th scope="col" className="px-4 py-2">
                    {t("orderDisplay.table.profit")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {props.products.map((product) => {
                  const profit =
                    product.quantity *
                    (product.sellPriceAtSale - product.buyPriceAtSale);
                  totalProfit += profit;
                  return (
                    <tr
                      className="bg-white dark:bg-gray-800"
                      key={product.Product.id}
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white"
                      >
                        {product.Product.name}
                      </th>
                      <td className="px-4 py-2">{product.sellPriceAtSale}$</td>
                      <td className="px-4 py-2">{product.quantity}</td>
                      <td className="px-4 py-2">
                        {product.quantity * product.sellPriceAtSale}$
                      </td>
                      <td className="px-4 py-2">{profit} $</td>
                    </tr>
                  );
                })}
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2">{props.total}</td>
                  <td className="px-4 py-2">{totalProfit}</td>
                </tr>
              </tbody>
            </table>
          </div>
        }
        title={
          <div className="flex flex-col gap-2">
            <p className="w-full overflow-hidden text-left text-xl font-bold text-orange-700">
              # {props.id}
            </p>
            <span className="text-left">
              {t("orderDisplay.meta.createdAt")}:{" "}
              {props.createdAt.toLocaleString("en-GB")}
            </span>
            <span className="text-lg font-bold text-green-600">
              {t("orderDisplay.meta.total")}: {props.total} $
            </span>
          </div>
        }
      />

      <div className="hidden">
        <OrderPrint {...props} ref={toPrintRef} />
      </div>
      <hr className="m-auto mt-2 h-[0.5px] w-11/12 border-none bg-gray-500" />
    </div>
  );
};

export default OrderDisplay;
export { OrderPrint };
