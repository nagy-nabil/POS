import React, { useState } from "react";
import { api } from "@/utils/api";
import { type Product } from "@prisma/client";
import { RiAddCircleLine } from "react-icons/ri";
import { type CrateItem } from "@/components/modal/crateModal";
import { useAuth } from "@/hooks/useAuth";

type ProductProps = Pick<
  Product,
  "sellPrice" | "id" | "image" | "name" | "stock"
> & {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

export const KeypadDisplay: React.FC<ProductProps> = (props) => {
  return (
    <div
      className="m-3 flex h-fit w-2/5 flex-col gap-1 md:w-1/5"
      key={props.id}
    >
      <img alt="item-card" src={props.image} className="h-24 w-full" />
      <h2 className="text-2xl">{props.name}</h2>
      <span className="text-green-500">price: {props.sellPrice}$</span>
      <span className="text-gray-500">Quantity: {props.stock}</span>
      {/* TODO show add and decrease button if the item in the crate */}
      <button
        onClick={props.onClick}
        className="mb-2 mr-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 "
      >
        Add To Cart
      </button>
    </div>
  );
};

export const LibraryDisplay: React.FC<ProductProps> = (props) => {
  return (
    <div className=" m-2 flex  h-12 w-11/12" key={props.id}>
      <div className="flex items-center">
        <img alt="item-card" src={props.image} className="h-12 w-12" />
      </div>
      <div className="ml-3 flex h-12 flex-col">
        <h2 className="text-2xl">{props.name}</h2>
        <p>
          <span className="text-gray-500">{props.stock} : </span>
          <span className="text-green-500"> {props.sellPrice}$</span>
        </p>
      </div>
      {/* TODO show add and decrease button if the item in the crate */}
      <button
        onClick={props.onClick}
        className="ml-auto rounded-xl   py-2.5 text-2xl font-medium text-gray-500 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 "
      >
        <RiAddCircleLine />
      </button>
    </div>
  );
};

export type ProductDisplayProps = {
  categoryFilter: string;
  displayType: "library" | "keypad";
  setOnCrate: React.Dispatch<React.SetStateAction<CrateItem[]>>;
};

// main component
const ProductDisplay: React.FC<ProductDisplayProps> = (props) => {
  const { setToken } = useAuth({ redirectAfterSet: "/signin" });
  const [displayType, setDisplayType] = useState<
    ProductDisplayProps["displayType"]
  >(props.displayType);
  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        setToken("");
        return false;
      }
      return true;
    },
  });

  if (productsQuery.isLoading) return <p>loading ...</p>;
  else if (productsQuery.isError) {
    return <p>{JSON.stringify(productsQuery.error)}</p>;
  }

  return (
    <div className="flex flex-col">
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
            className="flex w-full cursor-pointer justify-center rounded-3xl  p-3 text-gray-500 peer-checked:bg-white peer-checked:font-bold peer-checked:text-black peer-checked:shadow-lg"
          >
            Library
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
            className="flex w-full cursor-pointer justify-center rounded-3xl  p-3  text-gray-500 peer-checked:bg-white peer-checked:font-bold peer-checked:text-black peer-checked:shadow-lg"
          >
            Keypad
          </label>
        </li>
      </ul>

      <div className="flex flex-wrap justify-between overflow-y-auto overflow-x-hidden pb-16">
        {productsQuery.data
          .filter((val) => {
            if (props.categoryFilter === "") return true;
            else return val.categoryId === props.categoryFilter;
          })
          .map((product) => {
            const displayProps: ProductProps = {
              onClick: () => {
                props.setOnCrate((prev) => {
                  // check if the item already exist in the crate it exist increase the qunatity
                  let newItem: CrateItem;
                  const temp = prev.find((val) => val.id === product.id);
                  if (temp !== undefined) {
                    newItem = temp;
                    newItem.quantity++;
                  } else {
                    newItem = {
                      id: product.id,
                      name: product.name,
                      quantity: 1,
                      sellPrice: product.sellPrice,
                    };
                  }
                  return [
                    ...prev.filter((val) => val.id !== product.id),
                    newItem,
                  ];
                });
              },
              id: product.id,
              image: product.image,
              name: product.name,
              sellPrice: product.sellPrice,
              stock: product.stock,
            };

            return displayType === "keypad" ? (
              <KeypadDisplay key={product.id} {...displayProps} />
            ) : (
              <LibraryDisplay key={product.id} {...displayProps} />
            );
          })}
      </div>
    </div>
  );
};

export default ProductDisplay;
