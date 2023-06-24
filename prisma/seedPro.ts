import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
        create: {
          image: "https://via.placeholder.com/150x150",
          name: "default",
        },
      },
    },
    include: {
      category: true,
    },
  });
  console.dir({ admin }, { depth: 4 });
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
