import { Router } from "express";
import { getUsers, getMe, putMe, putUser, deleteUserHandler } from "../controllers/users.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

// IMPORTANT: /me routes must come before /:id, otherwise Express would
// match "me" as the :id parameter.
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, putMe);

router.get("/", authenticate, authorize("admin"), getUsers);
router.put("/:id", authenticate, authorize("admin"), putUser);
router.delete("/:id", authenticate, authorize("admin"), deleteUserHandler);

export default router;
