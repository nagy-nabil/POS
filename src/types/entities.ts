import z from "zod";

export const categorySchema = z.object({
  name: z.string(),
  image: z.string().url(),
  // todo remove this default value
  createdById: z.string().default("clinkvaij0000d3ecgaqbiafl"),
});

export const productSchema = z.object({
  image: z.string().url(),
  stock: z.number().gte(0),
  price: z.number().gt(0),
  name: z.string(),
  // todo remove this default value
  createdById: z.string().default("clinkvaij0000d3ecgaqbiafl"),
  categoryId: z.string(),
});

export const orderSchema = z.object({
  // todo remove this default value
  createdById: z.string().default("clinkvaij0000d3ecgaqbiafl"),
  // TODO total need to be computed or at least decide how to store the total
  total: z.number().gt(0),
  products: z.array(z.object({ id: z.string(), quantity: z.number() })),
});

export const loginSchema = z.object({
  userName: z.string(),
  password: z.string(),
});
