import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getNotificationsController, markNotificationAsReadController } from "../controllers/notification.controller";

const router = Router();

router.get("/notifications", authenticate, getNotificationsController);
router.patch(
  "/notifications/:notificationId/read",
  authenticate,
  markNotificationAsReadController,
);

export default router;
