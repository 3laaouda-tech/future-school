import { Router } from "express";
import {
  getClassTimetable,
  postTimetableEntry,
  deleteTimetableEntryHandler,
} from "../controllers/timetable.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/", authenticate, authorize("admin"), getClassTimetable);
router.post("/", authenticate, authorize("admin"), postTimetableEntry);
router.delete("/:id", authenticate, authorize("admin"), deleteTimetableEntryHandler);

export default router;
