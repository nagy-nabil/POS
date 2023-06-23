import React, { useState } from "react";
import type { PaymentType, Product } from "@prisma/client";
import clsx from "clsx";

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

const OrderDisplay: React.FC<OrderDisplayProps> = (props) => {
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <button
        className="flex flex-col gap-2"
        onClick={() => setProductsOpen((prev) => !prev)}
      >
        <p className="w-full overflow-hidden text-left text-xl font-bold text-orange-700">
          # {props.id}
        </p>
        <span>Created At: {props.createdAt.toDateString()}</span>
        <span className="text-lg font-bold text-green-600">
          Total: {props.total} $
        </span>
      </button>

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
