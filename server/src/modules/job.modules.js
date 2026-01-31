import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  score: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Resume", resumeSchema);
