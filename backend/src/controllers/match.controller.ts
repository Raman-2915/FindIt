import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  generateMatchesForLostItem,
  getMatchesForLostItem,
  acceptMatch,
  rejectMatch,
} from "../services/match.service";

export async function generateMatchesController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const lostItemId = req.params.lostItemId as string;

    const matches = await generateMatchesForLostItem(
      lostItemId,
      req.user.userId,
    );

    return res.status(200).json({
      message: "Matches generated successfully",
      matches,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Not authorized") {
      return res.status(403).json({
        message: error.message,
      });
    }

    if (error.message === "Lost item not found") {
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

export async function getMatchesController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const lostItemId = req.params.lostItemId as string;

    const matches = await getMatchesForLostItem(lostItemId, req.user.userId);

    return res.status(200).json({
      matches,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Lost item not found") {
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
export async function acceptMatchController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const matchId = req.params.matchId as string;

    const match = await acceptMatch(req.user.userId, matchId);

    return res.status(200).json({
      message: "Match accepted successfully",
      match,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Match not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Not authorized") {
      return res.status(403).json({
        message: error.message,
      });
    }

    if (
      error.message === "Match is no longer pending" ||
      error.message === "Found item is no longer active"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function rejectMatchController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const matchId = req.params.matchId as string;

    const match = await rejectMatch(req.user.userId, matchId);

    return res.status(200).json({
      message: "Match rejected successfully",
      match,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Match not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Not authorized") {
      return res.status(403).json({
        message: error.message,
      });
    }

    if (error.message === "Match is no longer pending") {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
