import { pool } from "../config/db";
import { CreateEnrollmentInput } from "../validators/enrollments.schema";

export interface EnrollmentRecord {
  id: number;
  student_id: number;
  class_id: number;
  academic_year_id: number;
}

export async function createEnrollment(
  input: CreateEnrollmentInput
): Promise<EnrollmentRecord> {
  const result = await pool.query<EnrollmentRecord>(
    `INSERT INTO enrollments (student_id, class_id, academic_year_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.studentId, input.classId, input.academicYearId]
  );
  return result.rows[0];
}

export interface EnrollmentView {
  id: number;
  studentName: string;
  className: string;
  academicYear: string;
}

export async function listEnrollments(): Promise<EnrollmentView[]> {
  const result = await pool.query<EnrollmentView>(
    `SELECT
       e.id,
       u.full_name AS "studentName",
       c.name AS "className",
       ay.label AS "academicYear"
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN classes c ON c.id = e.class_id
     JOIN academic_years ay ON ay.id = e.academic_year_id
     ORDER BY c.name, u.full_name`
  );
  return result.rows;
}
