export function cleanText(text = "") { 
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


import { IT_DOMAINS, detectITDomain } from "./it.domain.js";

export function analyzeATS(resumeText) {
  const text = cleanText(resumeText);

  const domain = detectITDomain(text);

  const coreSkills = IT_DOMAINS[domain] || [];
  const softSkills = IT_DOMAINS.soft_skills || [];

  const matched = [];
  const missing = [];

  coreSkills.forEach(skill => {
    if (text.includes(skill)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  let softScore = 0;
  softSkills.forEach(skill => {
    if (text.includes(skill)) {
      softScore += 2;
    }
  });

  
  const skillScore = coreSkills.length
    ? (matched.length / coreSkills.length) * 70
    : 0;

  const extraScore =
    (text.includes("project") || text.includes("intern") ? 15 : 0) +
    (text.includes("degree") || text.includes("btech") ? 10 : 0) +
    softScore;

  const score = Math.min(95, Math.round(skillScore + extraScore));

  
  return {
    domain,        
    score,        
    matched,       
    missing        
  };
}
