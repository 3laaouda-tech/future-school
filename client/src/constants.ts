// These must stay in sync with the matching Zod enums on the backend
// (server/src/validators/classes.schema.ts and grades.schema.ts).
export const gradeLevels = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
] as const;

export const terms = ["Term 1", "Term 2", "Term 3"] as const;

export const assessmentTypes = [
  "Quiz", "Exam", "Homework", "Project", "Participation",
] as const;

// Must stay in sync with server/src/validators/timetable.schema.ts
export const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday"] as const;

export const dayLabels: Record<(typeof daysOfWeek)[number], string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

export const periods = [
  { period: 1, start: "08:00", end: "08:45" },
  { period: 2, start: "08:45", end: "09:30" },
  { period: 3, start: "09:30", end: "10:15" },
  { period: 4, start: "10:15", end: "11:00" },
  { period: 5, start: "11:15", end: "12:00" },
  { period: 6, start: "12:00", end: "12:45" },
  { period: 7, start: "12:45", end: "13:30" },
] as const;
