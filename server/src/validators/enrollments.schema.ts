import { z } from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z.number().int().positive("Student is required"),
  classId: z.number().int().positive("Class is required"),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Academic year must look like "2026-2027"'),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
