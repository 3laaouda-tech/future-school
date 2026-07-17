import { pool } from "../config/db";

export interface StudentClassInfo {
  classId: number;
  className: string;
  academicYear: string;
}

// A student is enrolled in one class per academic year - we return
// their most recent enrollment.
export async function getStudentClass(studentId: number): Promise<StudentClassInfo | null> {
  const result = await pool.query<StudentClassInfo>(
    `SELECT
       c.id AS "classId",
       c.name AS "className",
       e.academic_year AS "academicYear"
     FROM enrollments e
     JOIN classes c ON c.id = e.class_id
     WHERE e.student_id = $1
     ORDER BY e.academic_year DESC
     LIMIT 1`,
    [studentId]
  );
  return result.rows[0] ?? null;
}

export interface StudentSubjectView {
  subjectId: number;
  subjectName: string;
  teacherName: string;
}

export async function getSubjectsForClass(classId: number): Promise<StudentSubjectView[]> {
  const result = await pool.query<StudentSubjectView>(
    `SELECT
       s.id AS "subjectId",
       s.name AS "subjectName",
       u.full_name AS "teacherName"
     FROM class_subjects cs
     JOIN subjects s ON s.id = cs.subject_id
     JOIN users u ON u.id = cs.teacher_id
     WHERE cs.class_id = $1
     ORDER BY s.name`,
    [classId]
  );
  return result.rows;
}

export interface StudentAttendanceEntry {
  date: string;
  status: string;
}

export async function getStudentAttendance(studentId: number): Promise<StudentAttendanceEntry[]> {
  const result = await pool.query<StudentAttendanceEntry>(
    `SELECT att_date AS "date", status
     FROM attendance
     WHERE student_id = $1
     ORDER BY att_date DESC`,
    [studentId]
  );
  return result.rows;
}

export interface StudentGradeEntry {
  subjectName: string;
  term: string;
  assessmentType: string;
  score: number;
  maxScore: number;
}

export async function getStudentGrades(studentId: number): Promise<StudentGradeEntry[]> {
  const result = await pool.query<StudentGradeEntry>(
    `SELECT
       s.name AS "subjectName",
       g.term,
       g.assessment_type AS "assessmentType",
       g.score,
       g.max_score AS "maxScore"
     FROM grades g
     JOIN subjects s ON s.id = g.subject_id
     WHERE g.student_id = $1
     ORDER BY g.created_at DESC`,
    [studentId]
  );
  return result.rows;
}
