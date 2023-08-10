import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import { type Category, PrismaClient } from "@prisma/client";
// import { env } from "@/env.mjs";

const prisma = new PrismaClient();

async function main() {
  const uniqueCategoryNames = faker.helpers.uniqueArray(
    () => faker.word.sample(),
    20
  );
  let uniqueCategoryNamesI = 0;
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      userName: "admin",
      phone: "admin",
      role: "ADMIN",
      password: await bcrypt.hash(
        "admin",
        +(process.env.CRYPTROUNDS as string)
      ),
      category: {
        create: new Array(20).fill(0).map(() => {
          return {
            image: faker.image.avatar(),
            name: uniqueCategoryNames[uniqueCategoryNamesI++] as string,
          };
        }),
      },
    },
    include: {
      category: true,
    },
  });
  const products = await prisma.product.createMany({
    data: new Array(400).fill(0).map(() => {
      return {
        createdById: admin.id,
        name: faker.commerce.productName(),
        sellPrice: +faker.commerce.price(),
        stock: faker.number.int({
          max: 100,
          min: 0,
        }),
        buyPrice: +faker.commerce.price(),
        image: faker.image.url(),
        categoryId: (admin.category[Math.floor(Math.random() * 20)] as Category)
          .id,
      };
    }),
  });
  console.log({ admin, products });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
