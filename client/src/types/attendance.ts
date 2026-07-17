export interface StudentInClass {
  id: number;
  fullName: string;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecordView {
  studentId: number;
  status: AttendanceStatus;
}
