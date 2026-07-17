import { z } from "zod";

export const terms = ["Term 1", "Term 2", "Term 3"] as const;

export const assessmentTypes = [
  "Quiz", "Exam", "Homework", "Project", "Participation",
] as const;

export const submitGradeSchema = z.object({
  studentId: z.number().int().positive("Student is required"),
  term: z.enum(terms, { errorMap: () => ({ message: "Please select a valid term" }) }),
  assessmentType: z.enum(assessmentTypes, {
    errorMap: () => ({ message: "Please select a valid assessment type" }),
  }),
  score: z.number().nonnegative("Score can't be negative"),
  maxScore: z.number().positive("Max score must be greater than 0").default(100),
});

export type SubmitGradeInput = z.infer<typeof submitGradeSchema>;
