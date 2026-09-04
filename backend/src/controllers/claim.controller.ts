import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createClaim,
  getClaimsForFoundItem,
  approveClaim,
  rejectClaim,
} from "../services/claim.service";

export async function createClaimController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const foundItemId = req.params.foundItemId as string;
    const { message } = req.body;

    if (typeof message !== "string" || message.trim().length < 10) {
      return res.status(400).json({
        message: "Claim message must be at least 10 characters long",
      });
    }

    const claim = await createClaim({
      userId: req.user.userId,
      foundItemId,
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Claim submitted successfully",
      claim,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Found item not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "This found item is no longer available for claims") {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (error.message === "You cannot claim an item you reported as found") {
      return res.status(403).json({
        message: error.message,
      });
    }

    if (error.message === "You have already submitted a claim for this item") {
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

export async function getClaimsForFoundItemController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const foundItemId = req.params.foundItemId as string;

    const claims = await getClaimsForFoundItem(req.user.userId, foundItemId);

    return res.status(200).json({
      claims,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Found item not found") {
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

export async function approveClaimController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const claimId = req.params.claimId as string;

    const claim = await approveClaim(req.user.userId, claimId);

    return res.status(200).json({
      message: "Claim approved successfully",
      claim,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Claim not found") {
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
      error.message === "Claim is no longer pending" ||
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

export async function rejectClaimController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const claimId = req.params.claimId as string;

    const claim = await rejectClaim(req.user.userId, claimId);

    return res.status(200).json({
      message: "Claim rejected successfully",
      claim,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Claim not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Not authorized") {
      return res.status(403).json({
        message: error.message,
      });
    }

    if (error.message === "Claim is no longer pending") {
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
