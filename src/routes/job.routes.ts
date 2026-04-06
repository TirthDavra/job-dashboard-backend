import { Router } from "express";
import {
    createJob,
    getAllJobs,
    getRecruiterJobs,
    closeJob,
    deleteJob,
} from "../controller/job.controller";
import { getApplicationsForJob } from "../controller/application.controller";
import { validate } from "../common/middleware/validate";
import { createJobSchema } from "../validations/job.validation";
import { protect } from "../common/middleware/auth.middleware";
import { authorize } from "../common/middleware/authorize";

const router = Router();

router.get(
    "/my",
    protect,
    authorize(["recruiter"]),
    getRecruiterJobs
);
router.get(
    "/:jobId/applications",
    protect,
    authorize(["recruiter"]),
    getApplicationsForJob
);
router.patch(
    "/:jobId/close",
    protect,
    authorize(["recruiter"]),
    closeJob
);
router.delete(
    "/:jobId",
    protect,
    authorize(["recruiter"]),
    deleteJob
);
router.get("/", getAllJobs);
router.post(
    "/create-job",
    protect,
    authorize(["recruiter"]),
    validate(createJobSchema),
    createJob
);

export default router;
