import { apiFetch } from "./client";
import type { AcademicYear } from "../types/academicYears";

export function getAcademicYearsRequest(
  token: string
): Promise<{ academicYears: AcademicYear[] }> {
  return apiFetch<{ academicYears: AcademicYear[] }>("/academic-years", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createAcademicYearRequest(
  label: string,
  token: string
): Promise<{ academicYear: AcademicYear }> {
  return apiFetch<{ academicYear: AcademicYear }>("/academic-years", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ label }),
  });
}

export function setCurrentAcademicYearRequest(
  id: number,
  token: string
): Promise<{ academicYear: AcademicYear }> {
  return apiFetch<{ academicYear: AcademicYear }>(`/academic-years/${id}/set-current`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteAcademicYearRequest(
  id: number,
  token: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/academic-years/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
