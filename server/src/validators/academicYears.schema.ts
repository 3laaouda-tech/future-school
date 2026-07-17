import { z } from "zod";

export const createAcademicYearSchema = z.object({
  label: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Academic year must look like "2026-2027"'),
});

export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
