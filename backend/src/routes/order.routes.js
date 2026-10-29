import { Router } from "express";

import {
  createOrderController,
  getMyOrdersController,
  getOrderByIdController,
} from "../controllers/order.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// All order endpoints require authentication.
router.use(authenticateToken);

// GET /api/orders - list the authenticated customer's orders.
router.get("/", getMyOrdersController);

// GET /api/orders/:id - retrieve one of the customer's orders.
router.get("/:id", getOrderByIdController);

// POST /api/orders - place an order.
router.post("/", createOrderController);

export default router;
