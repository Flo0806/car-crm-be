import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "your-secret-key";

// Middleware zur Überprüfung des x-access-token
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  // Extrahiere das Token aus dem Header
  const token = req.headers["x-access-token"] as string;

  if (!token) {
    return res.status(403).json({ message: "Access token missing" });
  }

  try {
    // Verifiziere das Token
    const decoded = jwt.verify(token, secretKey);
    // Füge die decodierten Daten (falls benötigt) zur Anfrage hinzu
    req.user = decoded;
    // Gehe zur nächsten Middleware oder Route weiter
    next();
  } catch (err) {
    // Token ist ungültig oder abgelaufen
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};
