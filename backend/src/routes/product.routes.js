import { Router } from "express";

import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/authorize-admin.middleware.js";

const router = Router();

// Public routes: customers and guests can browse products.
router.get("/", getProductsController);
router.get("/:id", getProductByIdController);

// Protected routes: only authenticated administrators can modify products.
router.post("/", authenticateToken, requireAdmin, createProductController);
router.put("/:id", authenticateToken, requireAdmin, updateProductController);
router.delete("/:id", authenticateToken, requireAdmin, deleteProductController);

export default router;
