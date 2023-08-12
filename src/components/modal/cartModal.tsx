import React, { useRef, useState } from "react";
import { useCart, useCartClear } from "@/hooks/useCart";
import { api } from "@/utils/api";
import { type Product } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { CgSpinner } from "react-icons/cg";
import { FaShoppingBag } from "react-icons/fa";

import CustomModal from ".";
import { OfferItem, OfferItemProps } from "../offerDisplay";
import { LibraryDisplay } from "../productDisplay";

// main crate
export function CartModal() {
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
  const dialgoRef = useRef<HTMLDialogElement>(null);
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
          ? [...prev.filter((test) => !lookUp.has(test.id)), ...productsTemp]
          : [];
      });
      if (dialgoRef.current !== null) dialgoRef.current.close();
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

  function calcItemsLen() {
    return cart.data.offers.length + cart.data.products.length;
  }

  return (
    <CustomModal
      header="Cart Check Out"
      dialogRef={dialgoRef}
      key="crateModal"
      buttonChildren={
        <>
          <span>
            {" "}
            {t("crate.prefix")} {calcItemsLen()} {t("crate.postfix")}
          </span>
          <span>
            <FaShoppingBag className="inline" /> ${total}
          </span>
        </>
      }
      buttonAttrs={{
        disabled: cart.data.products.length + cart.data.offers.length === 0,
        className:
          "flex h-fit w-11/12 justify-between rounded-3xl bg-black p-3 text-white",
      }}
      dialogAttrs={{}}
      formAttrs={{}}
      modalChildren={
        <div className="flex flex-col w-full h-full">
          {/* render cart products*/}
          <h1 className="text-3xl">Products</h1>
          {cart.data.products.map((val) => {
            const product = products.data.find((i) => i.id === val.id);
            if (!product) {
              return null;
            }
            return (
              <div key={product.id} className="w-11/12 h-52 overflow-hidden">
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
          {cart.data.offers.map((item) => {
            const offer = offers.data.find((i) => i.id === item.id);
            if (!offer) {
              return null;
            }
            // form offer with products
            const tempOffer: OfferItemProps = {
              ...offer,
              quantity: item.quantity,
              products: offer.products.map((i) => ({
                ...i,
                product: products.data.find(
                  (i2) => i2.id === i.productId
                ) as Product,
              })),
            };
            return (
              <div key={offer.id} className="w-11/12 overflow-hidden">
                <OfferItem key={item.id} {...tempOffer} />
              </div>
            );
          })}

          <p className="m-2 text-red-700">{operationError}</p>
          <footer className="flex items-center justify-between">
            <span className="text-xl text-green-700">
              {t("crate.footer.totalSpan")}: {total}$
            </span>

            <button
              disabled={orderMut.isLoading}
              className=" h-fit w-fit rounded-3xl bg-green-500 p-2 text-white"
              type="button"
              onClick={() => {
                orderMut.mutate(
                  {
                    products: cart.data.products,
                  },
                  {}
                );
              }}
            >
              {orderMut.isLoading ? (
                <CgSpinner className="animate-spin text-2xl" />
              ) : (
                t("crate.footer.button")
              )}
            </button>
          </footer>
        </div>
      }
    />
  );
}
