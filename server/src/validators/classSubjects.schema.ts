import { z } from "zod";

export const createClassSubjectSchema = z.object({
  classId: z.number().int().positive("Class is required"),
  subjectId: z.number().int().positive("Subject is required"),
  teacherId: z.number().int().positive("Teacher is required"),
});

export type CreateClassSubjectInput = z.infer<typeof createClassSubjectSchema>;
