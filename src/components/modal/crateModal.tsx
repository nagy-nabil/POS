import React, { type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { FaShoppingBag } from "react-icons/fa";
import CustomModal from ".";

export type CrateItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type CrateProps = {
  onCrate: CrateItem[];
  setOnCrate: Dispatch<SetStateAction<CrateItem[]>>;
};

const CrateModal: React.FC<CrateProps> = (props) => {
  const queryClient = useQueryClient();
  const orderMut = api.orders.insertOne.useMutation();

  let cash = 0;
  return (
    <CustomModal
      key="crateModal"
      buttonChildren={
        <>
          <span>You added {props.onCrate.length} items</span>
          <span>
            <FaShoppingBag className="inline" /> ${cash}
          </span>
        </>
      }
      buttonAttrs={{
        className:
          "fixed bottom-4 left-4 flex h-fit w-11/12 justify-between rounded-3xl bg-black p-3 text-white",
      }}
      modalChildren={
        <>
          {props.onCrate.map((val) => {
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
                    props.setOnCrate((prev) => {
                      const temp = prev.find((temp) => temp.id === val.id);
                      if (temp !== undefined) {
                        temp.quantity--;
                      } else {
                        return [...prev];
                      }
                      return [
                        ...prev.filter((temp) => temp.id !== val.id),
                        temp,
                      ];
                    });
                  }}
                >
                  -
                </button>
                <button
                  className="h-fit w-fit rounded-lg bg-green-300 p-3"
                  onClick={() => {
                    props.setOnCrate((prev) => {
                      const temp = prev.find((temp) => temp.id === val.id);
                      if (temp !== undefined) {
                        temp.quantity++;
                      } else {
                        return [...prev];
                      }
                      return [
                        ...prev.filter((temp) => temp.id !== val.id),
                        temp,
                      ];
                    });
                  }}
                >
                  +
                </button>
                <button
                  className="h-fit w-fit rounded-lg bg-red-300 p-3"
                  onClick={() => {
                    props.setOnCrate((prev) => {
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
                  products: props.onCrate.map((product) => ({
                    id: product.id,
                    quantity: product.quantity,
                  })),
                },
                {
                  onSuccess: () => {
                    queryClient
                      .invalidateQueries([
                        ["orders", "getMany"],
                        { type: "query" },
                      ])
                      .catch((e) => {
                        console.log(
                          "🪵 [crate.tsx:102] ~ token ~ \x1b[0;32me\x1b[0m = ",
                          e
                        );
                      });
                  },
                }
              );
              props.setOnCrate([]);
            }}
          >
            CheckOut
          </button>
        </>
      }
    />
  );
};
export default CrateModal;
