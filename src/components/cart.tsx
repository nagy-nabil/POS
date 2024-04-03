import React, { useState } from "react";
import { useCart, useCartClear } from "@/hooks/useCart";
import { api } from "@/utils/api";
import type { Product } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { CgSpinner } from "react-icons/cg";

import { OfferItem, type OfferItemProps } from "./offerDisplay";
import { LibraryDisplay } from "./productDisplay";
import { Button } from "./ui/button";

export function CartView() {
  const cart = useCart();
  const cartClear = useCartClear();
  const products = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
  });
  const offers = api.offers.index.useQuery(undefined, {
    staleTime: Infinity,
  });
  const { t } = useTranslation();
  const [operationError, setOperationError] = useState("");
  const utils = api.useContext();

  const orderMut = api.orders.insertOne.useMutation({
    onError(error) {
      setOperationError(error.message);
    },
    onSuccess: (data) => {
      cartClear.mutate();
      // update products store
      utils.products.getMany.setData(undefined, (prev) => {
        const productsTemp: Product[] = [];
        const lookUp = new Set<string>();
        data.products.forEach((item) => {
          productsTemp.push(item.Product);
          lookUp.add(item.Product.id);
        });
        return prev
          ? [...productsTemp, ...prev.filter((test) => !lookUp.has(test.id))]
          : [];
      });
    },
  });

  if (
    products.isLoading ||
    products.isError ||
    offers.isError ||
    offers.isLoading
  ) {
    return null;
  }

  let total = 0;
  cart.data.products.forEach((item) => {
    total +=
      (products.data.find((i) => item.id === i.id)?.sellPrice || 0) *
      item.quantity;
  });

  cart.data.offers.forEach((offer) => {
    total +=
      (offers.data.find((i) => i.id === offer.id)?.price || 0) * offer.quantity;
  });

  const itemsLen =
    cart.data.offers.length +
    cart.data.products.reduce((prev, cur) => prev + cur.quantity, 0);
  return (
    <div className="overflow-hidden flex flex-col w-full h-full bg-accent p-2 text-accent-foreground">
      <div className="overflow-y-auto">
        {/* render cart products*/}
        <h1 className="text-3xl">Products</h1>
        {cart.data.products.map((val) => {
          const product = products.data.find((i) => i.id === val.id);
          if (!product) {
            return null;
          }
          return (
            <div key={product.id} className="w-full h-52 overflow-hidden">
              <LibraryDisplay
                key={val.id}
                {...product}
                quantity={val.quantity}
              />
            </div>
          );
        })}

        {/* render cart offers*/}
        <h1 className="text-3xl">Offers</h1>
        {cart.data.offers.map((offerOnCart) => {
          const offer = offers.data.find((i) => i.id === offerOnCart.id);
          if (!offer) {
            return null;
          }
          // form offer with products
          const tempOffer: OfferItemProps = {
            ...offer,
            quantity: offerOnCart.quantity,
            products: offer.products.map((productOnOffer) => {
              const productData = products.data.find(
                (product) => product.id === productOnOffer.productId,
              ) as Product;
              const productOnCart = cart.data.products.find(
                (product) => product.id === productOnOffer.productId,
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
            <div key={offer.id} className="w-11/12 overflow-hidden">
              <OfferItem key={offerOnCart.id} {...tempOffer} />
            </div>
          );
        })}
      </div>

      <p className="m-2 text-red-700">{operationError}</p>
      <footer className="flex flex-col mt-auto items-center ">
        <span className="text-xl text-green-700">
          {t("crate.footer.totalSpan")}: {total}$
        </span>

        <Button
          disabled={orderMut.isLoading || itemsLen === 0}
          variant={"default"}
          className="w-full"
          size={"lg"}
          type="button"
          onClick={() => orderMut.mutate(cart.data)}
        >
          {orderMut.isLoading ? (
            <CgSpinner className="animate-spin text-2xl" />
          ) : (
            t("crate.footer.button")
          )}
        </Button>
      </footer>
    </div>
  );
}
