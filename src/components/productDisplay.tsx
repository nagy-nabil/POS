import { CldImage } from 'next-cloudinary';
import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CartItemTypes,
  useCarOfferDec,
  useCarOffertInc,
  useCarProductDec,
  useCart,
  useCartProductInc,
  useCartProductSet,
  useCartRemoveOffer,
  useCartRemoveProduct,
} from "@/hooks/useCart";
import { PaginationUtis, usePagination } from "@/hooks/usePagination";
import { type CartItem } from "@/types/entities";
import { type TypedQueryParams } from "@/types/query";
import { api } from "@/utils/api";
import { type Product } from "@prisma/client";
import { matchSorter } from "match-sorter";
import { useTranslation } from "react-i18next";
import { AiOutlineMinus } from "react-icons/ai";
import { MdRemoveShoppingCart } from "react-icons/md";
import { RiAddCircleLine, RiAddLine } from "react-icons/ri";

import ProductModal from "./modal/productModal";

export type CartUtilsProps = {
  id: Product["id"];
  stock: number;
  /**
   * number of this item on the cart for both the offers and products
   */
  quantity: number;
  /**
   * product holds more data on the cart
   */
  quantityFromOffers?: number;
  type: CartItemTypes;
  setError: (value: React.SetStateAction<string>) => void;
  /**
   * for the offer may be remove it from here?
   */
  products?: CartItem[];
};
/**
 * Cart utils component, render increase/decrease/remove/set buttons
 */
export function CartUtils(props: CartUtilsProps) {
  const cartIncPro = useCartProductInc();
  const cartIncoffer = useCarOffertInc();

  const cartDecPro = useCarProductDec();
  const cartDecOffer = useCarOfferDec();

  const cartSet = useCartProductSet();

  const cartRemovePro = useCartRemoveProduct();
  const cartRemoveOffer = useCartRemoveOffer();

  const { id, type, products, quantityFromOffers = 0, quantity, stock } = props;

  const maxStock = stock - quantityFromOffers;

  return (
    <div className="flex justify-between  gap-1">
      {/* REMOVE */}
      <Button
        type="button"
        size={"icon"}
        variant={"destructive"}
        className="shrink-0"
        onClick={() => {
          if (type === CartItemTypes.product) {
            cartRemovePro.mutate({ id });
          } else if (type === CartItemTypes.offer && products) {
            cartRemoveOffer.mutate({ id, products });
          }
        }}
      >
        <MdRemoveShoppingCart size={20} />
      </Button>

      {/* DECREASE */}
      <Button
        type="button"
        size={"icon"}
        variant={"outline"}
        className="shrink-0"
        onClick={() => {
          if (type === CartItemTypes.product) {
            cartDecPro.mutate({ id });
          } else if (type === CartItemTypes.offer && products) {
            cartDecOffer.mutate({ id, products });
          }
        }}
      >
        <AiOutlineMinus size={20} />
      </Button>

      {/* SET: disabled with offer, you get the whole offer or not*/}
      <label className="shrink">
        <Input
          type="number"
          max={maxStock}
          step={0.5}
          value={quantity}
          disabled={type === CartItemTypes.offer}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            if (isNaN(v)) {
              props.setError("quantity cannot be NaN");
              cartSet.mutate({
                id: props.id,
                quantity: NaN,
              });
              return;
            }
            if (v > maxStock) {
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
            });
          }}
        />
      </label>

      {/* INCREASE */}
      <Button
        type="button"
        size={"icon"}
        variant={"outline"}
        disabled={quantity + quantityFromOffers >= stock}
        className=" bg-green-300  disabled:bg-gray-500 shrink-0"
        onClick={() => {
          if (type === CartItemTypes.product) {
            cartIncPro.mutate({ id });
          } else if (type === CartItemTypes.offer && products) {
            cartIncoffer.mutate({ id, products });
          }
        }}
      >
        <RiAddLine size={20} />
      </Button>
    </div>
  );
}

type ProductProps = Product & {
  /**
   * if there's quantity that's mean this product is in the cart with this quantity
   */
  quantity?: number;
  quantityFromOffers?: number;
};

