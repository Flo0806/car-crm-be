import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import * as path from "path";
import * as fs from "fs";

import authRoutes from "./routes/auth.route";
import customerRoutes from "./routes/customer.route";
import importRoutes from "./routes/import.route";
import userRoutes from "./routes/user.route";
import cors from "cors";

const app = express();
app.use(cors());

// Middleware
app.use(express.json()); // Bodyparser

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected");

    // const collections = await mongoose.connection!.db!.collections();
    // console.log("COLLECTIONS", collections);
    // for (let collection of collections) {
    //   await collection.deleteMany({});
    // }

    // console.log("Alle Daten erfolgreich gelöscht.");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1); // Exit server if connection failed
  }
};

// We need a uploads folder - This folder will not be included into our git
// So check if we need to create it:
const uploadsDir = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Uploads folder created.");
}

// Routes
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/import", importRoutes);
app.use("/users", userRoutes);

// Start connection to db
connectDB();

export default app;
