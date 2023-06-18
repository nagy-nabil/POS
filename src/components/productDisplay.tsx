import React from "react";
import { api } from "@/utils/api";
import ItemCard from "@/components/ItemCard";

export type ProductDisplayProps = {
  categoryFilter: string;
  displayType: "library" | "keypad";
};

const ProductDisplay: React.FC<ProductDisplayProps> = (props) => {
  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
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
          />
          <label
            htmlFor="keypad"
            className="flex w-full cursor-pointer justify-center rounded-3xl  p-3  text-gray-500 peer-checked:bg-white peer-checked:font-bold peer-checked:text-black peer-checked:shadow-lg"
          >
            Keypad
          </label>
        </li>
      </ul>

      <div className="flex h-screen flex-wrap justify-start gap-3 overflow-auto">
        <div
          role="status"
          className="max-w-sm animate-pulse rounded border border-gray-200 p-4 shadow dark:border-gray-700 md:p-6"
        >
          <div className="mb-4 flex h-48 items-center justify-center rounded bg-gray-300 dark:bg-gray-700">
            <svg
              className="h-12 w-12 text-gray-200 dark:text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 640 512"
            >
              <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
            </svg>
          </div>
          <div className="mb-4 h-2.5 w-48 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <span className="sr-only">Loading...</span>
        </div>
        {productsQuery.data
          .filter((val) => {
            if (props.categoryFilter === "") return true;
            else return val.categoryId === props.categoryFilter;
          })
          .map((product) => {
            return (
              <ItemCard
                key={product.id}
                imageUrl={product.image}
                name={product.name}
                sellPrice={product.sellPrice}
                quantity={product.stock}
                //   onClick={() => {
                //     setOnCrate((prev) => {
                //       // check if the item already exist in the crate it exist increase the qunatity
                //       let newItem: CrateItem;
                //       const temp = prev.find((val) => val.id === product.id);
                //       if (temp !== undefined) {
                //         newItem = temp;
                //         newItem.quantity++;
                //       } else {
                //         newItem = {
                //           id: product.id,
                //           name: product.name,
                //           quantity: 1,
                //           price: product.sellPrice,
                //         };
                //       }
                //       return [
                //         ...prev.filter((val) => val.id !== product.id),
                //         newItem,
                //       ];
                //     });
                //   }}
                onClick={() => console.log("add item")}
              />
            );
          })}
      </div>
    </div>
  );
};

export default ProductDisplay;
