import { analyzeATS } from "../utilses/utiles.ats.js";

export const analyzeResumeATS = (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ message: "Resume text missing" });
    }

    const result = analyzeATS(resumeText);

    res.json({
      domain: result.domain,     //  REQUIRED by frontend
      score: result.score,
      matched: result.matched,
      missing: result.missing
    });

  } catch (err) {
    console.error("ATS ERROR:", err);
    res.status(500).json({ message: "ATS analysis failed" });
  }
};
