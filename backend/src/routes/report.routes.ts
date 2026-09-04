import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

import {
  createReportController,
  getMyReportsController,
  getAllReportsController,
  updateReportStatusController,
} from "../controllers/report.controller";

const router = Router();

router.post("/", authenticate, createReportController);

router.get("/my", authenticate, getMyReportsController);

router.get("/", authenticate, requireAdmin, getAllReportsController);

router.patch(
  "/:reportId/status",
  authenticate,
  requireAdmin,
  updateReportStatusController,
);

export default router;
