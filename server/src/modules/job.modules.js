import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      default: "Remote"
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract"],
      default: "Full-time"
    },

    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid", "Senior"],
      default: "Fresher"
    },

    skills: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],

    description: {
      type: String,
      required: true
    },

    salary: {
      type: String
    },

    applyLink: {
      type: String,
      required: true
    },

    postedBy: {
      type: String, // company HR / admin
    },

    isRemote: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
