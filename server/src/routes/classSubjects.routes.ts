import { Router } from "express";
import { postClassSubject, getClassSubjects } from "../controllers/classSubjects.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/", authenticate, authorize("admin"), postClassSubject);
router.get("/", authenticate, authorize("admin"), getClassSubjects);

export default router;
