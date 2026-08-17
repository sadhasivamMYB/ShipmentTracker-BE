import { Router } from "express";
import { UsersController } from "../controllers/users.controller";
import { isAdmin } from "../middleware/isAdmin.middleware";

const router = Router();


router.use(isAdmin);
router.get("/", UsersController.getAll);
router.post("/", UsersController.create);
router.put("/:id", UsersController.update);
router.delete("/:id", UsersController.delete);

export default router;
