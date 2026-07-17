import { apiFetch } from "./client";
import type {
  StudentClassInfo,
  StudentSubjectView,
  StudentAttendanceEntry,
  StudentGradeEntry,
} from "../types/student";

export function getMyClassRequest(
  token: string
): Promise<{ class: StudentClassInfo | null; subjects: StudentSubjectView[] }> {
  return apiFetch<{ class: StudentClassInfo | null; subjects: StudentSubjectView[] }>(
    "/student/my-class",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function getMyAttendanceRequest(
  token: string
): Promise<{ attendance: StudentAttendanceEntry[] }> {
  return apiFetch<{ attendance: StudentAttendanceEntry[] }>("/student/my-attendance", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getMyGradesRequest(token: string): Promise<{ grades: StudentGradeEntry[] }> {
  return apiFetch<{ grades: StudentGradeEntry[] }>("/student/my-grades", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
