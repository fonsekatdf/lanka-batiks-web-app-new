import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Lanka Batiks API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
