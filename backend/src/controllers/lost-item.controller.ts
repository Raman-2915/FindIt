import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createLostItem,
  getLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem,
  getMyLostItems,
} from "../services/lost-item.service";
export async function createLostItemController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { categoryId, title, description, location, lostAt } = req.body;

    if (!categoryId || !title || !description || !location || !lostAt) {
      return res.status(400).json({
        message:
          "Category, title, description, location and lostAt are required",
      });
    }

    const parsedLostAt = new Date(lostAt);

    if (Number.isNaN(parsedLostAt.getTime())) {
      return res.status(400).json({
        message: "Invalid lostAt date",
      });
    }

    const item = await createLostItem({
      userId: req.user.userId,
      categoryId,
      title,
      description,
      location,
      lostAt: parsedLostAt,
    });

    return res.status(201).json({
      message: "Lost item reported successfully",
      item,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function getLostItemsController(req: Request, res: Response) {
  try {
    const categoryId =
      typeof req.query.categoryId === "string"
        ? req.query.categoryId
        : undefined;

    const location =
      typeof req.query.location === "string" ? req.query.location : undefined;

    const pageValue =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limitValue =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;

    if (!Number.isInteger(pageValue) || pageValue < 1) {
      return res.status(400).json({
        message: "Page must be a positive integer",
      });
    }

    if (!Number.isInteger(limitValue) || limitValue < 1 || limitValue > 50) {
      return res.status(400).json({
        message: "Limit must be between 1 and 50",
      });
    }

    const result = await getLostItems({
      categoryId,
      location,
      page: pageValue,
      limit: limitValue,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function getLostItemByIdController(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const item = await getLostItemById(id);

    if (!item) {
      return res.status(404).json({
        message: "Lost item not found",
      });
    }

    return res.status(200).json({
      item,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function updateLostItemController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const id = req.params.id as string;

    const { categoryId, title, description, location, lostAt } = req.body;

    if (
      categoryId === undefined &&
      title === undefined &&
      description === undefined &&
      location === undefined &&
      lostAt === undefined
    ) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    let parsedLostAt: Date | undefined;

    if (lostAt !== undefined) {
      parsedLostAt = new Date(lostAt);

      if (Number.isNaN(parsedLostAt.getTime())) {
        return res.status(400).json({
          message: "Invalid lostAt date",
        });
      }
    }

    const item = await updateLostItem({
      userId: req.user.userId,
      itemId: id,
      categoryId,
      title,
      description,
      location,
      lostAt: parsedLostAt,
    });

    return res.status(200).json({
      message: "Lost item updated successfully",
      item,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Lost item not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Not authorized") {
      return res.status(403).json({
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Category not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function deleteLostItemController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const id = req.params.id as string;

    await deleteLostItem(req.user.userId, id);

    return res.status(200).json({
      message: "Lost item deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Lost item not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Not authorized") {
      return res.status(403).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function getMyLostItemsController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const items = await getMyLostItems(req.user.userId);

    return res.status(200).json({
      items,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
