export type Relationship = "father" | "mother" | "guardian";

export interface ParentStudentView {
  parentId: number;
  parentName: string;
  studentId: number;
  studentName: string;
  relationship: Relationship;
}
