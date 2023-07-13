import z from "zod";

export const userSchema = z.object({
  userName: z.string().min(3),
  email: z.string().email(),
  phone: z.string(),
});

export const payloadSchema = z.object({
  id: z.string(),
  role: z.enum(["ADMIN", "STAFF"]),
});

export const categorySchema = z.object({
  id: z.string().optional(),
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
  products: z.array(
    z.object({ id: z.string().nonempty(), quantity: z.number().min(1) })
  ),
});

export const loginSchema = userSchema.pick({ userName: true }).extend({
  password: z.string().min(4),
});

export const expenseTypeSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(4).optional(),
});

// // this model only hold expenses data but not indicating we spend this money
// model ExpenseStore {
//     id                  String                @id @default(cuid())
//     name                String
//     description         String?
//     // for user level concept, simply asking the user do you want to save this data for later use or not
//     // true indicate don't show this expense in the ui
//     onTheFly            Boolean               @default(false)
//     amount              Float
//     // null value indicate aperiodic expenses
//     remindAt            DateTime?
//     typeId              String
//     type                ExpenseTypes          @relation(fields: [typeId], references: [id])
//     createdAt           DateTime              @default(now())
//     createdById         String
//     createdBy           User                  @relation(fields: [createdById], references: [id])
//     Expenses            Expenses[]
//     SpendingsOnExpenses SpendingsOnExpenses[]
// }

export const expenseStoreSchema = z.object({
  name: z.string(),
  description: z.string().min(4).optional(),
  onTheFly: z.boolean().default(false),
  amount: z.number().gt(0),
  remindAt: z.date().optional(),
});
