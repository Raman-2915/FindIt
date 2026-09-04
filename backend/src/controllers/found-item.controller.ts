import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  getMyFoundItems,
  updateFoundItem,
  deleteFoundItem,
} from "../services/found-item.service";

export async function createFoundItemController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { categoryId, title, description, location, foundAt } = req.body;

    if (!categoryId || !title || !description || !location || !foundAt) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const parsedFoundAt = new Date(foundAt);

    if (Number.isNaN(parsedFoundAt.getTime())) {
      return res.status(400).json({
        message: "Invalid foundAt date",
      });
    }

    const item = await createFoundItem({
      userId: req.user.userId,
      categoryId,
      title,
      description,
      location,
      foundAt: parsedFoundAt,
    });

    return res.status(201).json({
      message: "Found item reported successfully",
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

export async function getFoundItemsController(req: Request, res: Response) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const categoryId =
      typeof req.query.categoryId === "string"
        ? req.query.categoryId
        : undefined;

    const location =
      typeof req.query.location === "string" ? req.query.location : undefined;

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const result = await getFoundItems({
      page,
      limit,
      categoryId,
      location,
      status,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getFoundItemByIdController(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const item = await getFoundItemById(id);

    return res.status(200).json({
      item,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Found item not found") {
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

export async function getMyFoundItemsController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const result = await getMyFoundItems({
      userId: req.user.userId,
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function updateFoundItemController(
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

    const { categoryId, title, description, location, foundAt } = req.body;

    if (
      categoryId === undefined &&
      title === undefined &&
      description === undefined &&
      location === undefined &&
      foundAt === undefined
    ) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    let parsedFoundAt: Date | undefined;

    if (foundAt !== undefined) {
      parsedFoundAt = new Date(foundAt);

      if (Number.isNaN(parsedFoundAt.getTime())) {
        return res.status(400).json({
          message: "Invalid foundAt date",
        });
      }
    }

    const item = await updateFoundItem({
      userId: req.user.userId,
      itemId: id,
      categoryId,
      title,
      description,
      location,
      foundAt: parsedFoundAt,
    });

    return res.status(200).json({
      message: "Found item updated successfully",
      item,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Found item not found") {
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
export async function deleteFoundItemController(
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

    await deleteFoundItem(req.user.userId, id);

    return res.status(200).json({
      message: "Found item deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Found item not found") {
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
