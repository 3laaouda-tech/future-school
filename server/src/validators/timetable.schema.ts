import { z } from "zod";

export const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday"] as const;

// Fixed period times - not stored in the database, just a shared reference
// both the backend (for validation) and frontend (for display) use.
export const periods = [
  { period: 1, start: "08:00", end: "08:45" },
  { period: 2, start: "08:45", end: "09:30" },
  { period: 3, start: "09:30", end: "10:15" },
  { period: 4, start: "10:15", end: "11:00" },
  { period: 5, start: "11:15", end: "12:00" },
  { period: 6, start: "12:00", end: "12:45" },
  { period: 7, start: "12:45", end: "13:30" },
] as const;

export const createTimetableEntrySchema = z.object({
  classSubjectId: z.number().int().positive("Please select a subject"),
  dayOfWeek: z.enum(daysOfWeek, { errorMap: () => ({ message: "Invalid day" }) }),
  period: z.number().int().min(1).max(7),
});

export type CreateTimetableEntryInput = z.infer<typeof createTimetableEntrySchema>;
