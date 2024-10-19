import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import customerRoutes from "./routes/customer.route";
import importRoutes from "./routes/import.route";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Bodyparser

// MongoDB connection
const connectDB = async () => {
  try {
    console.log("HERE", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1); // Exit server if connection failed
  }
};

// Routes
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/import", importRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Start connection to db
connectDB();
