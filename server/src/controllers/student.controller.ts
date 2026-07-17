import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getStudentClass,
  getSubjectsForClass,
  getStudentAttendance,
  getStudentGrades,
} from "../services/student.service";

// ============================================
// GET /api/student/my-class - Student only
// Returns the student's class + the subjects/teachers taught in it
// ============================================
export const getMyClass = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const classInfo = await getStudentClass(req.user.id);
  if (!classInfo) {
    res.json({ class: null, subjects: [] });
    return;
  }

  const subjects = await getSubjectsForClass(classInfo.classId);
  res.json({ class: classInfo, subjects });
});

// ============================================
// GET /api/student/my-attendance - Student only
// ============================================
export const getMyAttendance = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const attendance = await getStudentAttendance(req.user.id);
  res.json({ attendance });
});

// ============================================
// GET /api/student/my-grades - Student only
// ============================================
export const getMyGrades = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const grades = await getStudentGrades(req.user.id);
  res.json({ grades });
});
