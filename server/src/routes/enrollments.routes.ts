import { Router } from "express";
import { postEnrollment, getEnrollments } from "../controllers/enrollments.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/", authenticate, authorize("admin"), postEnrollment);
router.get("/", authenticate, authorize("admin"), getEnrollments);

export default router;
