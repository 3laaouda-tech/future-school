import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { createSubjectSchema, updateSubjectSchema } from "../validators/subjects.schema";
import { createSubject, listSubjects, updateSubject, deleteSubject } from "../services/subjects.service";

// ============================================
// POST /api/subjects - Admin only
// ============================================
export const postSubject = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const subject = await createSubject(parsed.data);
    res.status(201).json({ subject });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("A subject with this name already exists", 409);
    }
    throw error;
  }
});

// ============================================
// GET /api/subjects - Admin only (for now)
// ============================================
export const getSubjects = asyncHandler(async (_req: Request, res: Response) => {
  const subjects = await listSubjects();
  res.json({ subjects });
});

// ============================================
// PUT /api/subjects/:id - Admin only
// ============================================
export const putSubject = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid subject id", 400);

  const parsed = updateSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const subject = await updateSubject(id, parsed.data);
    if (!subject) throw new AppError("Subject not found", 404);
    res.json({ subject });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("A subject with this name already exists", 409);
    }
    throw error;
  }
});

// ============================================
// DELETE /api/subjects/:id - Admin only
// ============================================
export const deleteSubjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid subject id", 400);

  const deleted = await deleteSubject(id);
  if (!deleted) throw new AppError("Subject not found", 404);
  res.json({ success: true });
});
