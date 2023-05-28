import React from "react";

const ItemCard: React.FC<{
  imageUrl: string;
  price: number;
  name: string;
  quantity: number;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}> = (props) => {
  return (
    <div className="flex h-fit w-1/5 flex-col gap-3">
      <img alt="item-card" src={props.imageUrl} className="h-1/3" />
      <h2 className="text-2xl">{props.name}</h2>
      <span className="text-green-500">price: {props.price}$</span>
      <span className="text-gray-500">Quantity: {props.quantity}</span>
      <button
        onClick={props.onClick}
        className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Add To Cart
      </button>
    </div>
  );
};
export default ItemCard;
