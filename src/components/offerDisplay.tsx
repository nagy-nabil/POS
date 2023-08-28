import { useState } from "react";
import { CartItemTypes, useCarOffertInc, useCart } from "@/hooks/useCart";
import type { OfferIndex } from "@/server/api/routers/offers";
import { api } from "@/utils/api";
import { type Product } from "@prisma/client";
import { useTranslation } from "react-i18next";

import { CartUtils } from "./productDisplay";

// form type of offer with product data(join type)
export type OfferItemProps = Omit<OfferIndex[number], "products"> & {
  products: (OfferIndex[number]["products"][number] & {
    product: Product;
    /**
     * quantity of the single product on the cart.
     *
     * we need it calc the stock of offer corectlly which is min(product groups), suppose to cart.quantity+ cart.quantityFromOffers
     */
    quantityOnCart: number;
  })[];
} & {
  /**
   * indicate is the offer in the cart, if exist how many
   */
  quantity?: number;
};

function OfferItem(props: OfferItemProps) {
  const { t } = useTranslation();
  const cartInc = useCarOffertInc();
  const [error, setError] = useState("");

  // offer stock is the min between how many group you can form from each product
  const offerStock = Math.min(
    ...props.products.map((product) =>
      Math.floor(
        (product.product.stock - product.quantityOnCart) / product.quantity
      )
    )
  );

  return (
    <div className={`flex h-fit flex-col gap-1 w-full`} key={props.id}>
      <div className="w-full h-16">
        <h2 className="text-2xl text-ellipsis line-clamp-2 ">{props.name}</h2>
      </div>
      <span className="text-green-500">price: {props.price}$</span>
      <span className="text-gray-500">Stock: {offerStock}</span>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 ">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                name
              </th>
              <th scope="col" className="px-6 py-3">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3">
                price
              </th>
            </tr>
          </thead>
          <tbody>
            {props.products.map((product) => {
              return (
                <tr
                  key={product.productId}
                  className="border-b bg-white hover:bg-gray-50 "
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 ">
                    {product.product.name}
                  </td>
                  <td className="px-6 py-4">{product.quantity}</td>
                  <td className="px-6 py-4">{product.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {props.quantity !== undefined ? (
        <div className="m-auto h-32 overflow-y-auto">
          <CartUtils
            id={props.id}
            stock={offerStock}
            quantity={props.quantity}
            type={CartItemTypes.offer}
            setError={setError}
            products={props.products.map((i) => ({
              id: i.productId,
              quantity: i.quantity,
            }))}
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={offerStock <= 0}
          onClick={() =>
            cartInc.mutate({
              id: props.id,
              products: props.products.map((i) => ({
                id: i.productId,
                quantity: i.quantity,
              })),
            })
          }
          className="mb-2 mr-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-600"
        >
          {t("productDisplay.modes.keypad.action")}
        </button>
      )}
      <p className="m-2 text-red-700">{error}</p>
    </div>
  );
}

function OfferDisplay() {
  const cart = useCart();
  const products = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
  });
  const offers = api.offers.index.useQuery(undefined, {
    staleTime: Infinity,
  });

  if (products.isLoading || products.isError) return null;

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto flex flex-wrap">
      {offers.data?.map((offer) => {
        // form offer with products
        const tempOffer: OfferItemProps = {
          ...offer,
          quantity: cart.data.offers.find(
            (cartOffer) => cartOffer.id === offer.id
          )?.quantity,

          products: offer.products.map((productOnOffer) => {
            const productData = products.data.find(
              (product) => product.id === productOnOffer.productId
            ) as Product;
            const productOnCart = cart.data.products.find(
              (product) => product.id === productOnOffer.productId
            ) ?? {
              id: "",
              quantity: 0,
              quantityFromOffers: 0,
            };

            return {
              ...productOnOffer,
              product: productData,
              quantityOnCart:
                productOnCart.quantity + productOnCart.quantityFromOffers,
            };
          }),
        };
        return (
          <div key={offer.id} className="w-full">
            <OfferItem {...tempOffer} key={offer.id} />
          </div>
        );
      })}
    </div>
  );
}

export { OfferDisplay, OfferItem };
