import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authorizeRole, verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get(
  "/stats",
  verifyToken,
  authorizeRole(["admin", "receptionist", "doctor", "pharmacist"]),
  getDashboardStats,
);

export default router;
