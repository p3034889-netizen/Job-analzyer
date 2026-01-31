import express from "express";
import { analyzeResumeATS} from "../controllers/resume.controller.js";
import multer from "multer";
import { extractText } from "../utilses/utilses.resume.js";

const router = express.Router();
const upload = multer();

router.post("/ats", analyzeResumeATS);
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    const text = await extractText(req.file);
    res.json({ text });
  } catch {
    res.status(400).json({ message: "File parsing failed" });
  }
});

export default router;
