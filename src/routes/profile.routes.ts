import { Router } from "express";
import { getMyProfile, updateCandidateProfile } from "../controller/profile.controller";
import { validate } from "../common/middleware/validate";
import { updateCandidateProfileSchema } from "../validations/profile.validation";
import { protect } from "../common/middleware/auth.middleware";
import { authorize } from "../common/middleware/authorize";

const router = Router();

router.get(
    "/me",
    protect,
    authorize(["candidate"]),
    getMyProfile
);

router.put(
    "/me",
    protect,
    authorize(["candidate"]),
    validate(updateCandidateProfileSchema),
    updateCandidateProfile
);

export default router;
