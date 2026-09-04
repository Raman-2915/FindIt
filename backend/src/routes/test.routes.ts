import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/protected", authenticate, (req: AuthRequest, res) => {
  return res.status(200).json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

export default router;
