import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Electronics",
  "Documents",
  "Wallet",
  "Keys",
  "Clothing",
  "Jewelry",
  "Bags",
  "Books",
  "Accessories",
  "Other",
];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Categories seeded successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
