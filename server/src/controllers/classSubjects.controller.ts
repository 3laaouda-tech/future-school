import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { createClassSubjectSchema } from "../validators/classSubjects.schema";
import { createClassSubject, listClassSubjects } from "../services/classSubjects.service";

// ============================================
// POST /api/class-subjects - Admin only
// ============================================
export const postClassSubject = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createClassSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const classSubject = await createClassSubject(parsed.data);
    res.status(201).json({ classSubject });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("This subject is already assigned to this class", 409);
    }
    if (error.code === "23503") {
      // foreign key violation - usually means teacherId doesn't belong to a teacher
      throw new AppError("Invalid class, subject, or teacher", 400);
    }
    throw error;
  }
});

// ============================================
// GET /api/class-subjects - Admin only (for now)
// ============================================
export const getClassSubjects = asyncHandler(async (_req: Request, res: Response) => {
  const classSubjects = await listClassSubjects();
  res.json({ classSubjects });
});
