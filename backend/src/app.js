import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRoutes from "./routes/health.routes.js";

const app = express();

// Add security-related HTTP headers.
app.use(helmet());

// Allow requests from our local React frontend.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

// Parse incoming JSON request bodies.
app.use(express.json());

// Register API routes.
app.use("/api/health", healthRoutes);

export default app;
