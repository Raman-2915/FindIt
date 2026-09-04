import { Router } from "express";
import {
  testEmbeddingController,
  testSimilarityController,
} from "../controllers/ai-test.controller";

const router = Router();

router.post("/embedding", testEmbeddingController);
router.post("/similarity", testSimilarityController);

export default router;
