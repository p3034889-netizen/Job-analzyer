import { analyzeATS } from "../utilses/utiles.ats.js";

export const analyzeResumeATS = (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim() ===" ") {
      return res.status(400).json({ message: "Resume text missing" });
    }

    const result = analyzeATS(resumeText);

    res.json({
      score: result.score,
      matched: result.matched,
      missing: result.missing
    });

  } catch (err) {
    res.status(500).json({ message: "ATS analysis failed" });
  }
};
