import { pool } from "../config/db";
import { SubmitGradeInput } from "../validators/grades.schema";

// Checks that this teacher is specifically assigned to teach this
// subject in this class (not just any subject in the class).
export async function verifyTeacherOwnsClassSubject(
  teacherId: number,
  classId: number,
  subjectId: number
): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM class_subjects
     WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3
     LIMIT 1`,
    [teacherId, classId, subjectId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function createGrade(
  classId: number,
  subjectId: number,
  recordedBy: number,
  input: SubmitGradeInput
) {
  const result = await pool.query(
    `INSERT INTO grades (student_id, subject_id, class_id, term, assessment_type, score, max_score, recorded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.studentId,
      subjectId,
      classId,
      input.term,
      input.assessmentType,
      input.score,
      input.maxScore,
      recordedBy,
    ]
  );
  return result.rows[0];
}

export interface GradeView {
  id: number;
  studentId: number;
  studentName: string;
  term: string;
  assessmentType: string;
  score: number;
  maxScore: number;
}

export async function listGradesForClassSubject(
  classId: number,
  subjectId: number
): Promise<GradeView[]> {
  const result = await pool.query<GradeView>(
    `SELECT
       g.id,
       g.student_id AS "studentId",
       u.full_name AS "studentName",
       g.term,
       g.assessment_type AS "assessmentType",
       g.score,
       g.max_score AS "maxScore"
     FROM grades g
     JOIN users u ON u.id = g.student_id
     WHERE g.class_id = $1 AND g.subject_id = $2
     ORDER BY u.full_name, g.created_at DESC`,
    [classId, subjectId]
  );
  return result.rows;
}
