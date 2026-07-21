import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { createTimetableEntrySchema } from "../validators/timetable.schema";
import {
  createTimetableEntry,
  deleteTimetableEntry,
  getTimetableForClass,
  findTimetableConflict,
} from "../services/timetable.service";

// ============================================
// GET /api/timetable?classId=X - Admin only
// ============================================
export const getClassTimetable = asyncHandler(async (req: Request, res: Response) => {
  const classId = Number(req.query.classId);
  if (!Number.isInteger(classId)) {
    throw new AppError('A valid "classId" query param is required', 400);
  }

  const entries = await getTimetableForClass(classId);
  res.json({ entries });
});

// ============================================
// POST /api/timetable - Admin only
// ============================================
export const postTimetableEntry = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createTimetableEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const { classSubjectId, dayOfWeek, period } = parsed.data;

  const conflict = await findTimetableConflict(classSubjectId, dayOfWeek, period);
  if (conflict) {
    throw new AppError(
      conflict.type === "class"
        ? "This class already has a subject scheduled at that time"
        : "This teacher is already teaching another class at that time",
      409
    );
  }

  try {
    const entry = await createTimetableEntry(parsed.data);
    res.status(201).json({ entry });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("This slot is already scheduled", 409);
    }
    if (error.code === "23503") {
      throw new AppError("Invalid class/subject assignment", 400);
    }
    throw error;
  }
});

// ============================================
// DELETE /api/timetable/:id - Admin only
// ============================================
export const deleteTimetableEntryHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid entry id", 400);

  const deleted = await deleteTimetableEntry(id);
  if (!deleted) throw new AppError("Entry not found", 404);
  res.json({ success: true });
});
