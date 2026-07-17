import { z } from "zod";

export const attendanceStatuses = ["present", "absent", "late", "excused"] as const;

export const submitAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must look like "2026-07-15"'),
  records: z
    .array(
      z.object({
        studentId: z.number().int().positive(),
        status: z.enum(attendanceStatuses),
      })
    )
    .min(1, "At least one attendance record is required"),
});

export type SubmitAttendanceInput = z.infer<typeof submitAttendanceSchema>;
