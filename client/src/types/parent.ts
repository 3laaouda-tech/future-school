export interface ChildView {
  studentId: number;
  studentName: string;
  relationship: string;
}

export interface ChildDetails {
  class: { classId: number; className: string; academicYear: string } | null;
  subjects: { subjectId: number; subjectName: string; teacherName: string }[];
  attendance: { date: string; status: string }[];
  grades: {
    subjectName: string;
    term: string;
    assessmentType: string;
    score: number;
    maxScore: number;
  }[];
}
