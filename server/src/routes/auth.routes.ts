import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/login", login);

// only a logged-in Admin can create new users
router.post("/register", authenticate, authorize("admin"), register);

export default router;
