import mongoose, { Document } from "mongoose";

interface IToken extends Document {
  token: string;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // Token expires after 7 days
  },
});

export default mongoose.model<IToken>("Token", tokenSchema);
