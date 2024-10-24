import { Router } from "express";
import { login, logout, refreshToken } from "../controllers/auth.controller";
import { verifyAccessToken } from "../common/middlewares/verify-token.middleware";

const router = Router();

/**
 * @route POST /auth/login
 * @desc Authenticate user
 */
router.post("/login", login);

/**
 * @route POST /auth/token
 * @desc Get new access token using refresh token
 */
router.post("/token", refreshToken);

/**
 * @route POST /auth/logout
 * @desc Logout and invalidate refresh token
 */
router.post("/logout", verifyAccessToken, logout);

export default router;
