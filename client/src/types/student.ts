export interface StudentClassInfo {
  classId: number;
  className: string;
  academicYear: string;
}

export interface StudentSubjectView {
  subjectId: number;
  subjectName: string;
  teacherName: string;
}

export interface StudentAttendanceEntry {
  date: string;
  status: string;
}

export interface StudentGradeEntry {
  subjectName: string;
  term: string;
  assessmentType: string;
  score: number;
  maxScore: number;
}
