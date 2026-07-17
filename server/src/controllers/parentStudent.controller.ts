import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { createParentStudentSchema } from "../validators/parentStudent.schema";
import { createParentStudentLink, listParentStudentLinks } from "../services/parentStudent.service";

// ============================================
// POST /api/parent-students - Admin only
// ============================================
export const postParentStudent = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createParentStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    await createParentStudentLink(parsed.data);
    res.status(201).json({ success: true });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("This parent is already linked to this student", 409);
    }
    if (error.code === "23503") {
      throw new AppError("Invalid parent or student", 400);
    }
    throw error;
  }
});

// ============================================
// GET /api/parent-students - Admin only
// ============================================
export const getParentStudents = asyncHandler(async (_req: Request, res: Response) => {
  const links = await listParentStudentLinks();
  res.json({ links });
});
