import { Router } from "express";
import { postClass, getClasses, putClass, deleteClassHandler } from "../controllers/classes.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/", authenticate, authorize("admin"), postClass);
router.get("/", authenticate, authorize("admin"), getClasses);
router.put("/:id", authenticate, authorize("admin"), putClass);
router.delete("/:id", authenticate, authorize("admin"), deleteClassHandler);

export default router;