export const KeypadDisplay: React.FC<ProductProps> = (props) => {
  const { t } = useTranslation();
  const cartInc = useCartProductInc();
  const [error, setError] = useState("");

  return (
    <div className={`flex h-fit flex-col gap-1 w-full`} key={props.id}>
      <div className="h-52 overflow-hidden relative">
        <CldImage
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
      <span>
        Stock:{" "}
        {props.stock - (props?.quantity || 0) - (props.quantityFromOffers || 0)}
      </span>
      <span className="text-green-500 line-clamp-1">
        piece price: {props.sellPrice}$
      </span>
      <span className="text-green-500 line-clamp-1">
        {/*show number with only 2 decimal digits*/}
        order price: {((props.quantity || 0) * props.sellPrice).toFixed(2)}$
      </span>
      {props.quantity !== undefined ? (
        <div className="m-auto overflow-y-auto">
          <CartUtils
            id={props.id}
            stock={props.stock}
            quantity={props.quantity}
            type={CartItemTypes.product}
            setError={setError}
          />
        </div>
      ) : (
        <div className="max-w-full gap-3 flex justify-between items-center">
          <Button
            className="w-full"
            type="button"
            variant={"default"}
            disabled={props.stock <= 0}
            onClick={() => cartInc.mutate({ id: props.id })}
          >
            {t("productDisplay.modes.keypad.action")}
          </Button>

          <ProductModal
            key={"updateProduct"}
            operationType="put"
            // @ts-ignore
            defaultValues={props}
          />
        </div>
      )}
      <p className="m-2 text-red-700">{error}</p>
    </div>
  );
};

export const LibraryDisplay: React.FC<ProductProps> = (props) => {
  const cartInc = useCartProductInc();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex h-5/6 w-full gap-2" key={props.id}>
        <div className="h-full w-1/4 overflow-hidden relative ">
          <CldImage
            alt="item-card"
            src={props.image}
            className="object-cover"
            fill={true}
            sizes="33vw"
          />
        </div>
        <div className="flex h-full w-full flex-col">
          <div className="w-full h-full">
            <h2 className="text-2xl text-ellipsis line-clamp-2 ">
              {props.name}
            </h2>
          </div>
          <p>
            <span className="text-gray-500 text-xl">
              {props.stock - (props.quantity || 0)} :{" "}
            </span>
            <span className="text-green-500 text-xl">
              {" "}
              {props.sellPrice}$ :{" "}
            </span>
            <span className="text-green-500 text-xl">
              {" "}
              {((props.quantity || 0) * props.sellPrice).toFixed(2)}$
            </span>
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
          <Button
            size="icon"
            disabled={props.stock <= 0}
            onClick={() => cartInc.mutate({ id: props.id })}
          >
            <RiAddCircleLine size={25} />
          </Button>
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
  displayType: "library" | "keypad";
};

// main component
const ProductDisplay: React.FC<ProductDisplayProps> = (props) => {
  const router = useRouter();
  const query = router.query as TypedQueryParams;
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
    if (!productsQuery.isLoading && !productsQuery.isError) {
      const d = productsQuery.data.filter((val) => {
        if (query.categoryFilter === undefined || query.categoryFilter === "")
          return true;
        else return val.categoryId === query.categoryFilter;
      });
      return query.productFilter === "" || query.productFilter === undefined
        ? d
        : matchSorter(d, query.productFilter, { keys: ["name", "id"] });
    }
    return productsQuery.data;
  }, [
    productsQuery.isLoading,
    productsQuery.isError,
    productsQuery.data,
    query,
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
            const productFromCart = cart.data.products.find(
              (i) => i.id === product.id
            );
            const displayProps: ProductProps = {
              ...product,
              quantity: productFromCart?.quantity,
              quantityFromOffers: productFromCart?.quantityFromOffers,
            };
            return displayType === "keypad" ? (
              <div className="w-3/6 px-1" key={product.id}>
                <KeypadDisplay key={product.id} {...displayProps} />
              </div>
            ) : (
              <div className="w-11/12 h-1/4 overflow-hidden" key={product.id}>
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
