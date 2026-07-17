import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { createEnrollmentSchema } from "../validators/enrollments.schema";
import { createEnrollment, listEnrollments } from "../services/enrollments.service";

// ============================================
// POST /api/enrollments - Admin only
// ============================================
export const postEnrollment = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createEnrollmentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const enrollment = await createEnrollment(parsed.data);
    res.status(201).json({ enrollment });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("This student is already enrolled for this academic year", 409);
    }
    if (error.code === "23503") {
      throw new AppError("Invalid student, class, or academic year", 400);
    }
    throw error;
  }
});

// ============================================
// GET /api/enrollments - Admin only
// ============================================
export const getEnrollments = asyncHandler(async (_req: Request, res: Response) => {
  const enrollments = await listEnrollments();
  res.json({ enrollments });
});
