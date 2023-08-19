import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  CartItemTypes,
  useCart,
  useCartDec,
  useCartInc,
  useCartRemove,
  useCartSet,
} from "@/hooks/useCart";
import { PaginationUtis, usePagination } from "@/hooks/usePagination";
import { api } from "@/utils/api";
import { type Product } from "@prisma/client";
import { matchSorter } from "match-sorter";
import { useTranslation } from "react-i18next";
import { AiOutlineMinus } from "react-icons/ai";
import { MdRemoveShoppingCart } from "react-icons/md";
import { RiAddCircleLine, RiAddLine } from "react-icons/ri";

export type CartUtilsProps = {
  id: Product["id"];
  stock: number;
  quantity: number;
  type: CartItemTypes;
  setError: (value: React.SetStateAction<string>) => void;
};
/**
 * Cart utils component, render increase/decrease/remove/set buttons
 */
export function CartUtils(props: CartUtilsProps) {
  const cartInc = useCartInc();
  const cartDec = useCartDec();
  const cartSet = useCartSet();
  const cartRemove = useCartRemove();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* REMOVE */}
      <button
        type="button"
        className="h-fit w-fit rounded-lg bg-red-300 p-3"
        onClick={() => {
          cartRemove.mutate({ id: props.id, type: props.type });
        }}
      >
        <MdRemoveShoppingCart />
      </button>
      {/* DECREASE */}
      <button
        type="button"
        className="h-fit w-fit rounded-lg bg-yellow-300 p-3"
        onClick={() => {
          cartDec.mutate({ id: props.id, type: props.type });
        }}
      >
        <AiOutlineMinus />
      </button>
      {/* SET: disabled with offer, you get the whole offer or not*/}
      <label className="my-2">
        <input
          type="number"
          max={props.stock}
          step={0.5}
          value={props.quantity}
          disabled={props.type === CartItemTypes.offer}
          className="mx-2 w-20 rounded-2xl p-2 text-gray-500 border-2 border-gray-500"
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            if (isNaN(v)) {
              props.setError("quantity cannot be NaN");
              cartSet.mutate({
                id: props.id,
                quantity: NaN,
                type: props.type,
              });
              return;
            }
            if (v > props.stock) {
              props.setError(
                "order quantity cannot be greater than product stock"
              );
              return;
            }
            if (v < 0) {
              props.setError("order quantity cannot be less than zero");
              return;
            }
            props.setError("");
            cartSet.mutate({
              id: props.id,
              quantity: v,
              type: props.type,
            });
          }}
        />
      </label>
      {/* INCREASE */}
      <button
        type="button"
        disabled={props.quantity >= props.stock}
        className="h-fit w-fit rounded-lg bg-green-300 p-3 disabled:bg-gray-500"
        onClick={() => {
          cartInc.mutate({ id: props.id, type: props.type });
        }}
      >
        <RiAddLine />
      </button>
    </div>
  );
}

type ProductProps = Pick<
  Product,
  "sellPrice" | "id" | "image" | "name" | "stock"
> & {
  /**
   * if there's quantity that's mean this product is in the cart with this quantity
   */
  quantity?: number;
};

export const KeypadDisplay: React.FC<ProductProps> = (props) => {
  const { t } = useTranslation();
  const cartInc = useCartInc();
  const [error, setError] = useState("");

  return (
    <div className={`flex h-fit flex-col gap-1 w-full`} key={props.id}>
      <div className="h-52 overflow-hidden relative">
        <Image
          alt="item-card"
          src={props.image}
          className="h-auto w-full object-cover"
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="w-full h-16">
        <h2 className="text-2xl text-ellipsis line-clamp-2 ">{props.name}</h2>
      </div>
      <span className="text-green-700">piece price: {props.sellPrice}$</span>
      <span className="text-green-700 line-clamp-1">
        order price: {(props.quantity || 0) * props.sellPrice}$
      </span>
      <span className="text-gray-500">
        Stock: {props.stock - (props?.quantity || 0)}
      </span>
      {props.quantity !== undefined ? (
        <div className="m-auto h-32 overflow-y-auto">
          <CartUtils
            id={props.id}
            stock={props.stock}
            quantity={props.quantity}
            type={CartItemTypes.product}
            setError={setError}
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={props.stock <= 0}
          onClick={() =>
            cartInc.mutate({ id: props.id, type: CartItemTypes.product })
          }
          className="mb-2 mr-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-600"
        >
          {t("productDisplay.modes.keypad.action")}
        </button>
      )}
      <p className="m-2 text-red-700">{error}</p>
    </div>
  );
};

