import React, { useRef, useState } from "react";
import type { PaymentType, Product } from "@prisma/client";
import clsx from "clsx";
import { HiOutlinePrinter } from "react-icons/hi";
import { useReactToPrint } from "react-to-print";

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
};

const OrderPrint = React.forwardRef<HTMLDivElement, OrderDisplayProps>(
  function OrderPrint(props, ref) {
    return (
      <div ref={ref} className="p-5">
        <h1 className="text-center text-3xl">Zagy</h1>
        {/* TODO is this table dublicated? */}
        <div className="mb-3 flex flex-col gap-2">
          <p className="w-full overflow-hidden text-left text-xl font-bold ">
            # {props.id}
          </p>
          <span className="text-left">
            Created At: {props.createdAt.toUTCString()}
          </span>
          <span className="text-lg font-bold ">Total: {props.total} $</span>
        </div>

        <table className="w-full text-left text-sm text-black">
          <thead className="  text-xs  uppercase text-black">
            <tr>
              <th scope="col" className="px-4 py-2">
                name
              </th>
              <th scope="col" className="px-4 py-2">
                price
              </th>
              <th scope="col" className="px-4 py-2">
                qunatity
              </th>
              <th scope="col" className="px-4 py-2">
                total
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
  const toPrintRef = useRef<HTMLDivElement>(null);
  const [productsOpen, setProductsOpen] = useState(false);
  const handlePrint = useReactToPrint({
    content: () => toPrintRef.current,
    documentTitle: props.id,
  });

  return (
    <div className="flex flex-col">
      <button
        className="flex flex-col gap-2"
        onClick={() => setProductsOpen((prev) => !prev)}
      >
        <p className="w-full overflow-hidden text-left text-xl font-bold text-orange-700">
          # {props.id}
        </p>
        <span className="text-left">
          Created At: {props.createdAt.toUTCString()}
        </span>
        <span className="text-lg font-bold text-green-600">
          Total: {props.total} $
        </span>
      </button>

      <button
        onClick={handlePrint}
        className={clsx({
          "my-3 focus:outline-none": true,
          hidden: !productsOpen,
        })}
      >
        <HiOutlinePrinter className="m-auto h-fit w-fit rounded-lg border-2 border-black p-2 text-3xl text-gray-500" />
      </button>
      <div className="hidden">
        <OrderPrint {...props} ref={toPrintRef} />
      </div>
      <table
        className={clsx({
          hidden: !productsOpen,
          " w-full text-left text-sm text-gray-400 transition-all delay-75 ":
            true,
        })}
      >
        <thead className=" bg-gray-700 text-xs  uppercase text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-2">
              name
            </th>
            <th scope="col" className="px-4 py-2">
              price $
            </th>
            <th scope="col" className="px-4 py-2">
              qunatity
            </th>
            <th scope="col" className="px-4 py-2">
              total $
            </th>
          </tr>
        </thead>
        <tbody>
          {props.products.map((product) => (
            <tr className="bg-white dark:bg-gray-800" key={product.Product.id}>
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
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="m-auto mt-2 h-[0.5px] w-11/12 border-none bg-gray-500" />
    </div>
  );
};

export default OrderDisplay;
export { OrderPrint };