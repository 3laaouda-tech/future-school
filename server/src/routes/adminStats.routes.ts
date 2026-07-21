import { Router } from "express";
import { getStats } from "../controllers/adminStats.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/", authenticate, authorize("admin"), getStats);

export default router;
