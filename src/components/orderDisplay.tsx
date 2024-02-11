import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/utils/api";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { AiOutlineDelete } from "react-icons/ai";
import { CgSpinner } from "react-icons/cg";
import { HiOutlinePrinter } from "react-icons/hi";
import { useReactToPrint } from "react-to-print";

// import Accordion from "./accordion";
import ConfirmModal from "./modal/confirm";
import { type RouterOutput } from "@/server/api/root";

export type OrderDisplayProps = RouterOutput["orders"]["getMany"]["orders"][number] & {refetch: any}; // eslint-disable-line

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
      await  props.refetch();     // add the stock back to the products store
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
    <AccordionItem value={props.id}>
      <AccordionTrigger>
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
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col">
          <div
            className={clsx({
              " flex justify-center gap-2 ": true,
            })}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handlePrint}
            >
              <HiOutlinePrinter size={30}/>
            </Button>

            <ConfirmModal
              buttonAttrs={{}}
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
          <div className="w-full overflow-x-auto">
            {/*show order products(order info)*/}
            <Table>
              <TableHeader >
                <TableRow>
                  <TableHead className="w-[100px]">{t("orderDisplay.table.name")}
                  </TableHead>
                  <TableHead >
                    {t("orderDisplay.table.price")}
                  </TableHead>
                  <TableHead>
                    {t("orderDisplay.table.quantity")}
                  </TableHead>
                  <TableHead> {t("orderDisplay.table.total")}
                  </TableHead>
                  <TableHead>
                    {t("orderDisplay.table.profit")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.products.map((product) => {
                  const profit =
                    product.quantity *
                    (product.sellPriceAtSale - product.buyPriceAtSale);
                  totalProfit += profit;
                  return (
                    <TableRow
                      key={product.Product.id}
                    >
                      <TableHead
                        scope="row"
                      >
                        {product.Product.name}
                      </TableHead>
                      <TableCell >{product.sellPriceAtSale}$</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        {product.quantity * product.sellPriceAtSale}$
                      </TableCell>
                      <TableCell>{profit} $</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow >
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>{props.total}</TableCell>
                  <TableCell>{totalProfit}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default OrderDisplay;
export { OrderPrint };
