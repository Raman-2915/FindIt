import { Request, Response } from "express";
import { sendSuccess } from "../utils/api-response";
export const healthCheck = (_req: Request, res: Response) => {
  return sendSuccess(res, "FindIt API is running");
};
