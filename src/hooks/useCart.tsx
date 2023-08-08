import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CART_KEY = ["cart"] as const;

/**
 * this information enough to describe products/offers
 */
export type CartItem = {
  id: string;
  quantity: number;
};

export const CartItemTypes = {
  product: 0,
  offer: 1,
} as const;

export type CartItemTypes = (typeof CartItemTypes)[keyof typeof CartItemTypes];

export type CartT = {
  products: CartItem[];
  offers: CartItem[];
};

/**
 * cart will only hold id and quantity of the item, any other data needed for those items the user of this hook should query for it, i guess this approach is better for memeory usage
 */
export function useCart() {
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

/**
 *
 * @param id
 * @param type CartItemTypes: 0 => product, 1 => offer
 */
export function useCartAdd() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: CartItem["id"]; type: CartItemTypes }>({
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        if (!prev) {
          return {
            offers: [],
            products: [],
          };
        }
        let old: undefined | CartItem = undefined;
        if (variables.type === CartItemTypes.product) {
          old = prev.products.find((i) => i.id === variables.id);
          return {
            ...prev,
            products: [
              ...prev.products.filter((i) => i.id !== variables.id),
              { id: variables.id, quantity: (old?.quantity || 0) + 1 },
            ],
          };
        } else {
          old = prev.offers.find((i) => i.id === variables.id);
          return {
            ...prev,
            offers: [
              ...prev.offers.filter((i) => i.id !== variables.id),
              { id: variables.id, quantity: (old?.quantity || 0) + 1 },
            ],
          };
        }
      });
    },
  });
}

export function useCartDec() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: CartItem["id"]; type: CartItemTypes }>({
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        if (!prev) {
          return {
            offers: [],
            products: [],
          };
        }
        let old: undefined | CartItem = undefined;
        if (variables.type === CartItemTypes.product) {
          old = prev.products.find((i) => i.id === variables.id);
          if (!old) return { ...prev };
          if (old.quantity === 1) {
            return {
              ...prev,
              products: [...prev.products.filter((i) => i.id !== variables.id)],
            };
          }
          return {
            ...prev,
            products: [
              ...prev.products.filter((i) => i.id !== variables.id),
              { id: variables.id, quantity: old.quantity - 1 },
            ],
          };
        } else {
          old = prev.offers.find((i) => i.id === variables.id);
          if (!old) return { ...prev };
          if (old.quantity === 1) {
            return {
              ...prev,
              offers: [...prev.offers.filter((i) => i.id !== variables.id)],
            };
          }
          return {
            ...prev,
            offers: [
              ...prev.offers.filter((i) => i.id !== variables.id),
              { id: variables.id, quantity: old.quantity - 1 },
            ],
          };
        }
      });
    },
  });
}

export function useCartRemove() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: CartItem["id"]; type: CartItemTypes }>({
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        if (!prev) {
          return {
            offers: [],
            products: [],
          };
        }
        if (variables.type === CartItemTypes.product) {
          return {
            ...prev,
            products: [...prev.products.filter((i) => i.id !== variables.id)],
          };
        } else {
          return {
            ...prev,
            offers: [...prev.offers.filter((i) => i.id !== variables.id)],
          };
        }
      });
    },
  });
}

export function useCartClear() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
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

export function useCartSet() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: CartItem["id"]; type: CartItemTypes; quantity: number }
  >({
    // eslint-disable-next-line @typescript-eslint/require-await
    async mutationFn(variables) {
      if (variables.quantity < 0) {
        throw new Error("Cart: CANNOT SET ITEM QUANTITY LESS THAN ZERO");
      }
      queryClient.setQueryData<CartT>(CART_KEY, (prev) => {
        if (!prev) {
          return {
            offers: [],
            products: [],
          };
        }
        if (variables.type === CartItemTypes.product) {
          return {
            ...prev,
            products: [
              ...prev.products.filter((i) => i.id !== variables.id),
              {
                id: variables.id,
                quantity: variables.quantity,
              },
            ],
          };
        } else {
          return {
            ...prev,
            offers: [
              ...prev.offers.filter((i) => i.id !== variables.id),
              {
                id: variables.id,
                quantity: variables.quantity,
              },
            ],
          };
        }
      });
    },
  });
}
