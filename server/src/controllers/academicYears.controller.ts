import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { createAcademicYearSchema } from "../validators/academicYears.schema";
import {
  createAcademicYear,
  listAcademicYears,
  setCurrentAcademicYear,
  deleteAcademicYear,
} from "../services/academicYears.service";

function toPublic(y: { id: number; label: string; is_current: boolean }) {
  return { id: y.id, label: y.label, isCurrent: y.is_current };
}

// ============================================
// POST /api/academic-years - Admin only
// ============================================
export const postAcademicYear = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createAcademicYearSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const year = await createAcademicYear(parsed.data);
    res.status(201).json({ academicYear: toPublic(year) });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("This academic year already exists", 409);
    }
    throw error;
  }
});

// ============================================
// GET /api/academic-years - Admin only (for now)
// ============================================
export const getAcademicYears = asyncHandler(async (_req: Request, res: Response) => {
  const years = await listAcademicYears();
  res.json({ academicYears: years.map(toPublic) });
});

// ============================================
// PUT /api/academic-years/:id/set-current - Admin only
// ============================================
export const putSetCurrent = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid academic year id", 400);

  const year = await setCurrentAcademicYear(id);
  if (!year) throw new AppError("Academic year not found", 404);
  res.json({ academicYear: toPublic(year) });
});

// ============================================
// DELETE /api/academic-years/:id - Admin only
// ============================================
export const deleteAcademicYearHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid academic year id", 400);

  try {
    const deleted = await deleteAcademicYear(id);
    if (!deleted) throw new AppError("Academic year not found", 404);
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === "23503") {
      throw new AppError("This academic year is still used by existing classes or enrollments", 409);
    }
    throw error;
  }
});
