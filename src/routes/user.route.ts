import { Router } from "express";
import {
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();

/**
 * @route POST /users
 * @desc Create a new user
 */
router.post("/", createUser);

/**
 * @route PUT /users/:id
 * @desc Update an existing user
 */
router.put("/:id", updateUser);

/**
 * @route DELETE /users/:id
 * @desc Delete a user
 */
router.delete("/:id", deleteUser);

export default router;
