import { Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();

/**
 * @route POST /auth/login
 * @desc Authenticate user
 */
router.post("/login", login);

export default router;
