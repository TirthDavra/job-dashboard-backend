import { Router } from "express";
import {
    applyToJob,
    getMyAppliedJobIds,
    getMyApplicationsDetail,
    updateApplicationStatus,
} from "../controller/application.controller";
import { validate } from "../common/middleware/validate";
import {
    applyJobSchema,
    updateApplicationStatusSchema,
} from "../validations/application.validation";
import { protect } from "../common/middleware/auth.middleware";
import { authorize } from "../common/middleware/authorize";

const router = Router();

router.get(
    "/me/detail",
    protect,
    authorize(["candidate"]),
    getMyApplicationsDetail
);

router.get(
    "/me",
    protect,
    authorize(["candidate"]),
    getMyAppliedJobIds
);

router.post(
    "/",
    protect,
    authorize(["candidate"]),
    validate(applyJobSchema),
    applyToJob
);

router.patch(
    "/:id/status",
    protect,
    authorize(["recruiter"]),
    validate(updateApplicationStatusSchema),
    updateApplicationStatus
);

export default router;
