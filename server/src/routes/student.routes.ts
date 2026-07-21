import { Router } from "express";
import {
  getMyClass,
  getMyAttendance,
  getMyGrades,
  getMyTimetable,
} from "../controllers/student.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/my-class", authenticate, authorize("student"), getMyClass);
router.get("/my-attendance", authenticate, authorize("student"), getMyAttendance);
router.get("/my-grades", authenticate, authorize("student"), getMyGrades);
router.get("/my-timetable", authenticate, authorize("student"), getMyTimetable);

export default router;
