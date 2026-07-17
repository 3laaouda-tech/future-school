import { z } from "zod";

export const relationshipTypes = ["father", "mother", "guardian"] as const;

export const createParentStudentSchema = z.object({
  parentId: z.number().int().positive("Parent is required"),
  studentId: z.number().int().positive("Student is required"),
  relationship: z.enum(relationshipTypes),
});

export type CreateParentStudentInput = z.infer<typeof createParentStudentSchema>;
