import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createClaimController,
  getClaimsForFoundItemController,
  approveClaimController,
  rejectClaimController,
} from "../controllers/claim.controller";

const router = Router();

router.post(
  "/found-items/:foundItemId/claims",
  authenticate,
  createClaimController,
);
router.get(
  "/found-items/:foundItemId/claims",
  authenticate,
  getClaimsForFoundItemController,
);
router.patch("/claims/:claimId/approve", authenticate, approveClaimController);

router.patch("/claims/:claimId/reject", authenticate, rejectClaimController);

export default router;
