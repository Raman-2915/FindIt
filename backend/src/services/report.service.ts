import prisma from "../config/prisma";

interface CreateReportData {
  reporterId: string;
  lostItemId?: string;
  foundItemId?: string;
  reason: string;
}

export async function createReport(data: CreateReportData) {
  // Exactly one item must be reported
  if (
    (data.lostItemId && data.foundItemId) ||
    (!data.lostItemId && !data.foundItemId)
  ) {
    throw new Error("Exactly one item must be reported");
  }

  if (!data.reason || data.reason.trim().length < 10) {
    throw new Error("Report reason must be at least 10 characters long");
  }

  // Verify lost item exists
  if (data.lostItemId) {
    const lostItem = await prisma.lostItem.findUnique({
      where: {
        id: data.lostItemId,
      },
    });

    if (!lostItem) {
      throw new Error("Lost item not found");
    }

    // Prevent users from reporting their own item
    if (lostItem.userId === data.reporterId) {
      throw new Error("You cannot report your own item");
    }
  }

  // Verify found item exists
  if (data.foundItemId) {
    const foundItem = await prisma.foundItem.findUnique({
      where: {
        id: data.foundItemId,
      },
    });

    if (!foundItem) {
      throw new Error("Found item not found");
    }

    // Prevent users from reporting their own item
    if (foundItem.userId === data.reporterId) {
      throw new Error("You cannot report your own item");
    }
  }

  return prisma.report.create({
    data: {
      reporterId: data.reporterId,
      lostItemId: data.lostItemId,
      foundItemId: data.foundItemId,
      reason: data.reason.trim(),
    },
  });
}

export async function getMyReports(reporterId: string) {
  return prisma.report.findMany({
    where: {
      reporterId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      lostItem: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      foundItem: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });
}

export async function getAllReports() {
  return prisma.report.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      lostItem: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      foundItem: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });
}

export async function updateReportStatus(
  reportId: string,
  status: "PENDING" | "REVIEWED" | "DISMISSED" | "ACTION_TAKEN",
) {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId,
    },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  return prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      status,
    },
  });
}
