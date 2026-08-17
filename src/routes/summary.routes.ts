import { Router } from "express";
import { SummaryController } from "../controllers/summary.controller";
import { isAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(isAuth); // Protect routes

router.get("/", SummaryController.getSummary);
router.get("/export", SummaryController.exportSummaryExcel);
router.get('/row/:pfi', SummaryController.getSelectedRowData)
router.put('/row/:pfi', SummaryController.updateRow)

export default router;
