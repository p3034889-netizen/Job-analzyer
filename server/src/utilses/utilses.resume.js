import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function extractText(file) {
  // PDF
  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  // DOCX
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer
    });
    return result.value;
  }

  throw new Error("Unsupported file type");
}
import { IT_DOMAINS } from "./it.domain.js";

export function extractSkills(resumeText = "") {
  const text = resumeText.toLowerCase();
  const foundSkills = new Set();

  for (const domain in IT_DOMAINS) {
    if (domain === "soft_skills") continue; // skip soft skills
    IT_DOMAINS[domain].forEach(skill => {
      if (text.includes(skill)) {
        foundSkills.add(skill);
      }
    });
  }

  return Array.from(foundSkills); // dynamically extracted
}
