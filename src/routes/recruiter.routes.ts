import { Router } from "express";
import { getRecruiterDashboard } from "../controller/recruiter-dashboard.controller";
import { protect } from "../common/middleware/auth.middleware";
import { authorize } from "../common/middleware/authorize";

const router = Router();

router.get(
    "/dashboard",
    protect,
    authorize(["recruiter"]),
    getRecruiterDashboard
);

export default router;
