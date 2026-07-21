import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getAdminStats } from "../services/adminStats.service";

// ============================================
// GET /api/admin-stats - Admin only
// ============================================
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getAdminStats();
  res.json({ stats });
});
