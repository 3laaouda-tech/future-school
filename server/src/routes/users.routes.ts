import { Router } from "express";
import { getUsers, putUser, deleteUserHandler } from "../controllers/users.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/", authenticate, authorize("admin"), getUsers);
router.put("/:id", authenticate, authorize("admin"), putUser);
router.delete("/:id", authenticate, authorize("admin"), deleteUserHandler);

export default router;
