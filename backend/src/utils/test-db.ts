import prisma from "../config/prisma";

async function testDatabaseConnection() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    const userCount = await prisma.user.count();

    console.log(`Users in database: ${userCount}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
