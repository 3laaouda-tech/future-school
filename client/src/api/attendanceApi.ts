import { apiFetch } from "./client";
import type { StudentInClass, AttendanceRecordView, AttendanceStatus } from "../types/attendance";

export function getClassStudentsRequest(
  classId: number,
  token: string
): Promise<{ students: StudentInClass[] }> {
  return apiFetch<{ students: StudentInClass[] }>(`/teacher/classes/${classId}/students`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAttendanceRequest(
  classId: number,
  date: string,
  token: string
): Promise<{ records: AttendanceRecordView[] }> {
  return apiFetch<{ records: AttendanceRecordView[] }>(
    `/teacher/classes/${classId}/attendance?date=${date}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function submitAttendanceRequest(
  classId: number,
  date: string,
  records: { studentId: number; status: AttendanceStatus }[],
  token: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/teacher/classes/${classId}/attendance`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ date, records }),
  });
}
