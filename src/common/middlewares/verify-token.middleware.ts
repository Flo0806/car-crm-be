import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "your-secret-key";

// Middleware for auth
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  // Extact the token from header
  const token = req.headers["x-access-token"] as string;

  if (!token) {
    return res.status(403).json({ message: "Access token missing" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded;

    // Go to next route
    next();
  } catch (err) {
    // Token is expired or invalid
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};
