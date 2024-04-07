import React, { useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { api } from "@/utils/api";
import { useTranslation } from "next-i18next";
import { FaShoppingBag } from "react-icons/fa";

import CustomModal from ".";
import { CartView } from "../cart";

// main crate
export function CartModal() {
  const cart = useCart();
  const products = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
  });
  const offers = api.offers.index.useQuery(undefined, {
    staleTime: Infinity,
  });
  const { t } = useTranslation();
  const dialgoRef = useRef<HTMLDialogElement>(null);

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
    <CustomModal
      header="Cart Check Out"
      dialogRef={dialgoRef}
      key="crateModal"
      buttonChildren={
        <>
          <span>
            {" "}
            {t("crate.prefix")} {itemsLen} {t("crate.postfix")}
          </span>
          <span>
            <FaShoppingBag className="inline" /> ${total}
          </span>
        </>
      }
      buttonAttrs={{
        disabled: cart.data.products.length + cart.data.offers.length === 0,
        className:
          "dark:bg-muted flex h-fit w-11/12 justify-between rounded-3xl bg-black p-3 text-white",
      }}
      dialogAttrs={{}}
      formAttrs={{}}
      modalChildren={<CartView onSuccess={() => dialgoRef.current?.close()}/>}
    />
  );
}
