import type { CartItem, CartProduct, CartT } from "@/types/entities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * key used in react query cache
 */
const CART_KEY = ["cart"] as const;

export const CartItemTypes = {
  product: 0,
  offer: 1,
} as const;

export type CartItemTypes = (typeof CartItemTypes)[keyof typeof CartItemTypes];

/**
 * cart will only hold id and quantity of the item, any other data needed for those items the user of this hook should query for it, i guess this approach is better for memeory usage
 */
function useCart() {
  return useQuery<CartT, Error, CartT>({
    queryKey: CART_KEY,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    initialData: {
      products: [],
      offers: [],
    },
  });
}

type CartProductIncVar = {
  id: CartProduct["id"];
  /**
   * do you want this increase to be for single item or this quantity is increased due to offer
   *
   * default is false
   */
  fromOffer?: boolean;
  /**
   * increase by this quantity or default increase by one
   */
  quantity?: number;
};

/**
 * increase product quantity by one or by custom quantity, if not in the cart add it
 * @param id
 */
function useCartProductInc() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CartProductIncVar>({
    networkMode: "always",
    mutationKey: ["incProduct"],
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        const { fromOffer = false, id, quantity = 1 } = variables;

        // handle if the cart have not been inited yet
        if (!prev) {
          const item: CartProduct = {
            id,
            quantity: fromOffer ? 0 : quantity,
            quantityFromOffers: fromOffer ? quantity : 0,
          };

          return {
            offers: [],
            products: [item],
          };
        }

        // inc the quantity, if not found add it to the cart
        const old = prev.products.find((i) => i.id === id) ?? {
          id: "",
          quantity: 0,
          quantityFromOffers: 0,
        };

        const item: CartT["products"][number] = {
          id,
          quantity: !fromOffer ? quantity + old.quantity : old.quantity,
          quantityFromOffers: fromOffer
            ? quantity + old.quantityFromOffers
            : old.quantityFromOffers,
        };

        return {
          ...prev,
          products: [
            ...prev.products.filter((i) => i.id !== variables.id),
            item,
          ],
        };
      });
    },
  });
}

type CartOfferIncVar = {
  id: CartItem["id"];
  /**
   * increase by this quantity or default increase by one
   */
  quantity?: number;
  /**
   * offer products with their quantity, that's just to keep those hooks add/remove from the cart without any fetching logic
   */
  products: CartItem[];
};

/**
 *
 * @param id
 */
function useCarOffertInc() {
  const queryClient = useQueryClient();
  const productInc = useCartProductInc();

  return useMutation<void, Error, CartOfferIncVar>({
    networkMode: "always",
    mutationKey: ["incOffer"],
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        const { id, products, quantity = 1 } = variables;

        // inc all products quantity
        products.forEach((product) =>
          productInc.mutate({
            id: product.id,
            fromOffer: true,
            quantity: product.quantity,
          }),
        );

        if (!prev) {
          const item: CartItem = {
            id,
            quantity,
          };

          return {
            offers: [item],
            products: [],
          };
        }

        const old = prev.offers.find((i) => i.id === id) ?? {
          id: "",
          quantity: 0,
        };

        const item: CartT["offers"][number] = {
          id: variables.id,
          quantity: old.quantity + quantity,
        };

        return {
          ...prev,
          offers: [...prev.offers.filter((i) => i.id !== id), item],
        };
      });
    },
  });
}

/**
 * decrease product quantity by one or by custom amount
 *
 * remove the item from the cart if (product.quantity === 0 && product.quantityFromOffers === 0)
 */
function useCarProductDec() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CartProductIncVar>({
    networkMode: "always",
    mutationKey: ["decProduct"],
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        if (!prev) {
          return {
            offers: [],
            products: [],
          };
        }

        const { id, fromOffer = false, quantity = 1 } = variables;

        const old = prev.products.find((i) => i.id === id);

        // cannot decrease value that doesn't exist
        if (!old) return { ...prev };

        const item: CartT["products"][number] = {
          id,
          quantity: !fromOffer ? old.quantity - quantity : old.quantity,
          quantityFromOffers: fromOffer
            ? old.quantityFromOffers - quantity
            : old.quantityFromOffers,
        };

        const newProducts = prev.products.filter((i) => i.id !== id);
        return {
          ...prev,
          products:
            item.quantity <= 0 && item.quantityFromOffers <= 0
              ? newProducts
              : [...newProducts, item],
        };
      });
    },
  });
}

