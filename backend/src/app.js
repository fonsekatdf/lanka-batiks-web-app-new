import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRoutes from "./routes/health.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";

import {
    notFoundHandler,
    errorHandler,
} from "./middleware/error.middleware.js";

const app = express();

// Add security-related HTTP headers.
app.use(helmet());

// Allow requests from our local React frontend.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "1mb" }));

// Parse incoming JSON request bodies.
app.use(express.json());

// Register API routes.
app.use("/api/health", healthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
// Keep these handlers after all registered routes.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
