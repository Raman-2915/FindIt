import prisma from "../config/prisma";
import { createNotification } from "./notification.service";

interface CreateClaimData {
  userId: string;
  foundItemId: string;
  message: string;
}

export async function createClaim(data: CreateClaimData) {
  const foundItem = await prisma.foundItem.findUnique({
    where: {
      id: data.foundItemId,
    },
  });

  if (!foundItem) {
    throw new Error("Found item not found");
  }

  if (foundItem.status !== "ACTIVE") {
    throw new Error("This found item is no longer available for claims");
  }

  if (foundItem.userId === data.userId) {
    throw new Error("You cannot claim an item you reported as found");
  }

  const existingClaim = await prisma.claim.findUnique({
    where: {
      userId_foundItemId: {
        userId: data.userId,
        foundItemId: data.foundItemId,
      },
    },
  });

  if (existingClaim) {
    throw new Error("You have already submitted a claim for this item");
  }

  const claim = await prisma.claim.create({
    data: {
      userId: data.userId,
      foundItemId: data.foundItemId,
      message: data.message,
    },
    include: {
      foundItem: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  await createNotification({
    userId: foundItem.userId,
    title: "New claim received",
    message: `Someone has submitted a claim for your found item "${foundItem.title}".`,
    type: "CLAIM_UPDATE",
  });

  return claim;
}

export async function getClaimsForFoundItem(
  userId: string,
  foundItemId: string,
) {
  const foundItem = await prisma.foundItem.findUnique({
    where: {
      id: foundItemId,
    },
  });

  if (!foundItem) {
    throw new Error("Found item not found");
  }

  if (foundItem.userId !== userId) {
    throw new Error("Not authorized");
  }

  return prisma.claim.findMany({
    where: {
      foundItemId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function approveClaim(userId: string, claimId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const claim = await tx.claim.findUnique({
      where: {
        id: claimId,
      },
      include: {
        foundItem: true,
      },
    });

    if (!claim) {
      throw new Error("Claim not found");
    }

    if (claim.foundItem.userId !== userId) {
      throw new Error("Not authorized");
    }

    if (claim.status !== "PENDING") {
      throw new Error("Claim is no longer pending");
    }

    if (claim.foundItem.status !== "ACTIVE") {
      throw new Error("Found item is no longer active");
    }

    // Get other pending claims before rejecting them
    const otherPendingClaims = await tx.claim.findMany({
      where: {
        foundItemId: claim.foundItemId,
        id: {
          not: claimId,
        },
        status: "PENDING",
      },
      select: {
        id: true,
        userId: true,
      },
    });

    const approvedClaim = await tx.claim.update({
      where: {
        id: claimId,
      },
      data: {
        status: "APPROVED",
      },
    });

    await tx.foundItem.update({
      where: {
        id: claim.foundItemId,
      },
      data: {
        status: "CLAIMED",
      },
    });

    await tx.claim.updateMany({
      where: {
        foundItemId: claim.foundItemId,
        id: {
          not: claimId,
        },
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
      },
    });

    return {
      approvedClaim,
      otherPendingClaims,
      foundItemTitle: claim.foundItem.title,
    };
  });

  // Notify approved claimant
  await createNotification({
    userId: result.approvedClaim.userId,
    title: "Claim approved",
    message: `Your claim for "${result.foundItemTitle}" has been approved.`,
    type: "CLAIM_UPDATE",
  });

  // Notify automatically rejected claimants
  for (const otherClaim of result.otherPendingClaims) {
    await createNotification({
      userId: otherClaim.userId,
      title: "Claim rejected",
      message: `Your claim for "${result.foundItemTitle}" was rejected because another claim was approved.`,
      type: "CLAIM_UPDATE",
    });
  }

  return result.approvedClaim;
}

export async function rejectClaim(userId: string, claimId: string) {
  const claim = await prisma.claim.findUnique({
    where: {
      id: claimId,
    },
    include: {
      foundItem: true,
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  if (claim.foundItem.userId !== userId) {
    throw new Error("Not authorized");
  }

  if (claim.status !== "PENDING") {
    throw new Error("Claim is no longer pending");
  }

  const rejectedClaim = await prisma.claim.update({
    where: {
      id: claimId,
    },
    data: {
      status: "REJECTED",
    },
  });

  await createNotification({
    userId: claim.userId,
    title: "Claim rejected",
    message: `Your claim for "${claim.foundItem.title}" has been rejected.`,
    type: "CLAIM_UPDATE",
  });

  return rejectedClaim;
}
