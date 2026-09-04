import { Request, Response } from "express";
import {
  generateEmbedding,
  calculateCosineSimilarity,
} from "../services/embedding.service";

export async function testEmbeddingController(req: Request, res: Response) {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        message: "Text is required",
      });
    }

    const embedding = await generateEmbedding(text);

    return res.status(200).json({
      message: "Embedding generated successfully",
      dimensions: embedding.length,
      embedding,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to generate embedding",
    });
  }
}

export async function testSimilarityController(req: Request, res: Response) {
  try {
    const { textA, textB } = req.body;

    if (
      typeof textA !== "string" ||
      typeof textB !== "string" ||
      !textA.trim() ||
      !textB.trim()
    ) {
      return res.status(400).json({
        message: "textA and textB are required",
      });
    }

    const [embeddingA, embeddingB] = await Promise.all([
      generateEmbedding(textA),
      generateEmbedding(textB),
    ]);

    const similarity = calculateCosineSimilarity(embeddingA, embeddingB);

    return res.status(200).json({
      message: "Similarity calculated successfully",
      similarity,
      percentage: similarity * 100,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to calculate similarity",
    });
  }
}
