import { Router } from "express";
import {
  postAcademicYear,
  getAcademicYears,
  putSetCurrent,
  deleteAcademicYearHandler,
} from "../controllers/academicYears.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/", authenticate, authorize("admin"), postAcademicYear);
router.get("/", authenticate, authorize("admin"), getAcademicYears);
router.put("/:id/set-current", authenticate, authorize("admin"), putSetCurrent);
router.delete("/:id", authenticate, authorize("admin"), deleteAcademicYearHandler);

export default router;
