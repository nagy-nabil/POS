import z from "zod";

const userSchema = z.object({
  userName: z.string().min(3),
  email: z.string().email(),
  phone: z.string(),
});

const payloadSchema = z.object({
  id: z.string(),
  role: z.enum(["ADMIN", "STAFF"]),
});

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  image: z.string().url(),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  image: z.string().url(),
  stock: z.number().gte(0),
  buyPrice: z.number().gt(0),
  sellPrice: z.number().gt(0),
  categoryId: z.string().nonempty(),
});
const productOnOfferSchema = z.object({
  productId: z.string().nonempty(),
  quantity: z.number().min(0),
  price: z.number().gt(0),
});

const offerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  products: z.array(productOnOfferSchema).nonempty(),
});

const cartItemSchema = z.object({
  id: z.string().nonempty(),
  quantity: z.number().min(0),
});

const cartProductSchema = cartItemSchema.extend({
  quantityFromOffers: z.number().min(0),
});

type CartItem = z.infer<typeof cartItemSchema>;
type CartProduct = z.infer<typeof cartProductSchema>;

const CartSchema = z.object({
  products: z.array(cartProductSchema),
  offers: z.array(cartItemSchema),
});

type CartT = z.infer<typeof CartSchema>;

const orderSchema = CartSchema;
const loginSchema = userSchema.pick({ userName: true }).extend({
  password: z.string().min(4),
});

const expenseTypeSchema = z.object({
  id: z.string().nonempty().optional(),
  name: z.string().min(3),
  description: z.string().min(4).optional(),
});

const expenseStoreSchema = z.object({
  id: z.string().nonempty().optional(),
  name: z.string().min(3),
  description: z.string().min(4).optional(),
  onTheFly: z.boolean().default(false),
  amount: z.number().gt(0),
  remindAt: z.date().optional(),
  typeId: z.string().nonempty(),
});

const expensesSchema = z.object({
  id: z.string().nonempty().optional(),
  description: z.string().optional(),
  additionalAmount: z.number().gte(0).default(0),
  expenseStoreIds: z.array(z.string()),
});

const productsOnLossSchema = z.object({
  productId: z.string().nonempty(),
  quantity: z.number().gt(0),
});

const lossesSchema = z.object({
  id: z.string().nonempty().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  additionalAmount: z.number().default(0),
  products: z.array(productsOnLossSchema).nonempty(),
});

export {
  userSchema,
  CartSchema,
  cartItemSchema,
  categorySchema,
  expenseStoreSchema,
  expenseTypeSchema,
  expensesSchema,
  loginSchema,
  lossesSchema,
  offerSchema,
  orderSchema,
  payloadSchema,
  productOnOfferSchema,
  productSchema,
  productsOnLossSchema,
};

export type { CartT, CartItem, CartProduct };
