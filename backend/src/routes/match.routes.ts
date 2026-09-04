import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  generateMatchesController,
  getMatchesController,
  acceptMatchController,
  rejectMatchController,
} from "../controllers/match.controller";

const router = Router();

router.post(
  "/lost-items/:lostItemId/matches/generate",
  authenticate,
  generateMatchesController,
);
router.get(
  "/lost-items/:lostItemId/matches",
  authenticate,
  getMatchesController,
);
router.patch("/matches/:matchId/accept", authenticate, acceptMatchController);

router.patch("/matches/:matchId/reject", authenticate, rejectMatchController);
export default router;
