import { Router } from "express";
import { getChildren, getChildDetails } from "../controllers/parent.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/my-children", authenticate, authorize("parent"), getChildren);
router.get(
  "/children/:studentId/details",
  authenticate,
  authorize("parent"),
  getChildDetails
);

export default router;
