import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createFoundItemController,
  getFoundItemsController,
  getFoundItemByIdController,
  getMyFoundItemsController,
  updateFoundItemController,
  deleteFoundItemController,
} from "../controllers/found-item.controller";

const router = Router();

router.post("/", authenticate, createFoundItemController);
router.get("/", getFoundItemsController);
router.get("/my", authenticate, getMyFoundItemsController);
router.get("/:id", getFoundItemByIdController);
router.put("/:id", authenticate, updateFoundItemController);
router.delete("/:id", authenticate, deleteFoundItemController);

export default router;
