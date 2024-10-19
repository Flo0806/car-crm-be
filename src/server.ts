import dotenv from "dotenv";
dotenv.config();

import express from "express";
import * as path from "path";
import * as fs from "fs";

import authRoutes from "./routes/auth.route";
import customerRoutes from "./routes/customer.route";
import importRoutes from "./routes/import.route";
import userRoutes from "./routes/user.route";

const app = express();

// Middleware
app.use(express.json()); // Bodyparser

// Erstellen des Upload-Verzeichnisses, falls es nicht existiert
const uploadsDir = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Uploads folder created.");
}

// Routes
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes); // Hier wird die Route korrekt registriert
app.use("/import", importRoutes);
app.use("/users", userRoutes);

export default app;
