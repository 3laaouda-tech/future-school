import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100, "Subject name is too long"),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = createSubjectSchema;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
