import { pool } from "../config/db";

export interface AdminStats {
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  classCount: number;
  subjectCount: number;
  enrollmentCount: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const result = await pool.query<{
    student_count: string;
    teacher_count: string;
    parent_count: string;
    class_count: string;
    subject_count: string;
    enrollment_count: string;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE role = 'student') AS student_count,
       (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS teacher_count,
       (SELECT COUNT(*) FROM users WHERE role = 'parent') AS parent_count,
       (SELECT COUNT(*) FROM classes) AS class_count,
       (SELECT COUNT(*) FROM subjects) AS subject_count,
       (SELECT COUNT(*) FROM enrollments) AS enrollment_count`
  );

  const row = result.rows[0];
  return {
    // pg returns COUNT(*) as a string (it's a bigint) - convert to number
    studentCount: Number(row.student_count),
    teacherCount: Number(row.teacher_count),
    parentCount: Number(row.parent_count),
    classCount: Number(row.class_count),
    subjectCount: Number(row.subject_count),
    enrollmentCount: Number(row.enrollment_count),
  };
}
