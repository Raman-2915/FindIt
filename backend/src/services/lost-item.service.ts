import prisma from "../config/prisma";

interface CreateLostItemData {
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  lostAt: Date;
}

export async function createLostItem(data: CreateLostItemData) {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return prisma.lostItem.create({
    data: {
      userId: data.userId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      location: data.location,
      lostAt: data.lostAt,
    },
    include: {
      category: true,
    },
  });
}

interface GetLostItemsParams {
  categoryId?: string;
  location?: string;
  page: number;
  limit: number;
}

export async function getLostItems(params: GetLostItemsParams) {
  const { categoryId, location, page, limit } = params;

  const skip = (page - 1) * limit;

  const where = {
    status: "ACTIVE" as const,

    ...(categoryId && {
      categoryId,
    }),

    ...(location && {
      location: {
        contains: location,
        mode: "insensitive" as const,
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.lostItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        location: true,
        lostAt: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.lostItem.count({
      where,
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLostItemById(id: string) {
  return prisma.lostItem.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      location: true,
      lostAt: true,
      status: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

interface UpdateLostItemData {
  userId: string;
  itemId: string;
  categoryId?: string;
  title?: string;
  description?: string;
  location?: string;
  lostAt?: Date;
}
export async function updateLostItem(data: UpdateLostItemData) {
  const item = await prisma.lostItem.findUnique({
    where: {
      id: data.itemId,
    },
  });

  if (!item) {
    throw new Error("Lost item not found");
  }

  if (item.userId !== data.userId) {
    throw new Error("Not authorized");
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  return prisma.lostItem.update({
    where: {
      id: data.itemId,
    },
    data: {
      ...(data.categoryId && {
        categoryId: data.categoryId,
      }),
      ...(data.title && {
        title: data.title,
      }),
      ...(data.description && {
        description: data.description,
      }),
      ...(data.location && {
        location: data.location,
      }),
      ...(data.lostAt && {
        lostAt: data.lostAt,
      }),
    },
    include: {
      category: true,
    },
  });
}

export async function deleteLostItem(userId: string, itemId: string) {
  const item = await prisma.lostItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!item) {
    throw new Error("Lost item not found");
  }

  if (item.userId !== userId) {
    throw new Error("Not authorized");
  }

  return prisma.lostItem.delete({
    where: {
      id: itemId,
    },
  });
}

export async function getMyLostItems(userId: string) {
  return prisma.lostItem.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });
}
