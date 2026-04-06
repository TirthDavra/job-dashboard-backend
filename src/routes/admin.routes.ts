import { Router } from "express";
import { getAdminDashboard } from "../controller/admin-dashboard.controller";
import { protect } from "../common/middleware/auth.middleware";
import { authorize } from "../common/middleware/authorize";

const router = Router();

router.get(
    "/dashboard",
    protect,
    authorize(["admin"]),
    getAdminDashboard
);

export default router;
