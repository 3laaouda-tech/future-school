import { Router } from "express";
import {
  getMyClasses,
  getClassStudents,
  getAttendance,
  postAttendance,
  getGrades,
  postGrade,
  getMyTimetable,
} from "../controllers/teacher.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/my-classes", authenticate, authorize("teacher"), getMyClasses);
router.get("/classes/:classId/students", authenticate, authorize("teacher"), getClassStudents);
router.get("/classes/:classId/attendance", authenticate, authorize("teacher"), getAttendance);
router.post("/classes/:classId/attendance", authenticate, authorize("teacher"), postAttendance);
router.get(
  "/classes/:classId/subjects/:subjectId/grades",
  authenticate,
  authorize("teacher"),
  getGrades
);
router.post(
  "/classes/:classId/subjects/:subjectId/grades",
  authenticate,
  authorize("teacher"),
  postGrade
);
router.get("/my-timetable", authenticate, authorize("teacher"), getMyTimetable);

export default router;
