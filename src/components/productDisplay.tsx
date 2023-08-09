import React, { useMemo, useState } from "react";
import Image from "next/image";
import { type CrateItem } from "@/components/modal/crateModal";
import { useAuth } from "@/hooks/useAuth";
import { PaginationUtis, usePagination } from "@/hooks/usePagination";
import { api } from "@/utils/api";
import { type Product } from "@prisma/client";
import { matchSorter } from "match-sorter";
import { useTranslation } from "react-i18next";
import { RiAddCircleLine } from "react-icons/ri";

type ProductProps = Pick<
  Product,
  "sellPrice" | "id" | "image" | "name" | "stock"
> & {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  width: "w-2/5" | "w-2/3" | "w-3/4";
};

export const KeypadDisplay: React.FC<ProductProps> = (props) => {
  const { t } = useTranslation();
  return (
    <div
      className={`${props.width} m-3 flex h-fit flex-col gap-1 md:w-1/5`}
      key={props.id}
    >
      <Image
        alt="item-card"
        src={props.image}
        className="h-auto w-full"
        sizes="100vw"
        width={130}
        height={80}
      />
      <h2 className="text-2xl">{props.name}</h2>
      <span className="text-green-500">price: {props.sellPrice}$</span>
      <span className="text-gray-500">Quantity: {props.stock}</span>
      {/* TODO show add and decrease button if the item in the crate */}
      <button
        type="button"
        disabled={props.stock <= 0}
        onClick={props.onClick}
        className="mb-2 mr-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-600"
      >
        {t("productDisplay.modes.keypad.action")}
      </button>
    </div>
  );
};

export const LibraryDisplay: React.FC<ProductProps> = (props) => {
  return (
    <div className=" m-2 flex  h-1/6 w-11/12" key={props.id}>
      <div className="flex items-center">
        <Image
          alt="item-card"
          src={props.image}
          className="h-auto w-auto"
          width={50}
          height={50}
        />
      </div>
      <div className="ml-3 flex h-12 flex-col">
        <h2 className="h-fit w-fit text-2xl">{props.name}</h2>
        <p>
          <span className="text-gray-500">{props.stock} : </span>
          <span className="text-green-500"> {props.sellPrice}$</span>
        </p>
      </div>
      {/* TODO show add and decrease button if the item in the crate */}
      <button
        disabled={props.stock <= 0}
        onClick={props.onClick}
        className="ml-auto rounded-xl   py-2.5 text-2xl font-medium text-gray-700 focus:outline-none disabled:text-gray-400"
      >
        <RiAddCircleLine />
      </button>
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
      <span className="sr-only">Loading...</span>
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
  setOnCrate: React.Dispatch<React.SetStateAction<CrateItem[]>>;
};

// main component
const ProductDisplay: React.FC<ProductDisplayProps> = (props) => {
  const { t } = useTranslation();
  const { setToken } = useAuth({ redirectAfterSet: "/signin" });
  const [displayType, setDisplayType] = useState<
    ProductDisplayProps["displayType"]
  >(props.displayType);
  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        setToken("").catch((e) => {
          throw e;
        });
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

      <div className="flex flex-wrap justify-between overflow-y-auto overflow-x-hidden pb-16">
        {productsData === undefined ? (
          <LibraryDisplaySkeleton count={5} />
        ) : (
          productsDataPage.values.map((product) => {
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
                      stock: product.stock,
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
              width: "w-2/5",
            };

            return displayType === "keypad" ? (
              <KeypadDisplay key={product.id} {...displayProps} />
            ) : (
              <LibraryDisplay key={product.id} {...displayProps} />
            );
          })
        )}
        <PaginationUtis {...productsDataPage} />
      </div>
    </div>
  );
};

export default ProductDisplay;
