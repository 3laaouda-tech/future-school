import { pool } from "../config/db";

export interface StudentInClass {
  id: number;
  fullName: string;
}

// Checks that a teacher is actually assigned to teach at least one
// subject in this class, before letting them touch its students/attendance.
export async function verifyTeacherOwnsClass(
  teacherId: number,
  classId: number
): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM class_subjects WHERE teacher_id = $1 AND class_id = $2 LIMIT 1`,
    [teacherId, classId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getStudentsInClass(classId: number): Promise<StudentInClass[]> {
  const result = await pool.query<StudentInClass>(
    `SELECT u.id, u.full_name AS "fullName"
     FROM enrollments e
     JOIN students s ON s.user_id = e.student_id
     JOIN users u ON u.id = s.user_id
     WHERE e.class_id = $1
     ORDER BY u.full_name`,
    [classId]
  );
  return result.rows;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecordInput {
  studentId: number;
  status: AttendanceStatus;
}

// Saves attendance for a whole class on a given date. Uses "upsert" so
// re-submitting the same day (e.g. correcting a mistake) updates the
// existing rows instead of failing on the unique constraint.
export async function saveAttendance(
  classId: number,
  teacherId: number,
  date: string,
  records: AttendanceRecordInput[]
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const record of records) {
      await client.query(
        `INSERT INTO attendance (student_id, class_id, att_date, status, recorded_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, class_id, att_date)
         DO UPDATE SET status = EXCLUDED.status, recorded_by = EXCLUDED.recorded_by`,
        [record.studentId, classId, date, record.status, teacherId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export interface AttendanceRecordView {
  studentId: number;
  status: AttendanceStatus;
}

// Fetches any attendance already saved for this class+date, so the
// teacher's form can be pre-filled if they revisit the same day.
export async function getAttendanceForDate(
  classId: number,
  date: string
): Promise<AttendanceRecordView[]> {
  const result = await pool.query<AttendanceRecordView>(
    `SELECT student_id AS "studentId", status
     FROM attendance
     WHERE class_id = $1 AND att_date = $2`,
    [classId, date]
  );
  return result.rows;
}
