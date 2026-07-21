import { apiFetch } from "./client";
import type { TeacherClass } from "../types/teacher";
import type { TimetableEntryView } from "../types/timetable";

export function getMyClassesRequest(token: string): Promise<{ classes: TeacherClass[] }> {
  return apiFetch<{ classes: TeacherClass[] }>("/teacher/my-classes", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getMyTeacherTimetableRequest(
  token: string
): Promise<{ entries: TimetableEntryView[] }> {
  return apiFetch<{ entries: TimetableEntryView[] }>("/teacher/my-timetable", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
