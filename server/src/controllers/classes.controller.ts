import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { createClassSchema, updateClassSchema } from "../validators/classes.schema";
import { createClass, listClasses, updateClass, deleteClass, ClassRecord } from "../services/classes.service";

function toPublicClass(cls: ClassRecord) {
  return {
    id: cls.id,
    name: cls.name,
    gradeLevel: cls.grade_level,
    academicYear: cls.academic_year,
  };
}

// ============================================
// POST /api/classes - Admin only
// ============================================
export const postClass = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const cls = await createClass(parsed.data);
    res.status(201).json({ class: toPublicClass(cls) });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("A class with this name already exists for this academic year", 409);
    }
    throw error;
  }
});

// ============================================
// GET /api/classes - Admin only (for now)
// ============================================
export const getClasses = asyncHandler(async (_req: Request, res: Response) => {
  const classes = await listClasses();
  res.json({ classes: classes.map(toPublicClass) });
});

// ============================================
// PUT /api/classes/:id - Admin only
// ============================================
export const putClass = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid class id", 400);

  const parsed = updateClassSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const cls = await updateClass(id, parsed.data);
    if (!cls) throw new AppError("Class not found", 404);
    res.json({ class: toPublicClass(cls) });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("A class with this name already exists for this academic year", 409);
    }
    throw error;
  }
});

// ============================================
// DELETE /api/classes/:id - Admin only
// ============================================
export const deleteClassHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid class id", 400);

  const deleted = await deleteClass(id);
  if (!deleted) throw new AppError("Class not found", 404);
  res.json({ success: true });
});
