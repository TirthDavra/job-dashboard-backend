import { Router } from "express";
import { register, login } from "../controller/auth.controller";
import { validate } from "../common/middleware/validate";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;