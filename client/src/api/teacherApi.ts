import { apiFetch } from "./client";
import type { TeacherClass } from "../types/teacher";

export function getMyClassesRequest(token: string): Promise<{ classes: TeacherClass[] }> {
  return apiFetch<{ classes: TeacherClass[] }>("/teacher/my-classes", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
