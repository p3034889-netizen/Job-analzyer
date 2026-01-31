export const IT_DOMAINS = {
  web: [
    "html","css","javascript","react","next",
    "node","express","api","git"
  ],

  app: [
    "flutter","react native","android","kotlin",
    "swift","ios","firebase"
  ],

  cloud_devops: [
    "aws","azure","gcp","docker","kubernetes",
    "terraform","ci/cd","jenkins"
  ],

  ai_ml: [
    "python","machine learning","deep learning",
    "tensorflow","pytorch","numpy","pandas"
  ],

  gen_ai: [
    "llm","openai","langchain","prompt engineering",
    "vector database","rag"
  ],

  cybersecurity: [
    "network security","penetration testing",
    "ethical hacking","siem","firewall",
    "linux","incident response"
  ],

  data: [
    "sql","power bi","tableau",
    "data analysis","etl","big data"
  ],

  testing_qa: [
    "manual testing","automation testing",
    "selenium","cypress","test cases","api testing"
  ],

  dsa: [
    "data structures","algorithms",
    "leetcode","arrays","trees","graphs"
  ],

  project_management: [
    "agile","scrum","jira",
    "project management","sdlc"
  ],

  soft_skills: [
    "communication","problem solving",
    "critical thinking","teamwork","leadership"
  ]
};
export function detectITDomain(text) {
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s/]/g, " "); // lowercase + remove special chars
  let bestDomain = "web";
  let maxHits = 0;

  for (const domain in IT_DOMAINS) {
    const hits = IT_DOMAINS[domain].filter(skill =>
      normalizedText.includes(skill.toLowerCase())
    ).length;

    if (hits > maxHits) {
      maxHits = hits;
      bestDomain = domain;
    }
  }

  return bestDomain;
}
export function detectDomains(skills = []) {
  const domainKeys = Object.keys(IT_DOMAINS).filter(d => d !== "soft_skills");

  for (const domain of domainKeys) {
    if (skills.some(skill => IT_DOMAINS[domain].includes(skill))) {
      return domain; // first matched domain
    }
  }
  return "web"; // fallback
}
