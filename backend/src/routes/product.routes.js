import { Router } from "express";

import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";

const router = Router();

router
  .route("/")
  .post(createProductController)
  .get(getProductsController);

router
  .route("/:id")
  .get(getProductByIdController)
  .put(updateProductController)
  .delete(deleteProductController);

export default router;
