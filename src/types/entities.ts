import z from "zod";

export const payloadSchema = z.object({
  id: z.string(),
  role: z.enum(["ADMIN", "STAFF"]),
});

export const categorySchema = z.object({
  name: z.string(),
  image: z.string().url(),
});

export const productSchema = z.object({
  image: z.string().url(),
  stock: z.number().gte(0),
  buyPrice: z.number().gt(0),
  sellPrice: z.number().gt(0),
  name: z.string(),
  categoryId: z.string(),
});

export const orderSchema = z.object({
  products: z.array(z.object({ id: z.string(), quantity: z.number() })),
});

export const loginSchema = z.object({
  userName: z.string().min(3),
  password: z.string().min(4),
});
