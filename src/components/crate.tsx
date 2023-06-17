import React, { type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type CrateItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type CrateProps = {
  items: CrateItem[];
  setItems: Dispatch<SetStateAction<CrateItem[]>>;
};

const Crate: React.FC<CrateProps> = (props) => {
  const queryClient = useQueryClient();
  const orderMut = api.orders.insertOne.useMutation();

  if (props.items.length === 0) {
    return null;
  }
  let cash = 0;
  return (
    <div className="flex flex-col">
      {props.items.map((val) => {
        const price = val.price * val.quantity;
        cash += price;
        return (
          <div key={val.id} className="flex gap-1">
            <span className="">{val.name}</span>
            <span className="text-gray-500">Quantity: {val.quantity}</span>
            <span className="text-green-600">
              price: {val.price}$ - {price}$
            </span>
            <button
              className="h-fit w-fit rounded-lg bg-yellow-300 p-3"
              onClick={() => {
                props.setItems((prev) => {
                  const temp = prev.find((temp) => temp.id === val.id);
                  if (temp !== undefined) {
                    temp.quantity--;
                  } else {
                    return [...prev];
                  }
                  return [...prev.filter((temp) => temp.id !== val.id), temp];
                });
              }}
            >
              -
            </button>
            <button
              className="h-fit w-fit rounded-lg bg-green-300 p-3"
              onClick={() => {
                props.setItems((prev) => {
                  const temp = prev.find((temp) => temp.id === val.id);
                  if (temp !== undefined) {
                    temp.quantity++;
                  } else {
                    return [...prev];
                  }
                  return [...prev.filter((temp) => temp.id !== val.id), temp];
                });
              }}
            >
              +
            </button>
            <button
              className="h-fit w-fit rounded-lg bg-red-300 p-3"
              onClick={() => {
                props.setItems((prev) => {
                  return [...prev.filter((temp) => temp.id !== val.id)];
                });
              }}
            >
              X
            </button>
          </div>
        );
      })}

      <span className="text-2xl text-green-700">Cash: {cash}$</span>

      <button
        disabled={orderMut.isLoading}
        className="my-3 h-fit w-fit rounded-xl bg-green-500 p-4 text-white"
        onClick={() => {
          orderMut.mutate(
            {
              products: props.items.map((product) => ({
                id: product.id,
                quantity: product.quantity,
              })),
            },
            {
              onSuccess: () => {
                queryClient
                  .invalidateQueries([["orders", "getMany"], { type: "query" }])
                  .catch((e) => {
                    console.log(
                      "🪵 [crate.tsx:102] ~ token ~ \x1b[0;32me\x1b[0m = ",
                      e
                    );
                  });
              },
            }
          );
          props.setItems([]);
        }}
      >
        CheckOut
      </button>
    </div>
  );
};
export default Crate;
