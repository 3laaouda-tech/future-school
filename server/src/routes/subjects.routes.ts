import { Router } from "express";
import { postSubject, getSubjects, putSubject, deleteSubjectHandler } from "../controllers/subjects.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/", authenticate, authorize("admin"), postSubject);
router.get("/", authenticate, authorize("admin"), getSubjects);
router.put("/:id", authenticate, authorize("admin"), putSubject);
router.delete("/:id", authenticate, authorize("admin"), deleteSubjectHandler);

export default router;
