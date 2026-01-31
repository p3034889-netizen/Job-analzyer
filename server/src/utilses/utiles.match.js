// utils/utiles.match.js

export function calculateJobMatch(resumeText, jobDescription) {
  if (!resumeText || !jobDescription) {
    return { percentage: 0, matched: [], missing: [] };
  }

  const clean = text =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ");

  const resumeWords = new Set(clean(resumeText).split(" "));
  const jobWords = new Set(clean(jobDescription).split(" "));

  const matched = [];
  const missing = [];

  jobWords.forEach(word => {
    if (word.length <= 2) return;

    if (resumeWords.has(word)) {
      matched.push(word);
    } else {
      missing.push(word);
    }
  });

  const percentage = Math.min(
    Math.round((matched.length / jobWords.size) * 100),
    100
  );

  return {
    percentage,
    matched: matched.slice(0, 15),
    missing: missing.slice(0, 15)
  };
}
