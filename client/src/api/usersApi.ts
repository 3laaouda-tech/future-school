import { apiFetch } from "./client";
import type { User, UserRole } from "../types/auth";

interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export function createUserRequest(
  payload: CreateUserPayload,
  token: string
): Promise<{ user: User }> {
  return apiFetch<{ user: User }>("/auth/register", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function getUsersRequest(token: string): Promise<{ users: User[] }> {
  return apiFetch<{ users: User[] }>("/users", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

interface UpdateUserPayload {
  fullName: string;
  email: string;
  password?: string;
}

export function updateUserRequest(
  id: number,
  payload: UpdateUserPayload,
  token: string
): Promise<{ user: User }> {
  return apiFetch<{ user: User }>(`/users/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteUserRequest(id: number, token: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
