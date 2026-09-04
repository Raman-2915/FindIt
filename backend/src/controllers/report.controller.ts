import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
} from "../services/report.service";

export async function createReportController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { lostItemId, foundItemId, reason } = req.body;

    if ((lostItemId && foundItemId) || (!lostItemId && !foundItemId)) {
      return res.status(400).json({
        message: "Provide either lostItemId or foundItemId, not both",
      });
    }

    if (typeof reason !== "string" || reason.trim().length < 10) {
      return res.status(400).json({
        message: "Report reason must be at least 10 characters long",
      });
    }

    const report = await createReport({
      reporterId: req.user.userId,
      lostItemId,
      foundItemId,
      reason: reason.trim(),
    });

    return res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (
      error.message === "Exactly one item must be reported" ||
      error.message === "Report reason must be at least 10 characters long"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error.message === "Lost item not found" ||
      error.message === "Found item not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "You cannot report your own item") {
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

export async function getMyReportsController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const reports = await getMyReports(req.user.userId);

    return res.status(200).json({
      reports,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getAllReportsController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const reports = await getAllReports();

    return res.status(200).json({
      reports,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateReportStatusController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const reportId = req.params.reportId as string;
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "REVIEWED",
      "DISMISSED",
      "ACTION_TAKEN",
    ];

    if (typeof status !== "string" || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid report status",
      });
    }

    const report = await updateReportStatus(
      reportId,
      status as "PENDING" | "REVIEWED" | "DISMISSED" | "ACTION_TAKEN",
    );

    return res.status(200).json({
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Report not found") {
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
