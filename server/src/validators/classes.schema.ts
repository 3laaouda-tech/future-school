import { z } from "zod";

export const gradeLevels = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
] as const;

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required").max(100, "Class name is too long"),
  gradeLevel: z.enum(gradeLevels, {
    errorMap: () => ({ message: "Please select a valid grade level" }),
  }),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Academic year must look like "2026-2027"'),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;

// Update uses the exact same shape as create
export const updateClassSchema = createClassSchema;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
