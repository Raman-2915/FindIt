import prisma from "../config/prisma";

interface CreateFoundItemData {
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  foundAt: Date;
}

export async function createFoundItem(data: CreateFoundItemData) {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return prisma.foundItem.create({
    data: {
      userId: data.userId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      location: data.location,
      foundAt: data.foundAt,
    },
    include: {
      category: true,
    },
  });
}

interface GetFoundItemsParams {
  page: number;
  limit: number;
  categoryId?: string;
  location?: string;
  status?: string;
}

export async function getFoundItems(params: GetFoundItemsParams) {
  const { page, limit, categoryId, location, status } = params;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  if (status) {
    where.status = status;
  }

  const [items, total] = await Promise.all([
    prisma.foundItem.findMany({
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
        foundAt: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.foundItem.count({
      where,
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFoundItemById(id: string) {
  const item = await prisma.foundItem.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      location: true,
      foundAt: true,
      status: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!item) {
    throw new Error("Found item not found");
  }

  return item;
}

interface GetMyFoundItemsParams {
  userId: string;
  page: number;
  limit: number;
}

export async function getMyFoundItems(params: GetMyFoundItemsParams) {
  const { userId, page, limit } = params;

  const skip = (page - 1) * limit;

  const where = {
    userId,
  };

  const [items, total] = await Promise.all([
    prisma.foundItem.findMany({
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
        foundAt: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.foundItem.count({
      where,
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

interface UpdateFoundItemData {
  userId: string;
  itemId: string;
  categoryId?: string;
  title?: string;
  description?: string;
  location?: string;
  foundAt?: Date;
}

export async function updateFoundItem(data: UpdateFoundItemData) {
  const item = await prisma.foundItem.findUnique({
    where: {
      id: data.itemId,
    },
  });

  if (!item) {
    throw new Error("Found item not found");
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

  return prisma.foundItem.update({
    where: {
      id: data.itemId,
    },
    data: {
      ...(data.categoryId !== undefined && {
        categoryId: data.categoryId,
      }),
      ...(data.title !== undefined && {
        title: data.title,
      }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.location !== undefined && {
        location: data.location,
      }),
      ...(data.foundAt !== undefined && {
        foundAt: data.foundAt,
      }),
    },
    include: {
      category: true,
    },
  });
}
export async function deleteFoundItem(userId: string, itemId: string) {
  const item = await prisma.foundItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!item) {
    throw new Error("Found item not found");
  }

  if (item.userId !== userId) {
    throw new Error("Not authorized");
  }

  return prisma.foundItem.delete({
    where: {
      id: itemId,
    },
  });
}
