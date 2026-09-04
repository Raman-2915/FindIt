import "dotenv/config";
import {
  PrismaClient,
  ClaimStatus,
  ItemStatus,
  MatchStatus,
  NotificationType,
  ReportStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("========================================");
  console.log("FindIt test-data reset started");
  console.log("========================================");

  // --------------------------------------------------
  // 1. Get existing users
  // --------------------------------------------------

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 2,
  });

  if (users.length < 2) {
    throw new Error(
      "At least 2 users must already exist. Create your two users first.",
    );
  }

  const userA = users[0];
  const userB = users[1];

  console.log(`User A: ${userA.name} (${userA.email})`);
  console.log(`User B: ${userB.name} (${userB.email})`);

  // --------------------------------------------------
  // 2. Delete existing transactional/test data
  // --------------------------------------------------

  console.log("\nDeleting existing test data...");

  await prisma.claim.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.lostItem.deleteMany({});
  await prisma.foundItem.deleteMany({});

  console.log("Claims deleted");
  console.log("Matches deleted");
  console.log("Notifications deleted");
  console.log("Reports deleted");
  console.log("Lost items deleted");
  console.log("Found items deleted");

  // --------------------------------------------------
  // 3. Create/find categories
  // --------------------------------------------------

  const categoryNames = [
    "Electronics",
    "Bags",
    "Wallets",
    "Keys",
    "Documents",
    "Accessories",
  ];

  const categories: Record<string, { id: string; name: string }> = {};

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });

    categories[name] = category;
  }

  console.log("\nCategories ready");

  // --------------------------------------------------
  // 4. Create LOST ITEMS
  // --------------------------------------------------

  const lostPhone = await prisma.lostItem.create({
    data: {
      userId: userA.id,
      categoryId: categories["Electronics"].id,
      title: "Black Samsung phone",
      description:
        "Black Samsung phone with a cracked screen and a transparent protective case. It was lost near the college library.",
      location: "College Library",
      lostAt: new Date("2026-08-10T10:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const lostBackpack = await prisma.lostItem.create({
    data: {
      userId: userA.id,
      categoryId: categories["Bags"].id,
      title: "Blue college backpack",
      description:
        "Blue backpack containing notebooks, a charger and a small pencil case. The bag has a white logo on the front.",
      location: "College Canteen",
      lostAt: new Date("2026-08-11T13:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const lostWallet = await prisma.lostItem.create({
    data: {
      userId: userA.id,
      categoryId: categories["Wallets"].id,
      title: "Brown leather wallet",
      description:
        "Brown leather wallet containing college ID and several cards. It has a small scratch on the front.",
      location: "Main Gate",
      lostAt: new Date("2026-08-09T17:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const lostEarbuds = await prisma.lostItem.create({
    data: {
      userId: userA.id,
      categoryId: categories["Electronics"].id,
      title: "White wireless earbuds",
      description: "White wireless earbuds inside a small charging case.",
      location: "Computer Lab",
      lostAt: new Date("2026-07-20T15:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const lostKeys = await prisma.lostItem.create({
    data: {
      userId: userB.id,
      categoryId: categories["Keys"].id,
      title: "House keys with blue keychain",
      description: "Three silver keys attached to a blue plastic keychain.",
      location: "Parking Area",
      lostAt: new Date("2026-08-12T09:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const lostDocuments = await prisma.lostItem.create({
    data: {
      userId: userB.id,
      categoryId: categories["Documents"].id,
      title: "College ID card",
      description:
        "College identification card with a blue border and student photograph.",
      location: "Administration Block",
      lostAt: new Date("2026-08-08T11:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const lostWatch = await prisma.lostItem.create({
    data: {
      userId: userB.id,
      categoryId: categories["Accessories"].id,
      title: "Silver wrist watch",
      description: "Silver metal wrist watch with a round black dial.",
      location: "Sports Ground",
      lostAt: new Date("2026-08-01T16:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const lostLaptop = await prisma.lostItem.create({
    data: {
      userId: userB.id,
      categoryId: categories["Electronics"].id,
      title: "Silver laptop",
      description:
        "Silver laptop with a few stickers on the back and a black sleeve.",
      location: "Engineering Department",
      lostAt: new Date("2026-08-05T12:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  // --------------------------------------------------
  // 5. Create FOUND ITEMS
  // --------------------------------------------------

  const foundPhone = await prisma.foundItem.create({
    data: {
      userId: userB.id,
      categoryId: categories["Electronics"].id,
      title: "Dark Samsung mobile phone",
      description:
        "Dark Samsung mobile with a damaged display and transparent case. Found close to the university library.",
      location: "College Library",
      foundAt: new Date("2026-08-10T15:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const foundBackpack = await prisma.foundItem.create({
    data: {
      userId: userB.id,
      categoryId: categories["Bags"].id,
      title: "Blue backpack found",
      description:
        "Blue college backpack with notebooks, charger and pencil case. There is a white logo on the front.",
      location: "College Canteen",
      foundAt: new Date("2026-08-11T15:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const foundWallet = await prisma.foundItem.create({
    data: {
      userId: userB.id,
      categoryId: categories["Wallets"].id,
      title: "Leather wallet found",
      description:
        "Brown leather wallet with several cards and an identification card. Small scratch visible on the front.",
      location: "Main Gate",
      foundAt: new Date("2026-08-09T19:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const foundEarbuds = await prisma.foundItem.create({
    data: {
      userId: userB.id,
      categoryId: categories["Electronics"].id,
      title: "Wireless earphones",
      description: "White wireless earphones inside a charging case.",
      location: "Computer Lab",
      foundAt: new Date("2026-08-12T10:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const foundKeys = await prisma.foundItem.create({
    data: {
      userId: userA.id,
      categoryId: categories["Keys"].id,
      title: "Blue keychain with keys",
      description: "Three silver keys attached to a blue plastic keychain.",
      location: "Parking Area",
      foundAt: new Date("2026-08-12T12:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const foundID = await prisma.foundItem.create({
    data: {
      userId: userA.id,
      categoryId: categories["Documents"].id,
      title: "Student identification card",
      description: "College ID card with a blue border and student photograph.",
      location: "Administration Block",
      foundAt: new Date("2026-08-08T13:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const foundWatch = await prisma.foundItem.create({
    data: {
      userId: userA.id,
      categoryId: categories["Accessories"].id,
      title: "Black sports watch",
      description: "Round black sports watch with a dark strap.",
      location: "Football Ground",
      foundAt: new Date("2026-08-14T16:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  const foundLaptop = await prisma.foundItem.create({
    data: {
      userId: userA.id,
      categoryId: categories["Electronics"].id,
      title: "Silver laptop computer",
      description:
        "Silver laptop with stickers on the back and a black protective sleeve.",
      location: "Engineering Department",
      foundAt: new Date("2026-08-06T10:00:00"),
      status: ItemStatus.ACTIVE,
    },
  });

  // --------------------------------------------------
  // 6. Create MATCHES
  // --------------------------------------------------

  await prisma.match.createMany({
    data: [
      {
        lostItemId: lostPhone.id,
        foundItemId: foundPhone.id,
        score: 92,
        status: MatchStatus.PENDING,
      },
      {
        lostItemId: lostBackpack.id,
        foundItemId: foundBackpack.id,
        score: 88,
        status: MatchStatus.PENDING,
      },
      {
        lostItemId: lostWallet.id,
        foundItemId: foundWallet.id,
        score: 90,
        status: MatchStatus.ACCEPTED,
      },
      {
        lostItemId: lostKeys.id,
        foundItemId: foundKeys.id,
        score: 86,
        status: MatchStatus.PENDING,
      },
      {
        lostItemId: lostDocuments.id,
        foundItemId: foundID.id,
        score: 91,
        status: MatchStatus.REJECTED,
      },
    ],
  });

  // --------------------------------------------------
  // 7. Create CLAIMS
  // --------------------------------------------------

  await prisma.claim.create({
    data: {
      userId: userA.id,
      foundItemId: foundPhone.id,
      message:
        "This is my Samsung phone. I can provide additional identifying details.",
      status: ClaimStatus.PENDING,
    },
  });

  await prisma.claim.create({
    data: {
      userId: userA.id,
      foundItemId: foundBackpack.id,
      message:
        "The backpack belongs to me. I can identify the contents inside it.",
      status: ClaimStatus.APPROVED,
    },
  });

  await prisma.claim.create({
    data: {
      userId: userB.id,
      foundItemId: foundKeys.id,
      message:
        "These keys look like mine. I can provide additional details about the keychain.",
      status: ClaimStatus.REJECTED,
    },
  });

  // --------------------------------------------------
  // 8. Create NOTIFICATIONS
  // --------------------------------------------------

  await prisma.notification.createMany({
    data: [
      {
        userId: userA.id,
        title: "Possible match found",
        message: "A found item may match your lost Samsung phone.",
        type: NotificationType.MATCH_FOUND,
        read: false,
      },
      {
        userId: userA.id,
        title: "Claim approved",
        message: "Your claim for the blue backpack has been approved.",
        type: NotificationType.CLAIM_UPDATE,
        read: false,
      },
      {
        userId: userB.id,
        title: "New claim received",
        message: "A user has submitted a claim for your found phone.",
        type: NotificationType.CLAIM_UPDATE,
        read: false,
      },
      {
        userId: userB.id,
        title: "Welcome to FindIt",
        message: "Your FindIt account is ready.",
        type: NotificationType.SYSTEM,
        read: true,
      },
    ],
  });

  // --------------------------------------------------
  // 9. Create REPORTS
  // --------------------------------------------------

  await prisma.report.create({
    data: {
      reporterId: userA.id,
      foundItemId: foundWatch.id,
      reason: "The location details of this found item appear suspicious.",
      status: ReportStatus.PENDING,
    },
  });

  await prisma.report.create({
    data: {
      reporterId: userB.id,
      lostItemId: lostLaptop.id,
      reason:
        "This lost item appears to contain information that may identify the owner.",
      status: ReportStatus.REVIEWED,
    },
  });

  // --------------------------------------------------
  // 10. Summary
  // --------------------------------------------------

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    lostItems: await prisma.lostItem.count(),
    foundItems: await prisma.foundItem.count(),
    matches: await prisma.match.count(),
    claims: await prisma.claim.count(),
    notifications: await prisma.notification.count(),
    reports: await prisma.report.count(),
  };

  console.log("\n========================================");
  console.log("TEST DATA CREATED SUCCESSFULLY");
  console.log("========================================");

  console.table(counts);

  console.log("\nImportant AI test pair:");
  console.log(`Lost phone ID : ${lostPhone.id}`);
  console.log(`Found phone ID: ${foundPhone.id}`);

  console.log("\nUser A:");
  console.log(userA.email);

  console.log("\nUser B:");
  console.log(userB.email);

  console.log("\nYou can now test the FindIt routes.");
}

main()
  .catch((error) => {
    console.error("\nTEST DATA RESET FAILED");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
