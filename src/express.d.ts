import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // Hier kannst du den Typ anpassen, je nachdem, was dein JWT-Dekodierungsprozess zurückgibt
    }
  }
}
