import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getUserNotifications, markNotificationAsRead, } from "../services/notification.service";

export async function getNotificationsController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const notifications = await getUserNotifications(req.user.userId);

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function markNotificationAsReadController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const notificationId = req.params.notificationId as string;

    const notification = await markNotificationAsRead(
      req.user.userId,
      notificationId,
    );

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Notification not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Not authorized") {
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