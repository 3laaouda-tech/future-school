import { z } from "zod";

export const submitGradeSchema = z.object({
  studentId: z.number().int().positive("Student is required"),
  term: z.string().min(1, "Term is required").max(20, "Term is too long"),
  assessmentType: z
    .string()
    .min(1, "Assessment type is required")
    .max(50, "Assessment type is too long"),
  score: z.number().nonnegative("Score can't be negative"),
  maxScore: z.number().positive("Max score must be greater than 0").default(100),
});

export type SubmitGradeInput = z.infer<typeof submitGradeSchema>;
