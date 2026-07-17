import { Router } from "express";
import { postParentStudent, getParentStudents } from "../controllers/parentStudent.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/", authenticate, authorize("admin"), postParentStudent);
router.get("/", authenticate, authorize("admin"), getParentStudents);

export default router;