/**
 * decrease product quantity by one or by custom amount
 *
 * remove the item from the cart if (product.quantity === 0 && product.quantityFromOffers === 0)
 */
function useCarOfferDec() {
  const queryClient = useQueryClient();
  const productDec = useCarProductDec();

  return useMutation<void, Error, CartOfferIncVar>({
    networkMode: "always",
    mutationKey: ["decOffer"],
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        if (!prev) {
          return {
            offers: [],
            products: [],
          };
        }

        const { id, quantity = 1, products } = variables;

        const old = prev.offers.find((i) => i.id === id);

        // cannot decrease value that doesn't exist
        if (!old) return { ...prev };

        //dec products
        products.forEach((product) =>
          productDec.mutate({
            id: product.id,
            fromOffer: true,
            quantity: product.quantity * quantity,
          }),
        );

        const item: CartT["offers"][number] = {
          id,
          quantity: old.quantity - quantity,
        };

        const newOffers = prev.offers.filter((i) => i.id !== id);

        return {
          ...prev,
          offers: item.quantity <= 0 ? newOffers : [...newOffers, item],
        };
      });
    },
  });
}

/**
 * remove single item from cart
 */
function useCartRemoveProduct() {
  const queryClient = useQueryClient();
  const productDec = useCarProductDec();

  return useMutation<void, Error, { id: CartItem["id"] }>({
    networkMode: "always",
    mutationKey: ["rmProduct"],
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      const { id } = variables;
      const old = queryClient
        .getQueryData<CartT>(CART_KEY)
        ?.products.find((i) => i.id === id);
      if (!old) return;
      productDec.mutate({
        id,
        quantity: old.quantity,
      });
    },
  });
}

/**
 * remove single item from cart
 */
function useCartRemoveOffer() {
  const queryClient = useQueryClient();
  const offerDec = useCarOfferDec();

  return useMutation<void, Error, { id: CartItem["id"]; products: CartItem[] }>(
    {
      networkMode: "always",
      mutationKey: ["rmOffer"],
      // eslint-disable-next-line @typescript-eslint/require-await
      async mutationFn(variables) {
        const { id, products } = variables;
        const old = queryClient
          .getQueryData<CartT>(CART_KEY)
          ?.offers.find((i) => i.id === id);

        if (!old) return;

        offerDec.mutate({
          id,
          quantity: old.quantity,
          products,
        });
      },
    },
  );
}

/**
 * remove all items from cart
 */
function useCartClear() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    networkMode: "always",
    mutationKey: ["clearCart"],
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn() {
      queryClient.setQueryData<CartT>(CART_KEY, () => {
        return {
          offers: [],
          products: [],
        };
      });
    },
  });
}

/**
 * set product quantity on the cart
 *
 * cannot set offer quantity (for now)
 */
function useCartProductSet() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: CartItem["id"]; quantity: number }>({
    networkMode: "always",
    mutationKey: ["setProduct"],
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      if (variables.quantity < 0) {
        throw new Error("Cart: CANNOT SET ITEM QUANTITY LESS THAN ZERO");
      }
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        const { id, quantity } = variables;
        if (!prev) {
          // create new item and append it
          const item: CartT["products"][number] = {
            id,
            quantity,
            quantityFromOffers: 0,
          };

          return {
            offers: [],
            products: [item],
          };
        }

        const oldItem = prev.products.find((product) => product.id === id);
        return {
          ...prev,
          products: [
            ...prev.products.filter((i) => i.id !== id),
            {
              id,
              quantity,
              quantityFromOffers: oldItem?.quantityFromOffers ?? 0,
            },
          ],
        };
      });
    },
  });
}

export {
  useCart,
  CART_KEY,
  useCarOfferDec,
  useCarOffertInc,
  useCarProductDec,
  useCartClear,
  useCartProductInc,
  useCartRemoveOffer,
  useCartRemoveProduct,
  useCartProductSet,
};
