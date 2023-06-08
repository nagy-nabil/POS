import z from "zod";

export const categorySchema = z.object({
  name: z.string(),
  image: z.string().url(),
  // todo remove this default value
  createdById: z.string().default("clinisiwc0000d318unn6pd7k"),
});

export const productSchema = z.object({
  image: z.string().url(),
  stock: z.number().gte(0),
  price: z.number().gt(0),
  name: z.string(),
  // todo remove this default value
  createdById: z.string().default("clinisiwc0000d318unn6pd7k"),
  categoryId: z.string(),
});

export const orderSchema = z.object({
  // todo remove this default value
  createdById: z.string().default("clinisiwc0000d318unn6pd7k"),
  // TODO total need to be computed or at least decide how to store the total
  total: z.number().gt(0),
  products: z.array(z.object({ id: z.string(), quantity: z.number() })),
});
