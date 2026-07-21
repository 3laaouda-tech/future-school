import { pool } from "../config/db";
import { CreateTimetableEntryInput } from "../validators/timetable.schema";

interface ClassSubjectInfo {
  class_id: number;
  teacher_id: number;
}

async function getClassSubjectInfo(classSubjectId: number): Promise<ClassSubjectInfo | null> {
  const result = await pool.query<ClassSubjectInfo>(
    `SELECT class_id, teacher_id FROM class_subjects WHERE id = $1`,
    [classSubjectId]
  );
  return result.rows[0] ?? null;
}

export interface TimetableConflict {
  type: "class" | "teacher";
}

// Checks whether placing this class_subject at this day/period would
// double-book the class (already has another subject then) or the
// teacher (already teaching another class then).
export async function findTimetableConflict(
  classSubjectId: number,
  dayOfWeek: string,
  period: number
): Promise<TimetableConflict | null> {
  const info = await getClassSubjectInfo(classSubjectId);
  if (!info) return null;

  const result = await pool.query<{ class_id: number; teacher_id: number }>(
    `SELECT cs.class_id, cs.teacher_id
     FROM timetable_entries te
     JOIN class_subjects cs ON cs.id = te.class_subject_id
     WHERE te.day_of_week = $1 AND te.period = $2
       AND (cs.class_id = $3 OR cs.teacher_id = $4)`,
    [dayOfWeek, period, info.class_id, info.teacher_id]
  );

  if (result.rows.length === 0) return null;
  const conflict = result.rows[0];
  return conflict.class_id === info.class_id ? { type: "class" } : { type: "teacher" };
}

export interface TimetableEntryRecord {
  id: number;
  class_subject_id: number;
  day_of_week: string;
  period: number;
}

export async function createTimetableEntry(
  input: CreateTimetableEntryInput
): Promise<TimetableEntryRecord> {
  const result = await pool.query<TimetableEntryRecord>(
    `INSERT INTO timetable_entries (class_subject_id, day_of_week, period)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.classSubjectId, input.dayOfWeek, input.period]
  );
  return result.rows[0];
}

export async function deleteTimetableEntry(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM timetable_entries WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

export interface TimetableEntryView {
  id: number;
  classSubjectId: number;
  dayOfWeek: string;
  period: number;
  className: string;
  subjectName: string;
  teacherName: string;
}

export async function getTimetableForClass(classId: number): Promise<TimetableEntryView[]> {
  const result = await pool.query<TimetableEntryView>(
    `SELECT
       te.id,
       te.class_subject_id AS "classSubjectId",
       te.day_of_week AS "dayOfWeek",
       te.period,
       c.name AS "className",
       s.name AS "subjectName",
       u.full_name AS "teacherName"
     FROM timetable_entries te
     JOIN class_subjects cs ON cs.id = te.class_subject_id
     JOIN classes c ON c.id = cs.class_id
     JOIN subjects s ON s.id = cs.subject_id
     JOIN users u ON u.id = cs.teacher_id
     WHERE cs.class_id = $1
     ORDER BY te.day_of_week, te.period`,
    [classId]
  );
  return result.rows;
}

export async function getTimetableForTeacher(teacherId: number): Promise<TimetableEntryView[]> {
  const result = await pool.query<TimetableEntryView>(
    `SELECT
       te.id,
       te.class_subject_id AS "classSubjectId",
       te.day_of_week AS "dayOfWeek",
       te.period,
       c.name AS "className",
       s.name AS "subjectName",
       u.full_name AS "teacherName"
     FROM timetable_entries te
     JOIN class_subjects cs ON cs.id = te.class_subject_id
     JOIN classes c ON c.id = cs.class_id
     JOIN subjects s ON s.id = cs.subject_id
     JOIN users u ON u.id = cs.teacher_id
     WHERE cs.teacher_id = $1
     ORDER BY te.day_of_week, te.period`,
    [teacherId]
  );
  return result.rows;
}
