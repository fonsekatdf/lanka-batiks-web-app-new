import { Router } from "express";

import { createOrderController } from "../controllers/order.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Only authenticated customers can place orders.
router.post("/", authenticateToken, createOrderController);

export default router;
