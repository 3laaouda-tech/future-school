import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { listClassSubjectsByTeacher } from "../services/classSubjects.service";
import {
  verifyTeacherOwnsClass,
  getStudentsInClass,
  saveAttendance,
  getAttendanceForDate,
} from "../services/attendance.service";
import { submitAttendanceSchema } from "../validators/attendance.schema";
import {
  verifyTeacherOwnsClassSubject,
  createGrade,
  listGradesForClassSubject,
} from "../services/grades.service";
import { submitGradeSchema } from "../validators/grades.schema";

// ============================================
// GET /api/teacher/my-classes - Teacher only
// Returns only the classes/subjects assigned to the logged-in teacher
// ============================================
export const getMyClasses = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const classes = await listClassSubjectsByTeacher(req.user.id);
  res.json({ classes });
});

// ============================================
// GET /api/teacher/classes/:classId/students - Teacher only
// ============================================
export const getClassStudents = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId)) throw new AppError("Invalid class id", 400);

  const owns = await verifyTeacherOwnsClass(req.user.id, classId);
  if (!owns) throw new AppError("You don't teach this class", 403);

  const students = await getStudentsInClass(classId);
  res.json({ students });
});

// ============================================
// GET /api/teacher/classes/:classId/attendance?date=YYYY-MM-DD - Teacher only
// ============================================
export const getAttendance = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const classId = Number(req.params.classId);
  const date = req.query.date as string | undefined;
  if (!Number.isInteger(classId)) throw new AppError("Invalid class id", 400);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError('A valid "date" query param is required (YYYY-MM-DD)', 400);
  }

  const owns = await verifyTeacherOwnsClass(req.user.id, classId);
  if (!owns) throw new AppError("You don't teach this class", 403);

  const records = await getAttendanceForDate(classId, date);
  res.json({ records });
});

// ============================================
// POST /api/teacher/classes/:classId/attendance - Teacher only
// ============================================
export const postAttendance = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const classId = Number(req.params.classId);
  if (!Number.isInteger(classId)) throw new AppError("Invalid class id", 400);

  const parsed = submitAttendanceSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const owns = await verifyTeacherOwnsClass(req.user.id, classId);
  if (!owns) throw new AppError("You don't teach this class", 403);

  await saveAttendance(classId, req.user.id, parsed.data.date, parsed.data.records);
  res.status(201).json({ success: true });
});

// ============================================
// GET /api/teacher/classes/:classId/subjects/:subjectId/grades - Teacher only
// ============================================
export const getGrades = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const classId = Number(req.params.classId);
  const subjectId = Number(req.params.subjectId);
  if (!Number.isInteger(classId) || !Number.isInteger(subjectId)) {
    throw new AppError("Invalid class or subject id", 400);
  }

  const owns = await verifyTeacherOwnsClassSubject(req.user.id, classId, subjectId);
  if (!owns) throw new AppError("You don't teach this subject in this class", 403);

  const grades = await listGradesForClassSubject(classId, subjectId);
  res.json({ grades });
});

// ============================================
// POST /api/teacher/classes/:classId/subjects/:subjectId/grades - Teacher only
// ============================================
export const postGrade = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const classId = Number(req.params.classId);
  const subjectId = Number(req.params.subjectId);
  if (!Number.isInteger(classId) || !Number.isInteger(subjectId)) {
    throw new AppError("Invalid class or subject id", 400);
  }

  const parsed = submitGradeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const owns = await verifyTeacherOwnsClassSubject(req.user.id, classId, subjectId);
  if (!owns) throw new AppError("You don't teach this subject in this class", 403);

  const grade = await createGrade(classId, subjectId, req.user.id, parsed.data);
  res.status(201).json({ grade });
});
