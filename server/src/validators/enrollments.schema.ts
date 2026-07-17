import { z } from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z.number().int().positive("Student is required"),
  classId: z.number().int().positive("Class is required"),
  academicYearId: z.number().int().positive("Academic year is required"),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
