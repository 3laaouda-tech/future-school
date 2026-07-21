import { apiFetch } from "./client";
import type { TimetableEntryView } from "../types/timetable";

export function getClassTimetableRequest(
  classId: number,
  token: string
): Promise<{ entries: TimetableEntryView[] }> {
  return apiFetch<{ entries: TimetableEntryView[] }>(`/timetable?classId=${classId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createTimetableEntryRequest(
  payload: { classSubjectId: number; dayOfWeek: string; period: number },
  token: string
): Promise<{ entry: unknown }> {
  return apiFetch<{ entry: unknown }>("/timetable", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteTimetableEntryRequest(
  id: number,
  token: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/timetable/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