export const LibraryDisplay: React.FC<ProductProps> = (props) => {
  const cartInc = useCartInc();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex h-5/6 w-full" key={props.id}>
        <div className="h-full w-1/4 overflow-hidden relative mr-2">
          <Image
            alt="item-card"
            src={props.image}
            className="object-cover"
            fill={true}
            sizes="33vw"
          />
        </div>
        <div className="flex h-full w-full flex-col">
          <div className="w-full h-5/6">
            <h2 className="text-2xl text-ellipsis line-clamp-2 ">
              {props.name}
            </h2>
          </div>
          <p>
            <span className="text-gray-500 text-xl">
              {props.stock - (props.quantity || 0)} :{" "}
            </span>
            <span className="text-green-500 text-xl"> {props.sellPrice}$</span>
          </p>
          {props.quantity !== undefined && (
            <div className="m-auto">
              <CartUtils
                id={props.id}
                stock={props.stock}
                quantity={props.quantity}
                type={CartItemTypes.product}
                setError={setError}
              />
            </div>
          )}
        </div>
        {props.quantity === undefined && (
          <button
            disabled={props.stock <= 0}
            onClick={() =>
              cartInc.mutate({ id: props.id, type: CartItemTypes.product })
            }
            className=" rounded-xl py-2.5 text-2xl font-medium text-gray-700 focus:outline-none disabled:text-gray-400"
          >
            <RiAddCircleLine />
          </button>
        )}
      </div>

      <p className="m-2 text-red-700">{error}</p>
    </div>
  );
};

export function LibraryDisplaySkeleton(props: { count: number }) {
  return (
    <div role="status" className="w-full animate-pulse   rounded  p-4 md:p-6">
      {new Array(props.count).fill(0).map((_, i) => (
        <div className="my-4 flex items-center justify-between" key={i}>
          <div>
            <div className="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 "></div>
            <div className="h-2 w-32 rounded-full bg-gray-200 "></div>
          </div>
          <div className="h-2.5 w-12 rounded-full bg-gray-300 "></div>
        </div>
      ))}
    </div>
  );
}

export type ProductDisplayProps = {
  categoryFilter: string;
  /**
   * should be filter based on the product name or id
   */
  productFilter: string;
  displayType: "library" | "keypad";
};

// main component
const ProductDisplay: React.FC<ProductDisplayProps> = (props) => {
  const { t } = useTranslation();
  const cart = useCart();
  const [displayType, setDisplayType] = useState<
    ProductDisplayProps["displayType"]
  >(props.displayType);
  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return true;
    },
  });
  // apply category filter and the search on products data
  const productsData = useMemo(() => {
    console.log("in memo");
    if (!productsQuery.isLoading && !productsQuery.isError) {
      const d = productsQuery.data.filter((val) => {
        if (props.categoryFilter === "") return true;
        else return val.categoryId === props.categoryFilter;
      });
      return props.productFilter === ""
        ? d
        : matchSorter(d, props.productFilter, { keys: ["name", "id"] });
    }
    return productsQuery.data;
  }, [
    productsQuery.isLoading,
    productsQuery.isError,
    productsQuery.data,
    props.categoryFilter,
    props.productFilter,
  ]);
  const productsDataPage = usePagination({
    data: productsData ?? [],
    length: 20,
  });

  if (productsQuery.isError) {
    return <p>{JSON.stringify(productsQuery.error)}</p>;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ul className="m-auto my-2 flex w-4/5 justify-between rounded-3xl bg-gray-200 p-1">
        <li className="w-6/12">
          <input
            type="radio"
            id="library"
            name="displayPattern"
            value="library"
            className="peer hidden"
            defaultChecked={props.displayType === "library"}
            onChange={(e) => {
              setDisplayType(
                e.target.value as ProductDisplayProps["displayType"]
              );
            }}
          />
          <label
            htmlFor="library"
            className="flex w-full cursor-pointer justify-center rounded-3xl  p-2 text-gray-500 peer-checked:bg-white peer-checked:font-bold peer-checked:text-black peer-checked:shadow-lg"
          >
            {t("productDisplay.modes.Library")}
          </label>
        </li>
        <li className="w-1/2">
          <input
            type="radio"
            id="keypad"
            name="displayPattern"
            value="keypad"
            className="peer hidden"
            defaultChecked={props.displayType === "keypad"}
            onChange={(e) => {
              setDisplayType(
                e.target.value as ProductDisplayProps["displayType"]
              );
            }}
          />
          <label
            htmlFor="keypad"
            className="flex w-full cursor-pointer justify-center rounded-3xl  p-2  text-gray-500 peer-checked:bg-white peer-checked:font-bold peer-checked:text-black peer-checked:shadow-lg"
          >
            {t("productDisplay.modes.keypad.label")}
          </label>
        </li>
      </ul>

      <div className="flex h-full flex-wrap justify-around overflow-y-auto overflow-x-hidden pb-16">
        {productsData === undefined ? (
          <LibraryDisplaySkeleton count={5} />
        ) : (
          productsDataPage.values.map((product) => {
            const displayProps: ProductProps = {
              id: product.id,
              image: product.image,
              name: product.name,
              sellPrice: product.sellPrice,
              stock: product.stock,
              quantity: cart.data.products.find((i) => i.id === product.id)
                ?.quantity,
            };
            return displayType === "keypad" ? (
              <div className="w-5/12">
                <KeypadDisplay key={product.id} {...displayProps} />
              </div>
            ) : (
              <div className="w-11/12 h-1/4 overflow-hidden">
                <LibraryDisplay key={product.id} {...displayProps} />
              </div>
            );
          })
        )}
        <PaginationUtis {...productsDataPage} />
      </div>
    </div>
  );
};

export default ProductDisplay;
