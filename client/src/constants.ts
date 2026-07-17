// These must stay in sync with the matching Zod enums on the backend
// (server/src/validators/classes.schema.ts and grades.schema.ts).
export const gradeLevels = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
] as const;

export const terms = ["Term 1", "Term 2", "Term 3"] as const;

export const assessmentTypes = [
  "Quiz", "Exam", "Homework", "Project", "Participation",
] as const;
