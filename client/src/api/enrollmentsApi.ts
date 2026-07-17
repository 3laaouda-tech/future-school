import { apiFetch } from "./client";
import type { EnrollmentView } from "../types/enrollments";

interface CreateEnrollmentPayload {
  studentId: number;
  classId: number;
  academicYear: string;
}

export function getEnrollmentsRequest(token: string): Promise<{ enrollments: EnrollmentView[] }> {
  return apiFetch<{ enrollments: EnrollmentView[] }>("/enrollments", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createEnrollmentRequest(
  payload: CreateEnrollmentPayload,
  token: string
): Promise<{ enrollment: unknown }> {
  return apiFetch<{ enrollment: unknown }>("/enrollments", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
