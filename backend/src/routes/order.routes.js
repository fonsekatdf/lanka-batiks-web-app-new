import { Router } from "express";

import {
  createOrderController,
  getMyOrdersController,
  getOrderByIdController,
  getAllOrdersController,
  updateOrderStatusController,
} from "../controllers/order.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/authorize-admin.middleware.js";

const router = Router();

// Every order endpoint requires authentication.
router.use(authenticateToken);

// Admin-only routes must appear before the general /:id route.
router.get("/admin/all", requireAdmin, getAllOrdersController);
router.patch(
  "/admin/:id/status",
  requireAdmin,
  updateOrderStatusController,
);

// Customer order endpoints.
router.get("/", getMyOrdersController);
router.get("/:id", getOrderByIdController);
router.post("/", createOrderController);

export default router;
