import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import resumeRoutes from "./router/resume.router.js";
import jobRoutes from "./router/job.router.js";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use(
  express.static(
    path.join(__dirname, "../../frontend/dist")
  )
);

// ===== REACT FALLBACK (LAST!) =====
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/dist/index.html")
  );
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
