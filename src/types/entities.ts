import z from "zod";

export const payloadSchema = z.object({
  id: z.string(),
  role: z.enum(["ADMIN", "STAFF"]),
});

export const categorySchema = z.object({
  name: z.string().min(3),
  image: z.string().url(),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  image: z.string().url(),
  stock: z.number().gte(0),
  buyPrice: z.number().gt(0),
  sellPrice: z.number().gt(0),
  categoryId: z.string().nonempty(),
});

export const orderSchema = z.object({
  products: z.array(z.object({ id: z.string(), quantity: z.number() })),
});

export const loginSchema = z.object({
  userName: z.string().min(3),
  password: z.string().min(4),
});
