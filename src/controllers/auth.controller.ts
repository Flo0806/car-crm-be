import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

/**
 * @desc Authenticate user and return a token
 * @route POST /auth/login
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - JWT token or error message
 */
export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
