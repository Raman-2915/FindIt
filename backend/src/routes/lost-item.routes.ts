import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createLostItemController,
  getLostItemsController,
  getLostItemByIdController,
  updateLostItemController,
  deleteLostItemController,
  getMyLostItemsController,
} from "../controllers/lost-item.controller";

const router = Router();

router.post("/", authenticate, createLostItemController);
router.get("/", getLostItemsController);
router.get("/my", authenticate, getMyLostItemsController);
router.get("/:id", getLostItemByIdController);
router.put("/:id", authenticate, updateLostItemController);
router.delete("/:id", authenticate, deleteLostItemController);

export default router;
