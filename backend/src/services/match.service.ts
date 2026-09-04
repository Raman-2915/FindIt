import prisma from "../config/prisma";
import {
  generateEmbedding,
  calculateCosineSimilarity,
} from "./embedding.service";
import { createNotification } from "./notification.service";

function calculateDateScore(lostAt: Date, foundAt: Date): number {
  const differenceInMs = Math.abs(lostAt.getTime() - foundAt.getTime());

  const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

  if (differenceInDays <= 1) {
    return 20;
  }

  if (differenceInDays <= 3) {
    return 15;
  }

  if (differenceInDays <= 7) {
    return 10;
  }

  if (differenceInDays <= 30) {
    return 5;
  }

  return 0;
}

function calculateCategoryScore(
  lostCategoryId: string,
  foundCategoryId: string,
): number {
  return lostCategoryId === foundCategoryId ? 30 : 0;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function calculateLocationScore(
  lostLocation: string,
  foundLocation: string,
): number {
  const lost = normalizeText(lostLocation);
  const found = normalizeText(foundLocation);

  if (lost === found) {
    return 25;
  }

  if (lost.includes(found) || found.includes(lost)) {
    return 20;
  }

  const lostWords = new Set(lost.split(" "));
  const foundWords = new Set(found.split(" "));

  const commonWords = [...lostWords].filter((word) => foundWords.has(word));

  if (commonWords.length > 0) {
    return 10;
  }

  return 0;
}

async function calculateSemanticScore(
  lostTitle: string,
  lostDescription: string,
  foundTitle: string,
  foundDescription: string,
): Promise<number> {
  const lostText = `${lostTitle}. ${lostDescription}`;
  const foundText = `${foundTitle}. ${foundDescription}`;

  const [lostEmbedding, foundEmbedding] = await Promise.all([
    generateEmbedding(lostText),
    generateEmbedding(foundText),
  ]);

  const similarity = calculateCosineSimilarity(lostEmbedding, foundEmbedding);

  // Convert cosine similarity into a 0-25 score.
  const normalizedSimilarity = Math.max(0, Math.min(1, similarity));

  return normalizedSimilarity * 25;
}

async function calculateMatchScore(
  lostItem: {
    categoryId: string;
    title: string;
    description: string;
    location: string;
    lostAt: Date;
  },
  foundItem: {
    categoryId: string;
    title: string;
    description: string;
    location: string;
    foundAt: Date;
  },
): Promise<number> {
  const categoryScore = calculateCategoryScore(
    lostItem.categoryId,
    foundItem.categoryId,
  );

  const locationScore = calculateLocationScore(
    lostItem.location,
    foundItem.location,
  );

  const dateScore = calculateDateScore(lostItem.lostAt, foundItem.foundAt);

  const semanticScore = await calculateSemanticScore(
    lostItem.title,
    lostItem.description,
    foundItem.title,
    foundItem.description,
  );

  return categoryScore + locationScore + dateScore + semanticScore;
}

export async function findMatchesForLostItem(
  lostItemId: string,
  userId: string,
) {
  const lostItem = await prisma.lostItem.findUnique({
    where: {
      id: lostItemId,
    },
  });
  if (!lostItem) {
    throw new Error("Lost item not found");
  }
  if (lostItem.userId !== userId) {
    throw new Error("Not authorized");
  }

  const foundItems = await prisma.foundItem.findMany({
    where: {
      status: "ACTIVE",
      categoryId: lostItem.categoryId,
    },
  });

  const matches = [];

  for (const foundItem of foundItems) {
    const score = await calculateMatchScore(lostItem, foundItem);

    if (score >= 40) {
      matches.push({
        foundItemId: foundItem.id,
        score,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  return matches;
}

export async function generateMatchesForLostItem(
  lostItemId: string,
  userId: string,
) {
  const matches = await findMatchesForLostItem(lostItemId, userId);

  for (const match of matches) {
    const existingMatch = await prisma.match.findUnique({
      where: {
        lostItemId_foundItemId: {
          lostItemId,
          foundItemId: match.foundItemId,
        },
      },
    });

    if (existingMatch) {
      // Update the score but don't create another notification.
      await prisma.match.update({
        where: {
          id: existingMatch.id,
        },
        data: {
          score: match.score,
        },
      });

      continue;
    }

    // Create the new match.
    await prisma.match.create({
      data: {
        lostItemId,
        foundItemId: match.foundItemId,
        score: match.score,
      },
    });

    // Get the found item's title for the notification.
    const foundItem = await prisma.foundItem.findUnique({
      where: {
        id: match.foundItemId,
      },
      select: {
        title: true,
      },
    });

    if (foundItem) {
      await createNotification({
        userId,
        title: "Potential match found",
        message: `A potential match was found for your lost item. Found item: "${foundItem.title}".`,
        type: "MATCH_FOUND",
      });
    }
  }

  return matches;
}

export async function getMatchesForLostItem(
  lostItemId: string,
  userId: string,
) {
  const lostItem = await prisma.lostItem.findUnique({
    where: {
      id: lostItemId,
    },
  });

  if (!lostItem) {
    throw new Error("Lost item not found");
  }

  if (lostItem.userId !== userId) {
    throw new Error("Not authorized");
  }

  return prisma.match.findMany({
    where: {
      lostItemId,
    },
    include: {
      foundItem: {
        select: {
          id: true,
          title: true,
          location: true,
          foundAt: true,
          status: true,
          categoryId: true,
        },
      },
    },
    orderBy: {
      score: "desc",
    },
  });
}

export async function acceptMatch(userId: string, matchId: string) {
  const match = await prisma.match.findUnique({
    where: {
      id: matchId,
    },
    include: {
      lostItem: true,
      foundItem: true,
    },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  // Only the owner of the lost item can accept the match.
  if (match.lostItem.userId !== userId) {
    throw new Error("Not authorized");
  }

  if (match.status !== "PENDING") {
    throw new Error("Match is no longer pending");
  }

  if (match.foundItem.status !== "ACTIVE") {
    throw new Error("Found item is no longer active");
  }

  const acceptedMatch = await prisma.match.update({
    where: {
      id: matchId,
    },
    data: {
      status: "ACCEPTED",
    },
  });

  return acceptedMatch;
}

export async function rejectMatch(userId: string, matchId: string) {
  const match = await prisma.match.findUnique({
    where: {
      id: matchId,
    },
    include: {
      lostItem: true,
      foundItem: true,
    },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  // Only the owner of the lost item can reject the match.
  if (match.lostItem.userId !== userId) {
    throw new Error("Not authorized");
  }

  if (match.status !== "PENDING") {
    throw new Error("Match is no longer pending");
  }

  const rejectedMatch = await prisma.match.update({
    where: {
      id: matchId,
    },
    data: {
      status: "REJECTED",
    },
  });

  return rejectedMatch;
}
