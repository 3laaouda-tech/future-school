import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { getMyChildren, verifyParentOfStudent } from "../services/parent.service";
import {
  getStudentClass,
  getSubjectsForClass,
  getStudentAttendance,
  getStudentGrades,
} from "../services/student.service";
import { getTimetableForClass } from "../services/timetable.service";

// ============================================
// GET /api/parent/my-children - Parent only
// ============================================
export const getChildren = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const children = await getMyChildren(req.user.id);
  res.json({ children });
});

// ============================================
// GET /api/parent/children/:studentId/details - Parent only
// Returns everything about one child in a single response: their
// class, subjects, attendance, and grades - re-using the same
// student.service functions the student's own dashboard uses.
// ============================================
export const getChildDetails = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const studentId = Number(req.params.studentId);
  if (!Number.isInteger(studentId)) throw new AppError("Invalid student id", 400);

  const isMyChild = await verifyParentOfStudent(req.user.id, studentId);
  if (!isMyChild) throw new AppError("This student is not linked to your account", 403);

  const classInfo = await getStudentClass(studentId);
  const subjects = classInfo ? await getSubjectsForClass(classInfo.classId) : [];
  const timetable = classInfo ? await getTimetableForClass(classInfo.classId) : [];
  const attendance = await getStudentAttendance(studentId);
  const grades = await getStudentGrades(studentId);

  res.json({ class: classInfo, subjects, timetable, attendance, grades });
});
