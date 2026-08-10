import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { isAuth } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/isAdmin.middleware";

const router = Router();

router.use(isAuth); // Protect routes

router.get("/dashboard", WorkspaceController.getDashboard);
router.post("/", isAdmin, WorkspaceController.createWorkspace);
router.get("/:id", WorkspaceController.getWorkspace);
router.get("/", (req, res, next) => {
    if (req.query.year && req.query.month) {
        return WorkspaceController.getWorkspace(req, res);
    }
    return WorkspaceController.getWorkspaces(req, res);
});

export default router;
