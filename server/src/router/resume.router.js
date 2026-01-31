import express from "express";
import multer from "multer";
import { analyzeResumeATS } from "../controllers/resume.controller.js";
import { extractText } from "../utilses/utilses.resume.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ATS analysis */
router.post("/ats", analyzeResumeATS);

/* Resume upload (PDF / DOCX) */
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const text = await extractText(req.file);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "File parsing failed" });
  }
});

export default router;
