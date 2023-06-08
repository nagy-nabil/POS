import z from "zod";

export const productSchema = z.object({
  image: z.string().url(),
  stock: z.number().gte(0),
  price: z.number().gt(0),
  name: z.string(),
  createdById: z.string(),
});
