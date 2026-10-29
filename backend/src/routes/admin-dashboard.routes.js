import { Router } from "express";
import { getAdminDashboardController } from "../controllers/admin-dashboard.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/authorize-admin.middleware.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requireAdmin,
  getAdminDashboardController,
);

export default router;
