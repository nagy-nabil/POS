import React, { type Dispatch, type SetStateAction } from "react";

export type CrateItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

export type CrateProps = {
  items: CrateItem[];
  setItems: Dispatch<SetStateAction<CrateItem[]>>;
};

const Crate: React.FC<CrateProps> = (props) => {
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
            <span className="text-green-400">
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

      <span className="text-2xl text-green-400">Cash: {cash}$</span>

      <button className="h-fit w-fit rounded-xl bg-green-400 p-4">
        CheckOut
      </button>
    </div>
  );
};
export default Crate;
