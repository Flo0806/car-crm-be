import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Token from "../models/token.model";

const accessTokenSecret = process.env.JWT_SECRET!;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;

/**
 * @desc Login and generate access token and refresh token
 * @route POST /auth/login
 */
export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  console.log("ENV", accessTokenSecret, refreshTokenSecret);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate access token
    const accessToken = jwt.sign({ userId: user._id }, accessTokenSecret, {
      expiresIn: "15m",
    });

    // Generate refresh token
    const refreshToken = jwt.sign({ userId: user._id }, refreshTokenSecret);

    // Speichere den Refresh Token in der Datenbank
    const tokenEntry = new Token({ token: refreshToken, userId: user._id });
    await tokenEntry.save();

    res.json({ accessToken, refreshToken });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

/**
 * @desc Refresh the access token using refresh token
 * @route POST /auth/token
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { token } = req.body;

  if (!token) {
    return res.status(403).json({ msg: "Refresh token required" });
  }

  try {
    // Prüfe, ob der Token in der Datenbank existiert
    const storedToken = await Token.findOne({ token });
    if (!storedToken) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    const decoded = jwt.verify(token, refreshTokenSecret) as any;
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      accessTokenSecret,
      { expiresIn: "15m" }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    res.status(403).json({ msg: "Invalid or expired refresh token" });
  }
};

/**
 * @desc Logout and invalidate refresh token
 * @route POST /auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<any> => {
  const { token } = req.body;

  try {
    // Lösche den Token aus der Datenbank
    await Token.findOneAndDelete({ token });

    res.json({ msg: "Logout successful" });
  } catch (err: any) {
    res.status(500).json({ msg: "Server error" });
  }
};
